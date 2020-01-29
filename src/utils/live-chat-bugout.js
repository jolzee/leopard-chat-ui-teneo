const logger = require("@/utils/logging").getLogger("live-chat.js");

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

var globalStore;
var bugout;
var hasLiveChatStarted=false;
var agentName = "Sabrina";

function startLiveChatGlobal() {
  if (hasLiveChatStarted)
  {
    return;
  }

  hasLiveChatStarted = true;

  logger.debug(`LiveChat > startLiveChat`);
  globalStore.commit(
    "CHANGE_CHAT_TITLE",
    `Speaking with ${agentName}`
  );
  globalStore.commit("AGENT_NAME", agentName);
  globalStore.commit("AGENT_ID", "agentId");
  globalStore.commit("AGENT_AVATAR", "https://marketplace.magento.com/media/catalog/product/cache/6d3beb02b0f9dc392bf1311d767ddcb7/i/c/icon-medium-transparent_1_2.png");

  let message = "You are talking to " + agentName + ".";
  globalStore.commit("START_LIVE_CHAT");
  // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)

  let liveChatStatus = {
    type: "liveChatStatus",
    text: message,
    bodyText: "",
    hasExtraData: false
  };


  globalStore.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
  globalStore.commit("SHOW_CHAT_BUTTON");
  globalStore
    .dispatch("openChatWindow", false)
    .then(() => {
      logger.debug("LiveChat > Successfully logged into chat");
      setTimeout(
        function() {
          globalStore.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
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

export class LiveChatBugout {
  constructor(store, liveAgentChatChannel) {
    this.store = store;
    this.liveAgentChatChannel = liveAgentChatChannel;

    this.initialize();
  }
  
  initialize() {
    globalStore = this.store;
    var Bugout = require("@/utils/bugout.min");
    bugout = Bugout(this.liveAgentChatChannel);

    
    logger.info("address:" + bugout.address());
    
    bugout.on("message", function(address, message) {
      if(address != bugout.address())
      {
        logger.info(address + ": " + message);
        
        if(!hasLiveChatStarted){
          startLiveChatGlobal();
        }
        let liveChatResponse = {
          type: "liveChatResponse",
          text: md.render(message),
          agentAvatar: globalStore.getters.agentAvatar,
          agentName: globalStore.getters.agentName,
          bodyText: "",
          hasExtraData: false
        };
        globalStore.commit(
          "PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG",
          liveChatResponse
        ); 
      }
    });
  }
  
  startLiveChat() {
    startLiveChatGlobal();
  }

  sendMessage(message) {
    if(!hasLiveChatStarted){
      startLiveChatGlobal();
    }
    bugout.send(message);
  }
}
