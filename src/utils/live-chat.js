// import * as LivechatVisitorSDK from "@livechat/livechat-visitor-sdk";
const logger = require("@/utils/logging").getLogger("live-chat.js");
import * as CustomerSDK from "@livechat/customer-sdk"; // live chat
// customerSDK.auth.getToken().then(token => logger.debug(token));
var stripHtml = require("striptags");
var iterator = require("markdown-it-for-inline");

var md = require("markdown-it")({
  html: true,
  xhtmlOut: true,
  breaks: true,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’"
}).use(iterator, "url_new_win", "link_open", function(tokens, idx) {
  tokens[idx].attrPush(["target", "_blank"]);
});

export class LiveChat {
  constructor(store, useLocalStorage, storageKey, teneoChatHistory) {
    this.store = store;
    this.tts = store.state.tts.tts;
    this.useLocalStorage = useLocalStorage;
    this.storageKey = storageKey;
    this.teneoChatHistory = teneoChatHistory;
    this.sdk;
    this.chatId;
    this.authToken;
    this.agent = {};
    this.historyStates = {
      DONE: "DONE",
      INACTIVE: "INACTIVE",
      LOADING: "LOADING"
    };
    this.initialize();
  }

  initialize() {
    const noop = () => {};
    try {
      if (
        this.store.getters.enableLiveChat &&
        window.leopardConfig.liveChat.licenseKey
      ) {
        this.sdk = CustomerSDK.init({
          license: parseInt(window.leopardConfig.liveChat.licenseKey),
          clientId: "5e68dfc9597a892b27eb97740abe1fee"
        });

        logger.debug(`LiveChat sdk has been initialized`, this.sdk);

        // this.sdk = CustomerSDK.debug(
        //   CustomerSDK.init({
        //     license: parseInt(window.leopardConfig.liveChat.licenseKey),
        //     clientId: "5e68dfc9597a892b27eb97740abe1fee"
        //   })
        // );
        // window.sdk = this.sdk;

        this.sdk.auth
          .getToken()
          .then(token => (this.accessToken = token.accessToken));

        this.sdk.on("connected", payload => {
          logger.debug(`LiveChat > Conected`, payload);
          if (payload.chatsSummary.length > 0) {
            this.chatId = payload.chatsSummary[0].id;
            this.lastMessage =
              payload.chatsSummary[0].lastEventsPerType.message.text;
            this.lastMessageAuthorId =
              payload.chatsSummary[0].lastEventsPerType.message.author;
            logger.debug(`LiveChat > Last Author ID`, this.lastMessageAuthorId);
            logger.debug(`LiveChat > Last Message Received`, this.lastMessage);
          }
        });

        this.sdk.on("connection_lost", noop);
        this.sdk.on("connection_restored", noop);
        this.sdk.on("user_left_chat", noop);
        this.sdk.on("customer_id", noop);

        this.sdk.on("disconnected", reason => {
          logger.debug(`LiveChat > disconnected`, reason);
        });

        this.sdk.on("user_data", user => {
          logger.debug(`LiveChat > user_data`, user);
          if (user.type === "agent") {
            this.agent = user;
          }
          this.store.commit("AGENT_NAME", user.name);
          this.store.commit("AGENT_ID", user.id);
          this.store.commit("AGENT_AVATAR", user.avatar);
        });

        this.sdk.on("user_joined_chat", ({ user, chat }) => {
          logger.debug(`LiveChat > user_joined_chat`, user, chat);
          logger.debug(
            `LiveChat > user_joined_chat | isLiveChat? ${
              this.store.state.liveAgent.isLiveChat
            } | IsAgent? ${user === this.agent.id} `
          );
          this.chatId = chat;
          if (
            user === this.agent.id &&
            !this.store.state.liveAgent.isLiveChat
          ) {
            logger.debug(
              `LiveChat > Starting live chat form within - user_joined_chat`
            );
            this.startLiveChat();
          }
        });

        this.sdk.on("thread_summary", threadSummary => {
          logger.debug(`LiveChat > thread_summary`, threadSummary);
          logger.debug(`LiveChat > Thread Summary: `, threadSummary);
          this.chatId = threadSummary.chat;
          if ("lc2" in threadSummary.properties) {
            try {
              let secondsWait = threadSummary.properties.lc2.queue_waiting_time;
              let message =
                "Chat request sent to agent. You are number " +
                threadSummary.properties.lc2.queue_pos +
                " in the queue. Average wait time is " +
                (Math.floor(secondsWait / 60) +
                  " min " +
                  ("0" + Math.floor(secondsWait % 60)).slice(-2)) +
                " seconds";
              // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
              let liveChatStatus = {
                type: "liveChatQueue",
                text: message,
                bodyText: "",
                hasExtraData: false
              };
              this.store.commit(
                "PUSH_LIVE_CHAT_STATUS_TO_DIALOG",
                liveChatStatus
              ); // push the getting message onto the dialog
              this.store.commit("STOP_LIVE_CHAT"); // No need directing all inputs if no chat session started yet
            } catch (e) {
              logger.debug(`LiveChat > No lc2 in threadSummary.properties`, e);
            }
          }
        });

        this.sdk.on("new_event", ({ chat, event }) => {
          logger.debug(`LiveChat > new_event`, event.type);

          switch (event.type) {
            case "message":
              logger.debug(`LiveChat > Message Text`, event.text);
              if (!this.chatId) {
                this.chatId = chat;
              }
              logger.debug(
                `LiveChat > Is live chat enabled?`,
                this.store.state.liveAgent.isLiveChat
              );

              if (event.author === this.agent.id) {
                if (
                  !this.store.state.liveAgent.isLiveChat ||
                  !this.store.state.ui.showChatWindow
                ) {
                  this.startLiveChat();
                  logger.debug(
                    `LiveChat > Started live chat... from within new_event`
                  );
                }
                logger.debug("new message from agent - ", event.text);

                let liveChatResponse = {
                  type: "liveChatResponse",
                  text: md.render(event.text),
                  agentAvatar: this.store.getters.agentAvatar,
                  agentName: this.store.getters.agentName,
                  bodyText: "",
                  hasExtraData: false
                };
                this.store.commit(
                  "PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG",
                  liveChatResponse
                ); // push the getting message onto the dialog
                if (
                  Object.prototype.hasOwnProperty.call(
                    window,
                    "webkitSpeechRecognition"
                  ) &&
                  Object.prototype.hasOwnProperty.call(
                    window,
                    "speechSynthesis"
                  )
                ) {
                  if (this.tts && this.store.getters.speakBackResponses) {
                    this.tts.say(stripHtml(event.text));
                  }
                }

                if (this.useLocalStorage) {
                  localStorage.setItem(
                    this.storageKey + this.teneoChatHistory,
                    JSON.stringify(this.store.getters.dialog)
                  );
                }
                this.store.commit(
                  "SET_DIALOG_HISTORY",
                  JSON.parse(
                    sessionStorage.getItem(
                      this.storageKey + this.teneoChatHistory
                    )
                  )
                );
                if (this.store.getters.dialogHistory === null) {
                  this.store.commit(
                    "SET_DIALOG_HISTORY",
                    this.store.getters.dialog
                  );
                } else {
                  this.store.commit(
                    "PUSH_RESPONSE_TO_DIALOG_HISTORY",
                    liveChatResponse
                  );
                }
                sessionStorage.setItem(
                  this.storageKey + this.teneoChatHistory,
                  JSON.stringify(this.store.getters.dialogHistory)
                );
                this.store.commit("CLEAR_USER_INPUT");
              } else {
                logger.debug(
                  "LiveChat > new user message to agent - ",
                  event.text
                );
              }
              break;
            default:
              break;
          }
        });

        this.sdk.on("user_is_typing", payload => {
          logger.debug(`LiveChat > user_is_typing`);
          if (payload.user === this.agent.id) {
            this.store.commit("LIVE_CHAT_LOADING", true);
          } else {
            // user is typing something
          }
        });

        this.sdk.on("user_stopped_typing", payload => {
          logger.debug(`LiveChat > user_stopped_typing`);
          if (payload.user === this.agent.id) {
            this.store.commit("LIVE_CHAT_LOADING", false);
          } else {
            // user is typing something
          }
        });

        this.sdk.on("thread_closed", () => {
          logger.debug(`LiveChat > thread_closed`);
          if (this.store.state.liveAgent.isLiveChat) {
            let message =
              "Chat with live agent ended. You are now talking with the virtual assistant. ";
            this.store.commit("RESET_CHAT_TITLE");
            // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
            let liveChatStatus = {
              type: "liveChatEnded",
              text: message,
              bodyText: "",
              hasExtraData: false
            };
            this.store.commit(
              "PUSH_LIVE_CHAT_STATUS_TO_DIALOG",
              liveChatStatus
            ); // push the getting message onto the dialog
            this.store.commit("STOP_LIVE_CHAT");
            if (!this.store.getters.hasLoggedInTeneo) {
              this.store
                .dispatch("login")
                .then(() => {
                  logger.debug("Successfully established chat session");
                })
                .catch(err => {
                  logger.debug("ERROR LOGGING IN TO CHAT: ", err.teneoUrl);
                });
            }
          }
        });
      }
    } catch (e) {
      logger.error("LiveChat > Error Setting Up Live Chat", e);
    }
  }

  // disableLiveChat() {
  //   this.sdk.disconnect();
  //   this.sdk.destroy();
  //   this.store.commit("RESET_CHAT_TITLE");
  //   this.store.commit("STOP_LIVE_CHAT");
  // }

  startLiveChat() {
    if (!this.store.state.liveAgent.isLiveChat) {
      logger.debug(`LiveChat > startLiveChat`);
      this.store.commit(
        "CHANGE_CHAT_TITLE",
        `Speaking with ${this.agent.name}`
      );
      // show typing output agentName + ' is typing...'

      let message = "You are talking to " + this.agent.name + ".";
      this.store.commit("START_LIVE_CHAT");
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)

      let liveChatStatus = {
        type: "liveChatStatus",
        text: message,
        bodyText: "",
        hasExtraData: false
      };
      this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
      this.store
        .dispatch("openChatWindow", false)
        .then(() => {
          logger.debug("LiveChat > Successfully logged into chat");
          setTimeout(
            function() {
              this.store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
            }.bind(this),
            1500
          ); // only show the chat button after a successful login
        })
        .catch(err => {
          logger.error(
            "ERROR OPENING CHAT FROM INCOMING LIVE CHAT MESSAGE: ",
            err
          );
        });
    }
  }

  /**
   * Send a message to message to the live chat agent
   *
   * @param {*} message
   */
  sendMessage(message) {
    if (this.chatId && this.sdk) {
      logger.debug(
        "Have existing chatId and Sending message to LiveChat Agent:" + message
      );
      this.sdk
        .sendEvent(this.chatId, {
          type: "message",
          text: message
        })
        .catch(error => {
          logger.error(`Could not send message to Live Agent`, error);
        });
    } else if (this.sdk) {
      logger.debug("STARTING LiveChat with message" + message);
      this.sdk
        .startChat({
          events: [
            {
              type: "message",
              text: message
            }
          ]
        })
        .then(chat => {
          this.chatId = chat;
          logger.debug(`Live Chat Response`, chat);
        })
        .catch(error => {
          logger.error("LiveChat > Could not start a live chat message", error);
        });
    } else {
      logger.error(
        `LiveChat SDK not initialized for user`,
        this.chatId,
        this.sdk
      );
    }
  }
}
