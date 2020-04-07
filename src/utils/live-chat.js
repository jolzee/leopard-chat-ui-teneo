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
}).use(iterator, "url_new_win", "link_open", function (tokens, idx) {
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
    this.isActiveChat = false;
    this.agent = {};
    this.historyStates = {
      DONE: "DONE",
      INACTIVE: "INACTIVE",
      LOADING: "LOADING"
    };
    this.initialize();
  }

  initialize() {
    try {
      if (this.store.getters.enableLiveChat && window.leopardConfig.liveChat.licenseKey) {
        this.sdk = CustomerSDK.init({
          licenseId: parseInt(window.leopardConfig.liveChat.licenseKey),
          clientId: "5e68dfc9597a892b27eb97740abe1fee"
        });

        // this.sdk = CustomerSDK.debug(
        //   CustomerSDK.init({
        //     licenseId: parseInt(window.leopardConfig.liveChat.licenseKey),
        //     clientId: "5e68dfc9597a892b27eb97740abe1fee"
        //   })
        // );
        window.sdk = this.sdk;

        logger.debug(`LiveChat sdk has been initialized`, this.sdk);

        this.sdk.auth
          .getToken()
          .then(token => {
            logger.debug("Live Chat - Access Token", token);
            this.accessToken = token.accessToken;
          })
          .catch(error => {
            logger.error("Unable to authenticate with LiveChat", error);
          });

        //new
        this.sdk.on("availability_updated", ({ availability }) => {
          logger.debug("availability_updated", availability);
        });

        this.sdk.on("chat_deactivate", () => {
          this.stopChat();
        });

        this.sdk.on("chat_properties_updated", payload => {
          const { chatId, properties } = payload;
          logger.debug("chat_properties_updated", { chatId, properties });
        });

        this.sdk.on("chat_transferred", payload => {
          const { chatId, threadId, requesterId, transferredTo } = payload;
          logger.debug("chat_transferred", {
            chatId,
            threadId,
            requesterId,
            transferredTo
          });
        });

        this.sdk.on("connection_recovered", () => {
          logger.debug("connection_recovered");
        });

        this.sdk.on("connection_unstable", () => {
          logger.debug("connection_unstable");
        });

        this.sdk.on("event_properties_updated", payload => {
          const { chatId, threadId, eventId, properties } = payload;
          logger.debug("event_properties_updated", {
            chatId,
            threadId,
            eventId,
            properties
          });
        });

        this.sdk.on("event_updated", payload => {
          const { chatId, threadId, event } = payload;
          logger.debug("event_updated", { chatId, threadId, event });
        });

        this.sdk.on("events_marked_as_seen", payload => {
          const { chatId, userId, seenUpTo } = payload;
          logger.debug("events_marked_as_seen", { chatId, userId, seenUpTo });
        });

        this.sdk.on("incoming_chat", payload => {
          const { chat } = payload;
          const { id, access, users, properties, thread } = chat;
          logger.debug("incoming_chat", { id, access, users, properties, thread });
        });

        this.sdk.on("incoming_event", payload => {
          const { event } = payload;
          logger.debug(`LiveChat > new_event`, event);

          switch (event.type) {
            case "system_message":
              if (event.systemMessageType === "manual_archived_agent") {
                this.stopChat();
              }
              break;
            case "message":
              logger.debug(`LiveChat > Message Text`, event.text);
              // if (!this.chatId) {
              //   this.chatId = chat;
              // }
              logger.debug(
                `LiveChat > Is live chat enabled?`,
                this.store.state.liveAgent.isLiveChat
              );

              if (event.authorId === this.agent.id) {
                if (!this.store.state.liveAgent.isLiveChat || !this.store.state.ui.showChatWindow) {
                  this.startLiveChat();
                  logger.debug(`LiveChat > Started live chat... from within new_event`);
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
                this.store.commit("PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG", liveChatResponse); // push the getting message onto the dialog
                if (
                  Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
                  Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
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
                  JSON.parse(sessionStorage.getItem(this.storageKey + this.teneoChatHistory))
                );
                if (this.store.getters.dialogHistory === null) {
                  this.store.commit("SET_DIALOG_HISTORY", this.store.getters.dialog);
                } else {
                  this.store.commit("PUSH_RESPONSE_TO_DIALOG_HISTORY", liveChatResponse);
                }
                sessionStorage.setItem(
                  this.storageKey + this.teneoChatHistory,
                  JSON.stringify(this.store.getters.dialogHistory)
                );
                this.store.commit("CLEAR_USER_INPUT");
              } else {
                logger.debug("LiveChat > new user message to agent - ", event.text);
              }
              break;
            default:
              break;
          }
        });

        this.sdk.on("incoming_greeting", payload => {
          const { text, agent } = payload;
          const { name } = agent;
          logger.debug(`Received a greeting with "${text}" text content from ${name}.`);
        });

        this.sdk.on("incoming_typing_indicator", payload => {
          logger.debug(`LiveChat > user_is_typing`);
          if (
            payload.typingIndicator.isTyping &&
            payload.typingIndicator.authorId === this.agent.id
          ) {
            this.store.commit("LIVE_CHAT_LOADING", true);
          } else if (
            !payload.typingIndicator.isTyping &&
            payload.typingIndicator.authorId === this.agent.id
          ) {
            this.store.commit("LIVE_CHAT_LOADING", false);
          }
        });

        this.sdk.on("queue_position_updated", payload => {
          logger.debug(payload.chatId);
          logger.debug(payload.threadId);
          logger.debug(payload.queue.position);
          logger.debug(payload.queue.waitTime);
        });

        this.sdk.on("user_added_to_chat", payload => {
          const { chatId, user, present } = payload;
          logger.debug("LiveChat > user_joined_chat", { chatId, user, present });

          this.chatId = chatId;
          if (user.type === "agent" && !this.store.state.liveAgent.isLiveChat) {
            this.agent = user;
            this.store.commit("AGENT_NAME", user.name);
            this.store.commit("AGENT_ID", user.id);
            this.store.commit("AGENT_AVATAR", user.avatar);
            logger.debug(`LiveChat > Starting live chat form within - user_added_to_chat`);
            this.startLiveChat();
          }
        });

        this.sdk.on("connected", payload => {
          logger.debug(`CUSTOMER DATA`, payload.customer);
          logger.debug(`LiveChat > Conected`, payload);
          this.sdk.listChats().then(existingChats => {
            logger.info(`Existing LiveChats`, existingChats);
            if (existingChats.chatsSummary.length > 0) {
              this.chatId = existingChats.chatsSummary[0].id;
              this.lastMessage = existingChats.chatsSummary[0].lastEventsPerType.message.text;
              this.lastMessageAuthorId =
                existingChats.chatsSummary[0].lastEventsPerType.message.author;
              this.isActiveChat = existingChats.chatsSummary[0].active;
            }
          });
        });
      }
    } catch (e) {
      logger.error("LiveChat > Error Setting Up Live Chat", e);
    }
  }

  stopChat() {
    this.store.commit("LIVE_CHAT_LOADING", false);
    logger.debug(`LiveChat > chat_deactivate`);
    if (this.store.state.liveAgent.isLiveChat) {
      let message = "Chat with live agent ended. You are now talking with the virtual assistant. ";
      this.store.commit("RESET_CHAT_TITLE");
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      let liveChatStatus = {
        type: "liveChatEnded",
        text: message,
        bodyText: "",
        hasExtraData: false
      };
      this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
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
      this.store.commit("CHANGE_CHAT_TITLE", `Speaking with ${this.agent.name}`);
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
            function () {
              this.store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
            }.bind(this),
            1500
          ); // only show the chat button after a successful login
        })
        .catch(err => {
          logger.error("ERROR OPENING CHAT FROM INCOMING LIVE CHAT MESSAGE: ", err);
        });
    }
  }

  /**
   * Send a message to message to the live chat agent
   *
   * @param {*} message
   */
  sendMessage(message) {
    if (!this.chatId && this.sdk) {
      this.sdk.listChats().then(existingChats => {
        logger.info(`Existing LiveChats`, existingChats);
        if (existingChats.chatsSummary.length > 0) {
          this.chatId = existingChats.chatsSummary[0].id;
          this.communicateWithAgent(message);
        }
      });
    } else if (this.chatId && this.sdk) {
      this.communicateWithAgent(message);
    }
  }

  communicateWithAgent(message) {
    if (this.chatId && this.sdk && this.isActiveChat) {
      logger.debug(
        "Have existing chatId, chat is active and Sending message to LiveChat Agent:" + message
      );
      this.sdk
        .sendEvent({
          chatId: this.chatId,
          event: {
            type: "message",
            text: message
          }
        })
        .catch(error => {
          logger.error(`Could not send message to Live Agent`, error);
        });
    } else if (this.chatId && this.sdk && !this.isActiveChat) {
      logger.debug(
        "Have existing chatId, chat not active and Sending message to LiveChat Agent:" + message
      );
      // this.sdk
      //   .sendEvent({
      //     chatId: this.chatId,
      //     event: {
      //       type: "message",
      //       text: message
      //     }
      //   })
      //   .then(event => {
      //     logger.debug(event);
      //   })
      //   .catch(error => {
      //     logger.debug(error);
      //   });

      this.sdk
        .activateChat({
          chat: {
            id: this.chatId,
            thread: {
              events: [
                {
                  type: "message",
                  text: message
                }
              ]
            }
          }
        })
        .then(response => {
          logger.debug(`Live Chat Chat Reactivation`, response);
          this.chatId = response.chat.id;
          this.isActiveChat = response.chat.thread.active;
          this.displayQueueNotification(response);
        })
        .catch(error => {
          logger.error("LiveChat > Could not start a live chat message", error);
        });
    } else if (this.sdk) {
      logger.debug("STARTING LiveChat with message" + message);
      // .startChat({
      //     events: [
      //       {
      //         type: "message",
      //         text: message
      //       }
      //     ]
      //   })
      this.sdk
        .startChat({
          chat: {
            thread: {
              events: [
                {
                  type: "message",
                  text: message
                }
              ]
            }
          }
        })
        .then(chat => {
          this.chatId = chat;
          logger.debug(`Live Chat Response`, chat);
        })
        .catch(error => {
          logger.error("LiveChat > Could not start a live chat message", error);
        });
    } else {
      logger.error(`LiveChat SDK not initialized for user`, this.chatId, this.sdk);
    }
  }

  displayQueueNotification(response) {
    try {
      let secondsWait = response.chat.thread.queue.waitTime;
      let message =
        "Chat request sent to agent. You are number " +
        response.chat.thread.queue.position +
        " in the queue. Average wait time is " +
        (Math.floor(secondsWait / 60) + " min " + ("0" + Math.floor(secondsWait % 60)).slice(-2)) +
        " seconds";
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      let liveChatStatus = {
        type: "liveChatQueue",
        text: message,
        bodyText: "",
        hasExtraData: false
      };
      this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
      this.store.commit("STOP_LIVE_CHAT"); // No need directing all inputs if no chat session started yet
    } catch (e) {
      logger.error(`LiveChat > Remue/Start Chat`, e);
    }
  }
}
