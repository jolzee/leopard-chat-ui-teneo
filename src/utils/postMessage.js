const logger = require("@/utils/logging").getLogger("postMessage.js");

export default class PostMessage {
  constructor(store, config) {
    this.store = store;
    this.config = config;
    if (config.EMBED) {
      logger.info("Listening for messages from parent");
      let that = this;
      window.addEventListener(
        "message",
        function (event) {
          that.receiveMessageFromParent(event);
        },
        false
      );
    }
  }

  sendMessageToParent(message) {
    logger.debug(`store: sendMessageToParent: ${message}`);
    if (parent) {
      parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specifiy origin for each post.
      logger.debug("Message from Leopard >> Embed : " + message);
    }
  }

  receiveMessageFromParent(event) {
    try {
      // if (event.origin !== "http://example.com:8080") return;

      if (event.data) {
        let messageObject = JSON.parse(event.data);
        if ("info" in messageObject && "id" in messageObject) {
          return true;
        }

        logger.debug("Recived a message from parent...");
        logger.debug(messageObject);
        // event.source.postMessage("This is a message sent back from Leopard to the site embedding Leopard", event.origin);

        if ("leopardState" in messageObject && messageObject.leopardState === "closed") {
          this.store.commit("HIDE_CHAT_WINDOW_DISPLAY_EMBED");
          setTimeout(
            function () {
              if (this.config.EMBED && window.leopardConfig.killSessionOnCloseEmbed) {
                // should kill the session and clear dialog history
                logger.info("Killing Teneo Session");
                this.store.dispatch("endSession");
                localStorage.removeItem(STORAGE_KEY + this.config.TENEO_LAST_INTERACTION_DATE);
                localStorage.removeItem(STORAGE_KEY + this.config.TENEO_CHAT_HISTORY);
                sessionStorage.removeItem(STORAGE_KEY + "teneo-chat-history");
              }
              this.store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
              return;
            }.bind(this),
            1000
          );
        }
        if ("height" in messageObject && "width" in messageObject) {
          logger.info(`Event from parent`, event);
          this.store.state.ui.parent = {
            height: messageObject.height,
            width: messageObject.width
          };
          logger.debug(
            `receiveMessageFromParent: height: ${messageObject.height} width: ${messageObject.width}`
          );
        } else {
          this.store.state.connection.ctxParameters = messageObject;
        }
      }
    } catch (error) {
      return true;
    }
  }
}
