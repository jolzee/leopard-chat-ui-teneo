import * as LivechatVisitorSDK from "@livechat/livechat-visitor-sdk"; // live chat
var stripHtml = require("string-strip-html");

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

        this.visitorSDK.on("chat_started", () => {
          // when a user reloads the page while a chat is going on, the message history is loaded. We need to stop that from happening by closing the chat
          if (!this.store.getters.isLiveChat) {
            this.visitorSDK
              .closeChat()
              .then(() => {
                // console.log("Live chat has closed");
              })
              .catch(() => {
                // console.log(error);
              });
          }
        });

        this.visitorSDK.on("visitor_queued", queueData => {
          // console.log(queueData);
          let message = "Chat request sent to agent. You are number " + queueData.numberInQueue + " in the queue.";
          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
          if (this.store.getters.isLiveChat) {
            let liveChatStatus = {
              type: "liveChatQueue",
              text: message,
              bodyText: "",
              hasExtraData: false
            };
            this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
          } else {
            this.visitorSDK
              .closeChat()
              .then(() => {
                // console.log("Live chat has closed");
              })
              .catch(error => {
                console.log(error);
              });
          }
        });

        this.visitorSDK.on("agent_changed", newAgent => {
          // console.log(newAgent);
          this.store.commit("AGENT_NAME", newAgent.name);
          this.store.commit("AGENT_ID", newAgent.id);
          this.store.commit("AGENT_AVATAR", newAgent.avatarUrl);
          // show typing output agentName + ' is typing...'

          let message = "You are talking to " + newAgent.name + ".";

          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
          if (this.store.getters.isLiveChat) {
            let liveChatStatus = {
              type: "liveChatStatus",
              text: message,
              bodyText: "",
              hasExtraData: false
            };
            this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
          } else {
            this.visitorSDK
              .closeChat()
              .then(() => {
                // console.log("Chat is closed");
              })
              .catch(error => {
                console.log(error);
              });
          }
        });

        this.visitorSDK.on("chat_ended", () => {
          // console.log("chat ended");
          let message = "Chat with live agent ended.";
          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
          if (this.store.getters.isLiveChat) {
            let liveChatStatus = {
              type: "liveChatEnded",
              text: message,
              bodyText: "",
              hasExtraData: false
            };
            this.store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
          }
          this.store.commit("STOP_LIVE_CHAT");
        });

        this.visitorSDK.on("typing_indicator", data => {
          this.store.commit("LIVE_CHAT_LOADING", !!data.isTyping);
        });

        this.visitorSDK.on("new_message", newMessage => {
          // console.log(newMessage);
          // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
          if (this.store.getters.isLiveChat) {
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
              if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
                if (this.tts && this.store.getters.speakBackResponses) {
                  this.tts.say(stripHtml(newMessage.text));
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
            }
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
