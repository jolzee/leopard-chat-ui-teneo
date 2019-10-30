/* eslint-disable no-unused-vars */
import "regenerator-runtime/runtime";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { markdown } from "markdown";
const superagent = require("superagent");
import gravatar from "gravatar";
var stripHtml = require("striptags");
var mobile = require("is-mobile");
import URL from "url-parse";
import uuidv1 from "uuid/v1";
import Vue from "vue";
import VueJsonp from "vue-jsonp";
import Vuex from "vuex";
import vuexI18n from "vuex-i18n"; // i18n the leopard interface
import VuePlyr from "vue-plyr";
// const VueShortKey = require("vue-shortkey");
// import longpress from "vue-long-press-directive";
import Listening from "./components/Listening.vue"; // component dialog that shows then capturing audio
import Modal from "./components/Modal.vue";
import Prism from "prismjs";
// import "./plugins/vuetify";
import VueLoadersBallPulseSync from "vue-loaders/dist/loaders/ball-pulse-sync";
import VueLoadersLineScale from "vue-loaders/dist/loaders/line-scale";
import VueLoadersLineScalePulseOutRapid from "vue-loaders/dist/loaders/line-scale-pulse-out-rapid";

import { initializeASR, initializeTTS } from "./utils/asr-tts";

import { STORAGE_KEY } from "./constants/solution-config-default"; // application storage key
import { TRANSLATIONS } from "./constants/translations"; // add UI translations for different language here
import Setup from "./utils/setup";

let config = new Setup();
let store;
Vue.use(VueJsonp, 20000);
Vue.use(Vuex);

Vue.use(VuePlyr);
Vue.use(Prism);

if (!config.EMBED) {
  console.groupCollapsed(
    `%c Powered by %c Leopard Chat UI 💬 %c`,
    "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
    "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
    "background:transparent"
  );
  console.log("Author: Peter Joles - peter.joles@artificial-solutions.com");
  console.log("Documentation: https://jolzee.gitbook.io/leopard/");
  console.log("Code: https://github.com/jolzee/chat-teneo-vue");
  console.groupEnd();
}

Vue.use(require("vue-shortkey"));

Vue.component("teneo-modal", Modal);
Vue.component("teneo-listening", Listening);
Vue.component(VueLoadersBallPulseSync.component.name, VueLoadersBallPulseSync.component);
Vue.component(VueLoadersLineScale.component.name, VueLoadersLineScale.component);
Vue.component(VueLoadersLineScalePulseOutRapid.component.name, VueLoadersLineScalePulseOutRapid.component);

Vue.config.productionTip = false;

export function getStore(callback) {
  config
    .init()
    .then(vuetify => storeSetup(vuetify, callback))
    .catch(message => console.error(message));
}

function storeSetup(vuetify, callback) {
  store = new Vuex.Store({
    state: {
      asr: {
        stopAudioCapture: false,
        asr: null
      },
      chatConfig: config.chatConfig,
      activeSolution: config.activeSolution,
      connection: {
        requestParameters: config.REQUEST_PARAMETERS,
        ctxParameters: config.doesParameterExist("teneoCtx") ? JSON.parse(config.getParameterByName("teneoCtx")) : "",
        teneoUrl: config.TENEO_URL
      },
      browser: {
        isMobile: mobile(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      auth: {
        firebase: config.firebaseConfig.apiKey ? firebase.initializeApp(config.firebaseConfig) : null,
        userInfo: {
          user: null,
          username: null,
          profileImage: null
        }
      },
      conversation: {
        dialog: [],
        dialogHistory: [],
        feedbackFormConfig: null
      },
      iframe: {
        iframeUrl: config.IFRAME_URL,
        iframeUrlBase: config.IFRAME_URL
          ? config.IFRAME_URL.substring(0, config.IFRAME_URL.lastIndexOf("/")) + "/"
          : config.IFRAME_URL
      },
      promptTriggerInterval: null,
      knowledgeData: config.KNOWLEDGE_DATA,
      liveAgent: {
        agentAvatar: null,
        agentID: null,
        agentName: null,
        enableLiveChat: config.ENABLE_LIVE_CHAT,
        isLiveChat: false,
        liveChatMessage: null,
        showLiveChatProcessing: false
      },
      modals: {
        modalItem: null,
        showConfigModal: true,
        showCustomModal: false,
        showModal: false
      },
      progress: {
        listening: false,
        progressBar: false,
        showChatLoading: false
      },
      tts: {
        speakBackResponses: false,
        tts: initializeTTS(config.LOCALE)
      },
      ui: {
        chatTitle: config.CHAT_TITLE,
        dark: localStorage.getItem(STORAGE_KEY + "darkTheme")
          ? localStorage.getItem(STORAGE_KEY + "darkTheme") === "true"
          : false,
        embed: config.EMBED,
        showDelayedResponse: false,
        hideConfigMenu: process.env.VUE_APP_HIDE_CONFIG_MENU === "true",
        isWebSite: true,
        overlayChat: config.FLOAT,
        responseIcon: config.RESPONSE_ICON,
        theme: config.THEME,
        userIcon: config.USER_ICON,
        parent: {},
        showUploadButton: false,
        showChatWindow: false,
        showChatButton: true,
        showButtonOnly: config.SHOW_BUTTON_ONLY
      },
      userInput: {
        userInput: "",
        userInputReadyForSending: false
      }
    },
    getters: {
      config(state) {
        return state.chatConfig;
      },
      isPromptPollingActive(state) {
        if ("promptTriggers" in state.activeSolution && state.activeSolution.promptTriggers.enabled) {
          return true;
        }
        return false;
      },
      getPromptPollingIntervalInMilliseconds(state) {
        if ("promptTriggers" in state.activeSolution && state.activeSolution.promptTriggers.pollSeconds) {
          return parseInt(state.activeSolution.promptTriggers.pollSeconds) * 1000;
        }
        return 10000; // default to 10 seconds
      },
      showDelayedResponse(state) {
        return state.ui.showDelayedResponse;
      },
      isChatOpen(state) {
        // console.log(`store:getters:isChatOpen: ${state.ui.showChatWindow}`);
        return state.ui.showChatWindow;
      },
      hideConfigMenu(state) {
        return state.ui.hideConfigMenu;
      },
      uuid(_state) {
        return uuidv1();
      },
      showButtonOnly(state) {
        // console.log(`store: showButtonOnly: ${state.ui.showButtonOnly}`);
        return state.ui.showButtonOnly;
      },
      getAnimatedIn(state, getters) {
        let animation = "";
        if ("animations" in state.activeSolution && !getters.embed) {
          animation = "animated " + state.activeSolution.animations.in;
        }
        return animation;
      },
      getAnimatedOut(state, getters) {
        let animation = "";
        if ("animations" in state.activeSolution && !getters.embed) {
          animation = "animated " + state.activeSolution.animations.out;
        }
        return animation;
      },
      accentStyling(state) {
        if (state.activeSolution.displayAccent) {
          return "border-top: 3px solid" + state.ui.theme.accent + " !important;";
        }
        return "";
      },
      customCssButtonToolbar(state) {
        return state.activeSolution.customCssButtonToolbar !== undefined
          ? state.activeSolution.customCssButtonToolbar
          : "";
      },
      timeZoneParam(state) {
        return "&timeZone=" + encodeURI(state.browser.timeZone);
      },
      showChatButton(state) {
        return state.ui.showChatButton;
      },
      uploadConfig(_state, getters) {
        let item = getters.lastReplyItem;
        let uploadConfigJson = null;
        if (getters.itemExtraData(item, "uploadConfig")) {
          uploadConfigJson = getters.itemExtraData(item, "uploadConfig");
        }

        return uploadConfigJson;
      },
      isMobileDevice: state => state.browser.isMobile,
      socialAuthEnabled: state => (state.auth.firebase ? true : false),
      lastReplyItem: state => {
        return state.conversation.dialog
          .slice()
          .reverse()
          .find(item => item.type === "reply");
      },
      userInformationParams(state) {
        let userInfoParams = "";
        if (state.auth.userInfo.user) {
          userInfoParams = `&name=${state.auth.userInfo.user.displayName}&email=${state.auth.userInfo.user.email}`;
        }
        return userInfoParams;
      },
      askingForPassword(_state, getters) {
        let item = getters.lastReplyItem;
        let isAskingForPassword = false;
        if (item && item.teneoResponse) {
          let inputType = decodeURIComponent(item.teneoResponse.extraData.inputType);
          if (inputType !== "undefined" && inputType.trim().toLowerCase() === "password") {
            isAskingForPassword = true;
          }
        }
        return isAskingForPassword;
      },
      inputHelpText(_state, getters) {
        let item = getters.lastReplyItem;
        let inputHelpText;
        if (item && item.teneoResponse) {
          let helpText = decodeURIComponent(item.teneoResponse.extraData.inputHelpText);
          if (helpText !== "undefined") {
            inputHelpText = helpText;
          }
        }
        return inputHelpText;
      },
      itemInputMask(_state, getters) {
        let item = getters.lastReplyItem;
        let itemInputMask;
        if (item && item.teneoResponse) {
          let mask = decodeURIComponent(item.teneoResponse.extraData.inputMask);
          if (mask !== "undefined") {
            itemInputMask = mask;
          }
        }
        return itemInputMask;
      },
      askingForEmail(_state, getters) {
        let item = getters.lastReplyItem;
        let isAskingForEmail = false;
        if (item && item.teneoResponse) {
          let inputType = decodeURIComponent(item.teneoResponse.extraData.inputType);
          if (inputType !== "undefined" && inputType.trim().toLowerCase() === "email") {
            isAskingForEmail = true;
          }
        }
        return isAskingForEmail;
      },
      activeSolution(state) {
        return state.activeSolution;
      },
      listening(state) {
        return state.progress.listening;
      },
      responseIcon(state) {
        return state.ui.responseIcon;
      },
      userIcon(state) {
        return state.auth.userInfo.profileImage ? "account-check" : state.ui.userIcon;
      },
      tts(state) {
        return state.tts.tts;
      },
      asr(state) {
        return state.asr.asr;
      },
      agentAvatar(state) {
        return state.liveAgent.agentAvatar;
      },
      agentId(state) {
        return state.liveAgent.agentID;
      },
      agentName(state) {
        return state.liveAgent.agentName;
      },
      userInputReadyForSending(state) {
        return state.userInput.userInputReadyForSending;
      },
      modalPosition: _state => item => {
        let modalPosition = decodeURIComponent(item.teneoResponse.extraData.modalPosition);
        if (modalPosition !== "undefined") {
          modalPosition = modalPosition.toLowerCase();
        }
        return modalPosition;
      },
      modalSize: _state => item => {
        let modalSize = decodeURIComponent(item.teneoResponse.extraData.modalSize);
        if (modalSize !== "undefined") {
          modalSize = modalSize.toLowerCase();
        }
        return modalSize;
      },
      outputLink: _state => item => {
        return decodeURIComponent(item.teneoResponse.link.href);
      },
      liveChatTranscript: _state => item => {
        return decodeURIComponent(item.teneoResponse.extraData.liveChat);
      },
      profileImageFromEmail: _state => email => {
        return gravatar.url(email, { protocol: "https" });
      },
      isVideoFile: _state => url => {
        // console.log("IsVideo:" + url);
        const regExp = /\.(?:mp4|webm|ogg)$/i;
        const match = url.match(regExp);
        let result = match ? match[0].substring(1, match[0].length) : false;
        // console.log(result);
        return result;
      },
      isAudioFile: _state => url => {
        // console.log("ISAudio:" + url);
        const regExp = /\.(?:wav|mp3|ogg)$/i;
        const match = url.match(regExp);
        let result = match ? match[0].substring(1, match[0].length) : false;
        // console.log(result);
        return result;
      },
      youTubeIdFromUrl: _state => url => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#]*).*/;
        const match = url.match(regExp);
        if (match) {
          return match[7].length == 11 ? match[7] : false;
        } else {
          return false;
        }
      },
      vimeoIdFromUrl: _state => url => {
        const regExp = /^.+vimeo.com\/(.*\/)?([^#]*)/;
        const match = url.match(regExp);
        return match ? match[2] || match[1] : false;
      },
      enableLiveChat(state) {
        return state.liveAgent.enableLiveChat;
      },
      chatConfig(state) {
        return state.chatConfig;
      },
      extensionIsInline: _state => extension => {
        if (extension && extension.inline) {
          return extension.inline;
        } else {
          return false;
        }
      },
      itemExtensionsModal: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        let modalExtensions = [];
        extensions.forEach(extension => {
          if (!getters.extensionIsInline(extension) && !extension.name.startsWith("displayCollection")) {
            modalExtensions.push(extension);
          }
        });
        return modalExtensions;
      },
      itemExtraData: _state => (item, name) => {
        let response = {};
        if (item && item.teneoResponse && name in item.teneoResponse.extraData) {
          response = JSON.parse(decodeURIComponent(item.teneoResponse.extraData[name]));
        }
        return response;
      },
      itemExtensions: _state => item => {
        let actions = [];
        if (item && item.teneoResponse) {
          if (
            Object.keys(item.teneoResponse.extraData).some(function(k) {
              return ~k.indexOf("extensions");
            })
          ) {
            // sort the keys for ordering of extensions
            const ordered = {};
            Object.keys(item.teneoResponse.extraData)
              .sort()
              .forEach(function(key) {
                ordered[key] = item.teneoResponse.extraData[key];
              });
            try {
              for (var key in ordered) {
                if (key.startsWith("extensions")) {
                  var value = decodeURIComponent(ordered[key]);
                  // console.log(`Key: ${key} Value: ${value}`);
                  actions.push(JSON.parse(value));
                }
              }
            } catch (e) {
              console.error(e);
              // store.commit("SHOW_MESSAGE_IN_CHAT", "Problems with extension format: " + e.message + ".");
            }
          }
        }
        return actions;
      },
      ctxParameters(state) {
        let ctxParams = state.connection.ctxParameters;
        if (ctxParams) {
          let queryParams = Object.keys(ctxParams)
            .map(key => key + "=" + encodeURIComponent(ctxParams[key]))
            .join("&");
          return `&${queryParams}`;
        }
        return "";
      },
      hasFeedbackForm: () => item => {
        if (item.teneoResponse.extraData && item.teneoResponse.extraData.offerFeedbackForm) {
          return true;
        } else {
          return false;
        }
      },
      hasModal: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        let hasModal = false;
        extensions.forEach(extension => {
          if (extension && !extension.inline && !extension.name.startsWith("displayCollection")) {
            hasModal = true;
          }
        });

        return hasModal;
      },
      hasInline: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        let hasInline = false;
        extensions.forEach(extension => {
          if (extension && extension.inline) {
            hasInline = true;
          }
        });
        return hasInline;
      },
      hasInlineType: (_state, getters) => (extension, type) => {
        if (extension && extension.inline) {
          switch (type) {
            case "youTube":
              if (getters.youTubeVideoId(extension)) {
                return true;
              }
              break;
            case "audio":
              if (getters.audioInfo(extension)) {
                return true;
              }
              break;
            case "vimeo":
              if (getters.vimeoId(extension)) {
                return true;
              }
              break;
            case "video":
              if (getters.videoInfo(extension)) {
                return true;
              }
              break;
            case "map":
              if (getters.mapInfo(extension)) {
                return true;
              }
              break;
            case "image":
              if (getters.imageUrl(extension)) {
                return true;
              }
              break;
            case "carousel":
              if (getters.carouselImageArray(extension)) {
                return true;
              }
              break;
            default:
              return false;
          }
        }
        return false;
      },
      youTubeVideoId: (_state, getters) => extension => {
        if (extension && extension.name === "displayVideo") {
          let url = extension.parameters.video_url;
          let videoId = getters.youTubeIdFromUrl(url);
          if (videoId) {
            return videoId;
          }
        }

        return "";
      },
      getActivePromptInterval(state) {
        return state.promptTriggerInterval;
      },
      audioInfo: (_state, getters) => extension => {
        if (extension && extension.name === "displayVideo") {
          let url = extension.parameters.video_url;
          const audioFileExt = getters.isAudioFile(url);
          if (audioFileExt) {
            return {
              audioType: `audio/${audioFileExt}`,
              audioUrl: url
            };
          }
        }

        return {};
      },
      vimeoId: (_state, getters) => extension => {
        if (extension && extension.name === "displayVideo") {
          let url = extension.parameters.video_url;
          const vimeoId = getters.vimeoIdFromUrl(url);
          if (vimeoId) {
            return vimeoId;
          }
        }

        return;
      },
      videoInfo: (_state, getters) => extension => {
        if (extension && extension.name === "displayVideo") {
          let url = extension.parameters.video_url;
          const videoFileExt = getters.isVideoFile(url);
          if (videoFileExt) {
            return {
              videoType: `video/${videoFileExt}`,
              videoUrl: url
            };
          }
        }

        return;
      },
      mapInfo: (_state, getters) => extension => {
        if (extension && extension.name === "displayMap") {
          let address = extension.parameters.address;
          if (address) {
            return {
              address: address
            };
          }
        }

        return;
      },
      imageUrl: (_state, _getters) => extension => {
        if (extension && extension.name === "displayImage") {
          // console.log(`image URL ${extension.parameters.image_url}`);
          return extension.parameters.image_url;
        }
        return "";
      },
      carouselImageArray: (_state, _getters) => extension => {
        if (extension && extension.name === "displayImageCarousel") {
          return extension.parameters.images;
        }
        return [];
      },
      iFrameUrlBase(state) {
        return state.iframe.iframeUrlBase;
      },
      firebase(state) {
        return state.auth.firebase;
      },
      isLiveChat(state) {
        return state.liveAgent.isLiveChat;
      },
      knowledgeData(state) {
        return state.knowledgeData;
      },
      settingLongResponsesInModal(state) {
        return state.activeSolution.longResponsesInModal;
      },
      pulseButton(state) {
        return state.activeSolution.pulseButton;
      },
      lastItemAnswerTextCropped(_state, getters) {
        let answer = "";
        if (getters.lastReplyItem) {
          answer = getters.lastReplyItem.text;
        }

        if (getters.settingLongResponsesInModal && getters.lastItemHasLongResponse) {
          answer = answer.substr(0, 300 - 1) + (answer.length > 300 ? "&hellip;" : "");
        }
        return answer;
      },
      itemAnswerTextCropped: (_state, getters) => item => {
        let answer = item.text;
        if (getters.settingLongResponsesInModal && getters.itemHasLongResponse(item)) {
          answer = answer.substr(0, 300 - 1) + (answer.length > 300 ? "&hellip;" : "");
        }
        return answer;
      },
      lastItemHasLongResponse(_state, getters) {
        let hasLongResponse = false;
        if (getters.settingLongResponsesInModal) {
          let item = getters.lastReplyItem;
          if (item && item.text && item.text.length > 400) {
            hasLongResponse = true;
          }
        }
        return hasLongResponse;
      },
      itemHasLongResponse: (_state, getters) => item => {
        let hasLongResponse = false;
        if (getters.settingLongResponsesInModal && item && item.text && item.text.length > 400) {
          hasLongResponse = true;
        }
        return hasLongResponse;
      },
      showCustomModal(state) {
        return state.modals.showCustomModal;
      },
      speakBackResponses(state) {
        return state.tts.speakBackResponses;
      },
      liveChatMessage(state) {
        return state.liveAgent.liveChatMessage;
      },
      showChatLoading(state) {
        return state.progress.showChatLoading;
      },
      teneoUrl(state) {
        return state.connection.teneoUrl;
      },
      showLiveChatProcessing(state) {
        return state.liveAgent.showLiveChatProcessing;
      },
      dialogs(state) {
        // console.log(`Session Storage? ${config.USE_SESSION_STORAGE} Dialog Length ${state.conversation.dialog.length}`);
        if (!config.USE_SESSION_STORAGE && state.conversation.dialog.length === 0) {
          // console.log("Checking for stale session - embed");
          // typically here when in production embedded state
          // check if session expired
          let now = new Date();
          let lastInteractionTime = localStorage.getItem(STORAGE_KEY + config.TENEO_LAST_INTERACTION_DATE);
          if (!lastInteractionTime) {
            // console.log("No previous interaction time...");
            state.conversation.dialog = JSON.parse(localStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, "[]"));
          } else {
            // console.log(`found last interaction time: ${lastInteractionTime}`);
            var diff = (now.getTime() - lastInteractionTime) / 1000;
            diff /= 60;
            let diffMins = Math.abs(Math.round(diff));
            // console.log(`Minutes Difference: ${diffMins}`);
            if (diffMins > 0) {
              localStorage.setItem(STORAGE_KEY + config.TENEO_LAST_INTERACTION_DATE, now.getTime());
              state.conversation.dialog = [];
              localStorage.setItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, "[]");
            } else {
              // "session" still active
              state.conversation.dialog = JSON.parse(
                localStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, "[]")
              );
            }
          }
        }
        if (!state.conversation.dialog) {
          state.conversation.dialog = [];
        }
        return state.conversation.dialog;
      },
      getLatestDialogHistory(state) {
        if (state.conversation.dialogHistory.length === 0) {
          if (config.USE_SESSION_STORAGE) {
            state.conversation.dialogHistory = JSON.parse(
              sessionStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, "[]")
            );
          } else {
            state.conversation.dialogHistory = JSON.parse(
              localStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, "[]")
            );
          }

          if (!state.conversation.dialogHistory) {
            state.conversation.dialogHistory = [];
          }
        }
        return state.conversation.dialogHistory;
      },
      userInput(state) {
        return state.userInput.userInput;
      },
      showFeedbackForm(state) {
        if (state.conversation.feedbackFormConfig !== null) {
          return true;
        } else {
          return false;
        }
      },
      getFeedbackFormConfig(state) {
        return state.conversation.feedbackFormConfig;
      },
      embed(state) {
        return state.ui.embed;
      },
      overlayChat(state) {
        return state.ui.overlayChat;
      },
      float(state) {
        return state.ui.overlayChat;
      },
      dialog(state) {
        return state.conversation.dialog;
      },
      dialogHistory(state) {
        return state.conversation.dialogHistory;
      },
      progressBar(state) {
        return state.progress.progressBar;
      },
      stopAudioCapture(state) {
        return state.asr.stopAudioCapture;
      },
      showModal(state) {
        return state.modals.showModal;
      },
      showConfigModal(state) {
        return state.modals.showConfigModal;
      },
      modalItem(state) {
        return state.modals.modalItem;
      },
      authenticated(state) {
        return state.auth.userInfo.user ? true : false;
      },
      userProfileImage(state) {
        return state.auth.userInfo.user ? state.auth.userInfo.user.photoURL : "";
      },
      displayName(state) {
        return state.auth.userInfo.user ? state.auth.userInfo.user.displayName : "Anonymous";
      },
      dark(state) {
        return state.ui.dark;
      },
      chatTitle(state) {
        return state.ui.chatTitle;
      },
      showChatIcons(state) {
        return state.activeSolution.showChatIcons;
      },
      showUploadButton(state) {
        return state.ui.showUploadButton;
      }
    },
    mutations: {
      SHOW_RESPONSE_DELAY(state) {
        state.ui.showDelayedResponse = true;
      },
      HIDE_RESPONSE_DELAY(state) {
        state.ui.showDelayedResponse = false;
      },
      SHOW_UPLOAD_BUTTON(state) {
        state.ui.showUploadButton = true;
      },
      HIDE_UPLOAD_BUTTON(state) {
        state.ui.showUploadButton = false;
      },
      HIDE_CUSTOM_MODAL(state) {
        state.modals.showCustomModal = false;
      },
      TOGGLE_CHAT_WINDOW_DISPLAY(state, getters) {
        state.ui.showChatWindow = !state.ui.showChatWindow;
        // console.log(
        //   `store: TOGGLE_CHAT_WINDOW_DISPLAY:  state.ui.showChatWindow has toggled to: ${state.ui.showChatWindow}`
        // );
        if (state.ui.embed) {
          localStorage.setItem("isChatOpen", state.ui.showChatWindow);
          // console.log(`store: TOGGLE_CHAT_WINDOW_DISPLAY: sending message to parent to ${state.ui.showChatWindow}`);
          sendMessageToParent(state.ui.showChatWindow ? "showLeopard" : "hideLeopard");
        }
      },
      SHOW_CHAT_WINDOW(state) {
        // console.log(`store: SHOW_CHAT_WINDOW`);
        state.ui.showChatWindow = true;
      },
      HIDE_CHAT_WINDOW(state) {
        // console.log(`store: HIDE_CHAT_WINDOW`);
        state.ui.showChatWindow = false;
      },
      HIDE_CHAT_BUTTON(state) {
        state.ui.showChatButton = false;
      },
      SHOW_CHAT_BUTTON(state) {
        state.ui.showChatButton = true;
      },
      SHOW_CUSTOM_MODAL(state) {
        state.modals.showCustomModal = true;
      },
      PUSH_RESPONSE_TO_DIALOG(state, response) {
        state.conversation.dialog.push(response);
      },
      PUSH_RESPONSE_TO_DIALOG_HISTORY(state, response) {
        state.conversation.dialogHistory.push(response);
      },
      PUSH_USER_INPUT_TO_DIALOG_HISTORY(state, userInput) {
        state.conversation.dialogHistory.push(userInput);
      },
      SET_CHAT_TITLE(state, title) {
        state.ui.chatTitle = title;
      },
      SET_DIALOG_HISTORY(state, newHistory) {
        state.conversation.dialogHistory = newHistory;
      },
      PUSH_USER_INPUT_TO_DIALOG(state, userInput) {
        state.conversation.dialog.push(userInput);
      },
      PUSH_LIVE_CHAT_STATUS_TO_DIALOG(state, liveChatStatus) {
        state.conversation.dialog.push(liveChatStatus);
      },
      SHOW_MESSAGE_IN_CHAT(
        state,
        message,
        type = "info",
        color = "info",
        prominent = false,
        outlined = false,
        icon = undefined,
        borderPosition = "top"
      ) {
        state.progress.showChatLoading = false;
        let miscMessage = {
          type: "miscMessage",
          alertText: message,
          alertBorderPosition: borderPosition,
          alertType: type,
          alertColor: color,
          alertProminent: prominent,
          alertOutlined: outlined,
          alertIcon: icon,
          bodyText: "",
          hasExtraData: false
        };
        state.conversation.dialog.push(miscMessage);
      },
      PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG(state, liveChatResponse) {
        state.conversation.dialog.push(liveChatResponse);
      },
      CLEAR_USER_INPUT(state) {
        state.userInput.userInput = "";
        if (state.browser.isMobile) {
          document.activeElement.blur();
        }
      },
      SHOW_CHAT_LOADING(state) {
        state.progress.showChatLoading = true;
      },
      HIDE_CHAT_LOADING(state) {
        state.progress.showChatLoading = false;
      },
      LIVE_CHAT_LOADING(state, mustShow) {
        state.liveAgent.showLiveChatProcessing = mustShow;
      },
      SHOW_LIVE_CHAT_LOADING(state) {
        state.liveAgent.showLiveChatProcessing = true;
      },
      HIDE_LIVE_CHAT_LOADING(state) {
        state.liveAgent.showLiveChatProcessing = false;
      },
      CLEAR_CHAT_HISTORY(state) {
        state.conversation.dialog = [];
      },
      LIVE_CHAT(_state, transcript) {
        config.liveChat.sendMessage(transcript);
      },
      START_LIVE_CHAT(state) {
        state.liveAgent.isLiveChat = true;
      },
      STOP_LIVE_CHAT(state) {
        state.liveAgent.isLiveChat = false;
      },
      CHANGE_THEME(state) {
        state.ui.dark = !state.ui.dark;
        localStorage.setItem(STORAGE_KEY + config.TENEO_CHAT_DARK_THEME, JSON.stringify(state.ui.dark));
      },
      SHOW_LISTING_OVERLAY(state) {
        state.progress.listening = true;
      },
      HIDE_LISTENING_OVERLAY(state) {
        state.progress.listening = false;
      },
      SET_USER_INPUT(state, userInput) {
        if (userInput) {
          //state.userInput.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
          state.userInput.userInput = userInput;
        }
      },
      START_TTS(state) {
        state.tts.speakBackResponses = true;
      },
      STOP_TTS(state) {
        state.tts.speakBackResponses = false;
      },
      TTS_ENABLE(state, useTTS) {
        state.tts.speakBackResponses = useTTS;
      },
      UPDATE_CHAT_WINDOW_AND_STORAGE(state, payload) {
        let hasExtraData = false;

        if (
          payload.response.teneoResponse &&
          (Object.keys(payload.response.teneoResponse.extraData).some(function(k) {
            return ~k.indexOf("extensions");
          }) ||
            payload.response.teneoResponse.extraData.liveChat ||
            payload.response.teneoResponse.link.href)
        ) {
          hasExtraData = true;
        }

        let newUserInput = {
          type: "userInput",
          text: payload.mask ? "*********" : payload.response.userInput,
          bodyText: "",
          hasExtraData: false
        };

        // add the user input - display it on the chat dialog
        if (newUserInput.text) {
          state.conversation.dialog.push(newUserInput);
        }

        let newReply = {
          type: "reply",
          id: uuidv1(),
          text: payload.response.teneoAnswer,
          bodyText: "",
          teneoResponse: payload.response.teneoResponse,
          hasExtraData: hasExtraData
        };

        // add the teneo response - display it on the chat dialog
        state.conversation.dialog.push(newReply);
        if (hasExtraData) {
          state.modals.modalItem = newReply;
          state.modals.showModal = true;
        }

        //state.userInput.userInput = ""; // reset the user input to nothing

        // deal with persiting the chat history
        if (!config.USE_SESSION_STORAGE) {
          localStorage.setItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, JSON.stringify(state.conversation.dialog));
        }
        state.conversation.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY));
        if (state.conversation.dialogHistory === null) {
          state.conversation.dialogHistory = state.conversation.dialog;
        } else {
          // add current user input and teneo response to the dialog history
          if (newUserInput.text) {
            state.conversation.dialogHistory.push(newUserInput);
          }
          state.conversation.dialogHistory.push(newReply);
        }
        // save the dislaog history in session storage
        sessionStorage.setItem(
          STORAGE_KEY + config.TENEO_CHAT_HISTORY,
          JSON.stringify(state.conversation.dialogHistory)
        );
      },
      REMOVE_FORM_CONFIG(state, itemId) {
        let foundHistory = state.conversation.dialogHistory.find(function(item) {
          return item.id === itemId;
        });

        let found = state.conversation.dialog.find(function(item) {
          return item.id === itemId;
        });

        if (found && found.teneoResponse && found.teneoResponse.extraData && found.teneoResponse.extraData.formConfig) {
          delete found.teneoResponse.extraData.formConfig;
        }

        if (
          foundHistory &&
          foundHistory.teneoResponse &&
          foundHistory.teneoResponse.extraData &&
          foundHistory.teneoResponse.extraData.formConfig
        ) {
          delete foundHistory.teneoResponse.extraData.formConfig;
        }

        sessionStorage.setItem(
          STORAGE_KEY + config.TENEO_CHAT_HISTORY,
          JSON.stringify(state.conversation.dialogHistory)
        );
      },
      SHOW_PROGRESS_BAR(state) {
        state.progress.progressBar = true;
      },
      HIDE_PROGRESS_BAR(state) {
        state.progress.progressBar = false;
      },
      SHOW_CONFIG_MODAL(state) {
        state.modals.showConfigModal = true;
      },
      HIDE_CONFIG_MODAL(state) {
        state.modals.showConfigModal = false;
      },
      UPDATE_TENEO_URL(state, newUrl) {
        state.connection.teneoUrl = newUrl;
      },
      SHOW_CHAT_MODAL(state, item) {
        state.modals.modalItem = item;
        state.modals.showModal = true;
      },
      STOP_AUDIO_CAPTURE(state) {
        state.asr.stopAudioCapture = true;
      },
      START_AUDIO_CAPTURE(state) {
        if (state.asr.asr != null) {
          if (state.tts.tts.isSpeaking()) {
            state.tts.tts.shutUp();
          }
          state.asr.stopAudioCapture = false;
          state.asr.asr.start();
        }
      },
      ADD_FEEDBACK_FORM(state, feedbackFormConfig) {
        state.conversation.feedbackFormConfig = feedbackFormConfig;
      },
      CLEAR_FEEDBACK_FORM(state) {
        state.conversation.feedbackFormConfig = null;
      },
      HIDE_CHAT_MODAL(state) {
        // console.log("hiding modal");
        state.userInput.userInputReadyForSending = false;
        state.modals.showModal = false;
        state.modals.modalItem = null;
        // console.log("modal item should be empty");
      },
      CLEAR_DIALOGS(state) {
        state.conversation.dialog = [];
      },
      USER_INPUT_READY_FOR_SENDING(state) {
        state.userInput.userInputReadyForSending = true;
      },
      USER_INPUT_NOT_READY_FOR_SENDING(state) {
        state.userInput.userInputReadyForSending = false;
      },
      REMOVE_MODAL_ITEM(state) {
        state.modals.modalItem = null;
      },
      AGENT_NAME(state, agentName) {
        state.liveAgent.agentName = agentName;
      },
      AGENT_ID(state, agentId) {
        state.liveAgent.agentID = agentId;
      },
      AGENT_AVATAR(state, imageUrl) {
        state.liveAgent.agentAvatar = imageUrl;
      },
      UPDATE_UI_LOCALE(state, lang) {
        state.i18n.locale = lang.toLowerCase();
        Vue.i18n.set(lang);
      },
      SET_PROMPT_TRIGGER_INTERVAL(state, newInterval) {
        state.promptTriggerInterval = newInterval;
      },
      CLEAR_PROMPT_TRIGGER_INTERVAL(state) {
        clearInterval(state.promptTriggerInterval);
        state.promptTriggerInterval = null;
      },
      UPDATE_FRAME_URL(state, newUrl) {
        if (document.getElementById("site-frame")) {
          document.getElementById("site-frame").src = newUrl;
        } else if (state.ui.embed) {
          sendMessageToParent(`runLeopardScript|window.location.href = '${newUrl}';`);
        }
        state.iframe.iframeUrl = newUrl;
        state.iframe.iframeUrlBase = newUrl.substring(0, newUrl.lastIndexOf("/")) + "/";
      },
      USER_INFO(state, userInfo) {
        state.auth.userInfo.user = userInfo.user;
      },
      CHANGE_ASR_TTS(state, lang) {
        state.tts.tts = initializeTTS(lang);
        initializeASR(store, config.ASR_CORRECTIONS_MERGED);
      },
      CLEAR_USER_INFO(state) {
        state.auth.userInfo.user = null;
      }
    },
    actions: {
      sendFeedback(context, feedback) {
        Vue.jsonp(
          config.TENEO_URL +
            config.REQUEST_PARAMETERS +
            context.getters.userInformationParams +
            context.getters.timeZoneParam +
            context.getters.ctxParameters,
          {
            command: "feedback",
            feedback: JSON.stringify(feedback)
            // userInput: ""
          }
        ).then(() => {
          console.log("Feedback sent to Teneo");
        });
      },
      setUserInformation({ commit, getters }) {
        if (getters.firebase) {
          getters.firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              commit("USER_INFO", { user: user }); // user is still signed in
            }
          });
        }
      },
      logout({ commit, getters }) {
        getters.firebase
          .auth()
          .signOut()
          .then(
            () => {
              commit("CLEAR_USER_INFO");
              console.log("Signed out");
            },
            function(error) {
              // An error happened.
              console.error(error.message);
            }
          );
      },
      loginSocial({ commit, getters }, socialProvider) {
        return new Promise((resolve, reject) => {
          let provider = null;
          switch (socialProvider) {
            case "google":
              provider = new firebase.auth.GoogleAuthProvider();
              break;
            case "facebook":
              provider = new firebase.auth.FacebookAuthProvider();
              break;
            case "github":
              provider = new firebase.auth.GithubAuthProvider();
              break;
            default:
              break;
          }
          // getters.firebase.auth().languageCode = "en";
          // To apply the default browser preference instead of explicitly setting it.
          firebase.auth().useDeviceLanguage();

          getters.firebase
            .auth()
            .signInWithPopup(provider)
            .then(function(result) {
              // This gives you a Google Access Token. You can use it to access the Google API.
              // var token = result.credential.accessToken;
              // The signed-in user info.
              let user = result.user;
              // console.log(user);
              commit("USER_INFO", { user: user });
              resolve();
            })
            .catch(function(error) {
              // Handle Errors here.
              // var errorCode = error.code;
              // var errorMessage = error.message;
              // // The email of the user's account used.
              // var email = error.email;
              // // The firebase.auth.AuthCredential type that was used.
              // var credential = error.credential;
              // ...
              reject(error.message);
            });
        });
      },
      loginUserWithUsernameEmailPassword({ commit, getters }, loginInfo) {
        return new Promise((resolve, reject) => {
          loginInfo.photoURL = getters.profileImageFromEmail(loginInfo.email);
          getters.firebase
            .auth()
            .signInWithEmailAndPassword(loginInfo.email, loginInfo.password)
            .then(user => {
              commit("USER_INFO", { user: user });
              resolve();
            })
            .catch(function(error) {
              reject(error.message);
            });
        });
      },
      registerUserWithUsernameEmailPassword({ commit, getters }, registrationInfo) {
        // import(/* webpackChunkName: "dep-firebase-database" */ "firebase/database");

        return new Promise((resolve, reject) => {
          registrationInfo.photoURL = getters.profileImageFromEmail(registrationInfo.email);
          getters.firebase
            .auth()
            .createUserWithEmailAndPassword(registrationInfo.email, registrationInfo.password)
            .then(user => {
              let currentUser = getters.firebase.auth().currentUser;
              console.log(registrationInfo.displayName);
              console.log(registrationInfo.photoURL);
              currentUser
                .updateProfile({
                  displayName: registrationInfo.displayName,
                  photoURL: registrationInfo.photoURL
                })
                .then(function() {
                  console.log("User's profile info updated");
                })
                .catch(function(error) {
                  console.log(`Unable to update user's profile information: ${error.message}`);
                });
              commit("USER_INFO", { user: user });
              resolve();
            })
            .catch(function(error) {
              console.log(error);
              reject(error.message);
            });
        });
      },
      stopAudioCapture(context) {
        if (context.getters.tts.isSpeaking()) {
          // console.log("muted TTS!");
          context.getters.tts.shutUp();
        }
        if (context.getters.tts.isObeying()) {
          context.getters.asr.stop();
          context.commit("STOP_AUDIO_CAPTURE");
        }
      },
      endSession(context) {
        context.commit("CLEAR_DIALOGS");
        context.commit("REMOVE_MODAL_ITEM");
        let fullUrl = new URL(context.getters.teneoUrl);
        let endSessionUrl =
          fullUrl.protocol +
          "//" +
          fullUrl.host +
          fullUrl.pathname +
          "endsession?viewtype=STANDARDJSONP" +
          (config.SEND_CTX_PARAMS === "all"
            ? config.REQUEST_PARAMETERS.length > 0
              ? "&" + config.REQUEST_PARAMETERS.substring(1, config.REQUEST_PARAMETERS.length)
              : ""
            : "");

        Vue.jsonp(endSessionUrl, {}).then(() => {
          context.commit("HIDE_CHAT_LOADING");
          console.log("Session Ended");
        });
      },
      login(context) {
        // get the greeting message if we haven't done so for this session
        return new Promise((resolve, reject) => {
          Vue.jsonp(
            config.TENEO_URL +
              config.REQUEST_PARAMETERS +
              context.getters.userInformationParams +
              context.getters.timeZoneParam +
              context.getters.ctxParameters,
            {
              command: "login"
              // userInput: ""
            }
          )
            .then(json => {
              if ("numActiveFlows" in json.responseData.extraData) {
                let numActiveFlows = parseInt(json.responseData.extraData.numActiveFlows);
                if (numActiveFlows > 0) {
                  // mid dialog stop polling
                  context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
                  console.log("Stop polling - there active dialogs");
                } else if (context.getters.isPromptPollingActive) {
                  // setup the polling again if needed
                  if (!context.getters.showButtonOnly && context.getters.getActivePromptInterval === null) {
                    console.log("Start up Prompt Trigger Polling");
                    let interval = setInterval(function() {
                      context.dispatch("sendUserInput", "&command=prompt");
                    }, context.getters.getPromptPollingIntervalInMilliseconds);
                    context.commit("SET_PROMPT_TRIGGER_INTERVAL", interval);
                  }
                }
              } else if (!("numActiveFlows" in json.responseData.extraData) && context.getters.isPromptPollingActive) {
                console.groupCollapsed(
                  `%c Config Error!! ⚠ %c Leopard Chat UI 💬 %c`,
                  "background:#C60909 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
                  "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
                  "background:transparent"
                );
                console.log("Prompt polling is active but you are not returning the numActiveFlows from Teneo");
                console.log("Documentation: https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling");
                console.groupEnd();
              }
              context.commit("HIDE_CHAT_LOADING"); // about to show the greeting - hide the chat loading spinner
              // console.log(decodeURIComponent(json.responseData.answer))
              let hasExtraData = false;

              if (
                Object.keys(json.responseData.extraData).some(function(k) {
                  return ~k.indexOf("extensions");
                }) ||
                json.responseData.extraData.liveChat
              ) {
                hasExtraData = true;
              }
              const response = {
                type: "reply",
                id: uuidv1(),
                text: decodeHTML(
                  markdown.toHTML(
                    decodeURIComponent(json.responseData.answer).replace(/onclick="[^"]+"/g, 'class="sendInput"')
                  )
                ),
                bodyText: "",
                teneoResponse: json.responseData,
                hasExtraData: hasExtraData
              };
              // sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(response))
              context.commit("PUSH_RESPONSE_TO_DIALOG", response); // push the getting message onto the dialog
              if (hasExtraData) {
                context.commit("SHOW_CHAT_MODAL", response);
              }
              resolve();
            })
            .catch(err => {
              console.log(err);
              context.commit(
                "SHOW_MESSAGE_IN_CHAT",
                "Problems sending login command: " +
                  err.message +
                  ". Please make sure your Solution is published and that you are referencing the correct TIE Url."
              );
              reject(err);
            });
        });
      },
      sendUserInput(context, params = "") {
        // important because sometimes some weird object gets injected from chrome browser extensions
        if (typeof params !== "string") {
          params = "";
        }
        let now = new Date();
        let currentUserInput = "";
        if (params.indexOf("command=prompt") === -1) {
          // console.log("Updating last interaction time in localstorage");
          localStorage.setItem(STORAGE_KEY + config.TENEO_LAST_INTERACTION_DATE, now.getTime());
          currentUserInput = stripHtml(context.getters.userInput);
          context.commit("CLEAR_USER_INPUT");
          // send user input to Teneo when a live chat has not begun
          if (context.getters.tts && context.getters.tts.isSpeaking()) {
            // tts is speaking something. Let's shut it up
            context.getters.tts.shutUp();
          }
        }

        if (!context.getters.isLiveChat) {
          // normal Teneo request needs to be made
          Vue.jsonp(
            context.getters.teneoUrl +
              (config.SEND_CTX_PARAMS === "all" ? config.REQUEST_PARAMETERS + params : params) +
              context.getters.userInformationParams +
              context.getters.timeZoneParam +
              context.getters.ctxParameters,
            {
              userinput: currentUserInput.trim()
            }
          )
            .then(json => {
              // deal with polling
              if ("numActiveFlows" in json.responseData.extraData) {
                let numActiveFlows = parseInt(json.responseData.extraData.numActiveFlows);
                if (numActiveFlows > 0) {
                  // mid dialog stop polling
                  context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
                  console.log("Stop polling - there active dialogs");
                } else if (context.getters.isPromptPollingActive) {
                  // setup the polling again if needed
                  if (
                    !context.getters.showButtonOnly &&
                    context.getters.isChatOpen &&
                    context.getters.getActivePromptInterval === null
                  ) {
                    console.log("Start up Prompt Trigger Polling");
                    let interval = setInterval(function() {
                      context.dispatch("sendUserInput", "&command=prompt");
                    }, context.getters.getPromptPollingIntervalInMilliseconds);
                    context.commit("SET_PROMPT_TRIGGER_INTERVAL", interval);
                  } else if (!context.getters.isChatOpen) {
                    console.log(`Stop prompt trigger polling - chat is closed`);
                    context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
                  }
                }
              } else if (!("numActiveFlows" in json.responseData.extraData) && context.getters.isPromptPollingActive) {
                console.groupCollapsed(
                  `%c Config Error!! ⚠ %c Leopard Chat UI 💬 %c`,
                  "background:#C60909 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
                  "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
                  "background:transparent"
                );
                console.log("Prompt polling is active but you are not returning the numActiveFlows from Teneo");
                console.log("Documentation: https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling");
                console.groupEnd();
              }
              if (params.indexOf("command=prompt") !== -1 && json.responseData.answer.trim() === "") {
                // console.log(`Poll returned nothing..`);
                return;
              } else if (
                params !== "" &&
                params.indexOf("command=prompt") !== -1 &&
                json.responseData.answer.trim() !== ""
              ) {
                var audio = new Audio(require("./assets/notification.mp3"));
                audio.play();
              }
              context.commit("HIDE_CHAT_LOADING");

              if (json.responseData.extraData.offerFeedbackForm) {
                const feedbackConfig = JSON.parse(decodeURIComponent(json.responseData.extraData.offerFeedbackForm));
                context.commit("ADD_FEEDBACK_FORM", feedbackConfig);
              } else {
                context.commit("CLEAR_FEEDBACK_FORM");
              }
              if (json.responseData.isNewSession || json.responseData.extraData.newsession) {
                // console.log("Session is stale.. keep chat open and continue with the new session");
                context.commit(
                  "SHOW_MESSAGE_IN_CHAT",
                  "You have been away for an extended period of time. A new session with the virtual assistant has been created."
                );
              }

              if ("script" in json.responseData.extraData) {
                let theScript = decodeURIComponent(json.responseData.extraData.script);
                sendMessageToParent("runLeopardScript|" + theScript);
              }
              // Start of delay logic
              if ("command" in json.responseData.extraData && json.responseData.extraData.command === "delay") {
                context.commit("SHOW_RESPONSE_DELAY");
                context.commit("SET_USER_INPUT", "");
                context
                  .dispatch("sendUserInput", "&command=continue")
                  .then(console.log(`Continue with long operation`))
                  .catch(err => {
                    console.err("Unable to continue conversation", err.message);
                    context.commit("SHOW_MESSAGE_IN_CHAT", "We're sorry for the inconvience: " + err.message);
                  });
              }

              if (params.indexOf("command=continue") !== -1) {
                context.commit("HIDE_RESPONSE_DELAY");
              }
              // end of delay logic

              if ("inputType" in json.responseData.extraData && json.responseData.extraData.inputType === "upload") {
                context.commit("SHOW_UPLOAD_BUTTON");
              }
              // look for request for location information in the response

              if (
                "inputType" in json.responseData.extraData &&
                json.responseData.extraData.inputType.startsWith("location")
              ) {
                config
                  .getLocator()
                  .then(function(position) {
                    // we now have the user's lat and long
                    console.log(`${position.coords.latitude}, ${position.coords.longitude}`);
                    if (json.responseData.extraData.inputType === "locationLatLong") {
                      // send the lat and long
                      context
                        .dispatch(
                          "sendUserInput",
                          "&locationLatLong=" + encodeURI(position.coords.latitude + "," + position.coords.longitude)
                        )
                        .then(
                          console.log(
                            `Sent user's lat and long: ${position.coords.latitude}, ${position.coords.longitude}`
                          )
                        )
                        .catch(err => {
                          console.err("Unable to send lat and long info", err.message);
                          context.commit(
                            "SHOW_MESSAGE_IN_CHAT",
                            "We were unable to obtain your location information.: " + err.message
                          );
                        });
                    } else if (process.env.VUE_APP_LOCATION_IQ_KEY) {
                      // good we have a licence key we can send all location information back
                      let locationRequestType = json.responseData.extraData.inputType;
                      superagent
                        .get(
                          `https://us1.locationiq.com/v1/reverse.php?key=${process.env.VUE_APP_LOCATION_IQ_KEY}&lat=${
                            position.coords.latitude
                          }&lon=${position.coords.longitude}&format=json&normalizecity=1&t=${new Date().valueOf()}`
                        )
                        .accept("application/json")
                        .then(res => {
                          let data = res.body;

                          let queryParam = `&${locationRequestType}=`;
                          if (locationRequestType === "locationJson") {
                            queryParam += encodeURI(JSON.stringify(data));
                          } else if (locationRequestType === "locationZip") {
                            queryParam += encodeURI(data.address.postcode);
                          } else if (locationRequestType === "locationCityStateZip") {
                            queryParam += encodeURI(
                              `${data.address.city}, ${data.address.state} ${data.address.postcode}`
                            );
                          }

                          context
                            .dispatch("sendUserInput", queryParam)
                            .then(
                              console.log(
                                `Sent user's location information: ${data.address.city}, ${data.address.state} ${data.address.postcode}`
                              )
                            )
                            .catch(err => {
                              console.err("Unable to send user location", err.message);
                              context.commit(
                                "SHOW_MESSAGE_IN_CHAT",
                                "We were unable to obtain your location information.: " + err.message
                              );
                            });
                        })
                        .catch(console.error);
                    } else if (
                      !process.env.VUE_APP_LOCATION_IQ_KEY &&
                      json.responseData.extraData.inputType ===
                        ("locationCityStateZip" || "locationZip" || "locationJson")
                    ) {
                      // no good. Asking for location information that requires a licence  key
                      context.commit(
                        "SHOW_MESSAGE_IN_CHAT",
                        "A licence key for https://locationiq.com/ is needed to obtain the requested location information. Check the documentation."
                      );
                    }
                  })
                  .catch(function(err) {
                    console.error("Position Error ", err.toString());
                  });
              }

              // console.log(decodeURIComponent(json.responseData.answer))
              const response = {
                userInput: currentUserInput,
                id: uuidv1(),
                teneoAnswer: decodeHTML(
                  markdown.toHTML(
                    decodeURIComponent(json.responseData.answer).replace(/onclick="[^"]+"/g, 'class="sendInput"')
                  )
                ),
                teneoResponse: json.responseData
              };

              if (response.teneoResponse) {
                let ttsText = stripHtml(response.teneoAnswer);
                if (response.teneoResponse.extraData.tts) {
                  ttsText = stripHtml(decodeURIComponent(response.teneoResponse.extraData.tts));
                }

                // check if this browser supports the Web Speech API
                if (
                  Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
                  Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
                ) {
                  if (context.getters.tts && context.getters.speakBackResponses) {
                    context.getters.tts.say(ttsText);
                  }
                }

                if (context.getters.askingForPassword) {
                  context.commit("UPDATE_CHAT_WINDOW_AND_STORAGE", {
                    response,
                    mask: true
                  });
                } else {
                  context.commit("UPDATE_CHAT_WINDOW_AND_STORAGE", {
                    response,
                    mask: false
                  });
                }

                context.commit("HIDE_PROGRESS_BAR");
                if (response.teneoResponse.extraData.liveChat) {
                  context.commit("START_LIVE_CHAT");
                }
                if (response.teneoResponse.extraData.chatTitle) {
                  let chatTitle = decodeURIComponent(response.teneoResponse.extraData.chatTitle);
                  if (chatTitle !== "undefined") {
                    context.commit("SET_CHAT_TITLE", chatTitle);
                  }
                }

                // added on request from Mark J - switch languages based on NER language detection
                let langInput = decodeURIComponent(response.teneoResponse.extraData.langinput);
                let langEngineUrl = decodeURIComponent(response.teneoResponse.extraData.langengineurl);
                let lang = decodeURIComponent(response.teneoResponse.extraData.lang);
                let langurl = decodeURIComponent(response.teneoResponse.extraData.langurl);

                if (langEngineUrl !== "undefined" && langInput !== "undefined") {
                  context.commit("UPDATE_TENEO_URL", langEngineUrl + "?viewname=STANDARDJSONP");
                  context.commit("SET_USER_INPUT", langInput);
                  context.commit("SHOW_PROGRESS_BAR");

                  if (lang !== "undefined") {
                    context.commit("UPDATE_UI_LOCALE", lang);
                    context.commit("CHANGE_ASR_TTS", lang);
                  }

                  if (langurl !== "undefined") {
                    context.commit("UPDATE_FRAME_URL", langurl);
                  }

                  context
                    .dispatch("sendUserInput")
                    .then(console.log("Sent original lang input to new lang specific solution"))
                    .catch(err => {
                      console.err("Unable to send lang input to new lang specific solution", err.message);
                      context.commit(
                        "SHOW_MESSAGE_IN_CHAT",
                        "Unable to send lang input to new lang specific solution: " + err.message
                      );
                    });
                }
              }
            })
            .catch(err => {
              console.log(err);
              if (err.status && err.status === 408) {
                console.log("Oh dear - Request Timed Out");
                context.commit("SHOW_MESSAGE_IN_CHAT", "I'm sorry but the request timed out - Please try again.");
              } else if (err.status && err.status === 400) {
                context.commit(
                  "SHOW_MESSAGE_IN_CHAT",
                  "I'm sorry, I wasn't able to communicate with the virtual assitant. Please check your internet connection."
                );
              } else {
                context.commit("SHOW_MESSAGE_IN_CHAT", err.message);
              }
              context.commit("HIDE_PROGRESS_BAR");
            });
        } else {
          // send the input to live chat agent and save user input to history
          let newUserInput = {
            type: "userInput",
            text: currentUserInput,
            bodyText: "",
            hasExtraData: false
          };
          context.commit("PUSH_USER_INPUT_TO_DIALOG", newUserInput);

          if (!config.USE_SESSION_STORAGE) {
            localStorage.setItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY, JSON.stringify(context.getters.dialog));
          }
          context.commit(
            "SET_DIALOG_HISTORY",
            JSON.parse(sessionStorage.getItem(STORAGE_KEY + config.TENEO_CHAT_HISTORY))
          );
          if (context.getters.dialogHistory === null) {
            context.commit("SET_DIALOG_HISTORY", context.getters.dialog);
          } else {
            context.commit("PUSH_USER_INPUT_TO_DIALOG_HISTORY", newUserInput);
          }
          sessionStorage.setItem(
            STORAGE_KEY + config.TENEO_CHAT_HISTORY,
            JSON.stringify(context.getters.dialogHistory)
          );
          config.liveChat.sendMessage(currentUserInput);
          context.commit("HIDE_PROGRESS_BAR");
          context.commit("CLEAR_USER_INPUT");
        }
      },
      captureAudio(context) {
        context.commit("START_AUDIO_CAPTURE");
      }
    }
  });

  // setup i18n for Leopard UI
  Vue.use(vuexI18n.plugin, store);
  Object.keys(TRANSLATIONS).forEach(function(key) {
    Vue.i18n.add(key, TRANSLATIONS[key]);
  });
  Vue.i18n.set(config.LOCALE);

  // Setup ASR
  initializeASR(store, config.ASR_CORRECTIONS_MERGED);

  // Setup Live Chat
  config.setupLiveChat(store);

  callback(vuetify, store);
}

function stoperror() {
  return true;
}

// function isChatOpenLocalStorage() {
//   console.log(`store: isChatOpenLocalStorage`);
//   let isChatOpen = localStorage.getItem("isChatOpen");

//   if (isChatOpen === null) {
//     isChatOpen = false;
//   } else {
//     isChatOpen = JSON.parse(isChatOpen);
//   }

//   console.log(isChatOpen);
//   let result = false;

//   if (isChatOpen) {
//     console.log(`store: isChatOpenLocalStorage: send message to parent: OPEN`);
//     sendMessageToParent("showLeopard");
//     // console.log("Initial Chat Window State = Open");
//     result = true;
//   } else {
//     localStorage.setItem("isChatOpen", "false");
//     console.log(`store: isChatOpenLocalStorage: send message to parent: CLOSE`);
//     sendMessageToParent("hideLeopard");
//     // console.log("Initial Chat Window State = Closed");
//     result = false;
//   }
//   // console.log("isChatOpenLocalStorage: " + result);
//   console.log(`Local Storage Finally Thinks "isChatOpenLocalStorage": ${result}`);
//   return result;
// }

function sendMessageToParent(message) {
  console.log(`store: sendMessageToParent: ${message}`);
  if (parent) {
    parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specifiy origin for each post.
    // console.log("Message from Leopard >> Embed : " + message);
  }
}

function decodeHTML(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function receiveMessageFromParent(event) {
  try {
    // if (event.origin !== "http://example.com:8080") return;
    if (event.data) {
      let messageObject = JSON.parse(event.data);
      if ("info" in messageObject && "id" in messageObject) {
        return true;
      }

      // console.log("Recived a message from parent...");
      // console.log(messageObject);
      // event.source.postMessage("This is a message sent back from Leopard to the site embedding Leopard", event.origin);

      if ("frameHeight" in messageObject) {
        store.state.ui.parent = {
          frameHeight: messageObject.frameHeight
        };
        localStorage.setItem(STORAGE_KEY + "parentHeight", messageObject.frameHeight);
        console.log(`receiveMessageFromParent: parentHeight = ${messageObject.frameHeight}`);
        // trigger a resize event
        let evt = window.document.createEvent("UIEvents");
        evt.initUIEvent("resize", true, false, window, 0);
        window.dispatchEvent(evt);
      } else {
        store.state.connection.ctxParameters = messageObject;
      }
    }
  } catch (error) {
    stoperror();
  }
}

window.addEventListener("message", receiveMessageFromParent);
