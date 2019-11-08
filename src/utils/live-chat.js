import * as LivechatVisitorSDK from "@livechat/livechat-visitor-sdk"; // live chat
var stripHtml = require("striptags");

export class LiveChat {
  constructor(store, useLocalStorage, storageKey, teneoChatHistory) {
    this.store = store;
    this.tts = store.state.tts.tts;
    this.useLocalStorage = useLocalStorage;
    this.storageKey = storageKey;
    this.teneoChatHistory = teneoChatHistory;
    this.visitorSDK;
    this.initialize();
  }

  initialize() {
    try {
      if (this.store.getters.enableLiveChat && process.env.VUE_APP_LIVE_CHAT_INC_KEY) {
        const liveChatIncLicense = process.env.VUE_APP_LIVE_CHAT_INC_KEY; // change me https://www.livechatinc.com/
        this.visitorSDK = LivechatVisitorSDK.init({
          license: liveChatIncLicense
        });

        this.visitorSDK.on("new_invitation", () => {
          console.log(`new_invitation`);
        });

        this.visitorSDK.on("chat_started", () => {
          console.log(`chat_started`);
        });

        this.visitorSDK.on("visitor_queued", queueData => {
          console.log(`visitor_queued`);
          // console.log(queueData);
          let message = "Chat request sent to agent. You are number " + queueData.numberInQueue + " in the queue.";
          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
          let liveChatStatus = {
            type: "liveChatQueue",
            text: message,
            bodyText: "",
            hasExtraData: false
          };
          this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
        });

        this.visitorSDK.on("agent_changed", newAgent => {
          console.log(`agent_changed`);
          // console.log(newAgent);
          this.store.commit("AGENT_NAME", newAgent.name);
          this.store.commit("AGENT_ID", newAgent.id);
          this.store.commit("AGENT_AVATAR", newAgent.avatarUrl);
          this.store.commit("CHANGE_CHAT_TITLE", `Speaking with ${newAgent.name}`);

          this.store.commit("START_LIVE_CHAT");
          // show typing output agentName + ' is typing...'

          let message = "You are talking to " + newAgent.name + ".";

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
              // console.log("Successfully logged into chat");
              setTimeout(
                function() {
                  this.store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
                }.bind(this),
                1500
              ); // only show the chat button after a successful login
            })
            .catch(err => {
              console.log("ERROR OPENING CHAT FORM INCOMING LIVE CHAT MESSAGE: ", err.message);
            });
        });

        this.visitorSDK.on("chat_ended", () => {
          console.log(`chat_ended`);
          // console.log("chat ended");
          let message = "Chat with live agent ended.";
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
                console.log("Successfully established chat session");
              })
              .catch(err => {
                console.log("ERROR LOGGING IN TO CHAT: ", err.message);
              });
          }
        });

        this.visitorSDK.on("typing_indicator", data => {
          this.store.commit("LIVE_CHAT_LOADING", !!data.isTyping);
        });

        this.visitorSDK.on("new_message", newMessage => {
          console.log(`new_message`);
          // console.log(newMessage);
          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)

          if (newMessage.authorId === this.store.getters.agentId) {
            let liveChatResponse = {
              type: "liveChatResponse",
              text: newMessage.text,
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
                this.tts.say(stripHtml(newMessage.text));
              }
            }

            if (this.useLocalStorage) {
              localStorage.setItem(this.storageKey + this.teneoChatHistory, JSON.stringify(this.store.getters.dialog));
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
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Send a message to message to the live chat agent
   *
   * @param {*} message
   */
  sendMessage(message) {
    // console.log("Sending message to Live Agent:" + message);
    this.visitorSDK
      .sendMessage({
        text: message,
        customId: String(Math.random())
      })
      .catch(error => {
        console.log(error);
      });
  }
}
