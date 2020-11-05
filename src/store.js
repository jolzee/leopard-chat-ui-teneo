/* eslint-disable no-unused-vars */
// import VuePlyr from "vue-plyr";
import Listening from "@/components/Listening.vue"; // component dialog that shows then capturing audio
import Modal from "@/components/Modal.vue";
import { STORAGE_KEY } from "@/constants/solution-config-default"; // application storage key
import { TRANSLATIONS } from "@/constants/translations"; // add UI translations for different language here
import router from "@/router";
import { initializeASR, initializeTTS } from "@/utils/asr-tts";
import enableDrag from "@/utils/drag";
import Firebase from "@/utils/firebase";
import liveChatConfig from "@/utils/livechat-config";
import PostMessage from "@/utils/postMessage";
import Setup from "@/utils/setup";
import Polly from "@/utils/polly";
// Controls Data Store and Flow for Components...
import {
  cleanEmptyChunks,
  doesParameterExist,
  generateQueryParams,
  getParameterByName,
  isLight,
  queryParamStringAsObject,
  sleep,
  uuid,
  addTtsPauses
} from "@/utils/utils";
import { accountsSdk } from "@livechat/accounts-sdk";
import LiveChat from "@livechat/agent-app-widget-sdk";
import dayjs from "dayjs";
import gravatar from "gravatar";
import "regenerator-runtime/runtime";
import Vue from "vue";
import VueLoadersBallPulseSync from "vue-loaders/dist/loaders/ball-pulse-sync";
import VueLoadersLineScale from "vue-loaders/dist/loaders/line-scale";
import VueLoadersLineScalePulseOutRapid from "vue-loaders/dist/loaders/line-scale-pulse-out-rapid";
import Snotify, { SnotifyPosition } from "vue-snotify";
import Vuex from "vuex";
import vuexI18n from "vuex-i18n"; // i18n the leopard interface
const logger = require("@/utils/logging").getLogger("store.js");
const replaceString = require("replace-string");
const TIE = require("leopard-tie-client");

const polly = new Polly();

const snotifyOptions = {
  toast: {
    position: SnotifyPosition.leftBottom
  }
};

Vue.use(Snotify, snotifyOptions);

var md = require("markdown-it")({
  html: true,
  xhtmlOut: true,
  breaks: true,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’"
});

const superagent = require("superagent");
var stripHtml = require("striptags");
var mobile = require("is-mobile");

let store;
let setupConfig = new Setup();
Vue.use(Vuex);

Vue.use(require("vue-shortkey"));

Vue.component("teneo-modal", Modal);
Vue.component("teneo-listening", Listening);
Vue.component(VueLoadersBallPulseSync.component.name, VueLoadersBallPulseSync.component);
Vue.component(VueLoadersLineScale.component.name, VueLoadersLineScale.component);
Vue.component(
  VueLoadersLineScalePulseOutRapid.component.name,
  VueLoadersLineScalePulseOutRapid.component
);

Vue.config.productionTip = false;
let liveChatAssistConnectCount = 0;

let postMessage;

export default function getStore() {
  return new Promise((resolve, reject) => {
    setupConfig
      .init()
      .then(vuetify => {
        resolve(storeSetup(vuetify)); // { vuetify, store }
      })
      .catch(error => reject(error));
  });
}

function storeSetup(vuetify) {
  if (!setupConfig.EMBED) {
    enableDrag();
  }
  store = new Vuex.Store({
    plugins: [...(setupConfig.logrocketPlugin ? [setupConfig.logrocketPlugin] : [])],
    state: {
      asr: {
        stopAudioCapture: false,
        asr: null
      },
      accessibleAnnouncement: "",
      chatConfig: setupConfig.chatConfig,
      activeSolution: setupConfig.activeSolution,
      connection: {
        requestParameters: setupConfig.REQUEST_PARAMETERS,
        ctxParameters: doesParameterExist("teneoCtx")
          ? JSON.parse(getParameterByName("teneoCtx"))
          : "",
        teneoUrl: setupConfig.TENEO_URL
      },
      browser: {
        isMobile: mobile(),
        isSimulatedMobile: doesParameterExist("mobile"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      auth: {
        hasLoggedInTeneo: false,
        firebase: null,
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
        iframeUrl: setupConfig.IFRAME_URL,
        iframeUrlBase: setupConfig.IFRAME_URL
          ? setupConfig.IFRAME_URL.substring(0, setupConfig.IFRAME_URL.lastIndexOf("/")) + "/"
          : setupConfig.IFRAME_URL
      },
      teneoSessionId: null,
      promptTriggerInterval: null,
      knowledgeData: setupConfig.KNOWLEDGE_DATA,
      liveAgent: {
        apiAccessToken: null,
        agentAvatar: null,
        agentID: null,
        agentName: null,
        enableLiveChat: setupConfig.ENABLE_LIVE_CHAT,
        isLiveChat: false,
        isAgentAssist: setupConfig.IS_AGENT_ASSIST,
        liveChatMessage: null,
        showLiveChatProcessing: false
      },
      overlay: {
        showOverlayAlert: false,
        overlayAlertMessage: ""
      },
      modals: {
        modalItem: null,
        showConfigModal: true,
        showCustomModal: false,
        showModal: false
      },
      locationInfo: setupConfig.LOCATION,
      hide508: false,
      progress: {
        listening: false,
        progressBar: false,
        showChatLoading: false
      },
      tts: {
        isAsrTtsOnOpenEnabled: setupConfig.SHOULD_TTS_ENABLED_AT_STARTUP,
        speakBackResponses: false,
        tts: initializeTTS(setupConfig.LOCALE)
      },
      ui: {
        vuetify: vuetify,
        chatTitle: setupConfig.CHAT_TITLE,
        css: null,
        dark: localStorage.getItem(STORAGE_KEY + "darkTheme")
          ? localStorage.getItem(STORAGE_KEY + "darkTheme") === "true"
          : false,
        embed: setupConfig.EMBED,
        emergencyConfig: null,
        showDelayedResponse: false,
        hideConfigMenu: window.leopardConfig.hideConfigMenu,
        isWebSite: true,
        snotify: null,
        minimize: null,
        overlayChat: setupConfig.FLOAT,
        responseIcon: setupConfig.RESPONSE_ICON,
        theme: setupConfig.THEME,
        userIcon: setupConfig.USER_ICON,
        parent: {},
        showUploadButton: false,
        showChatWindow: false,
        showChatButton: true,
        closeChatEsc: false
      },
      userInput: {
        userInput: "",
        userInputReadyForSending: false
      }
    },
    getters: {
      playResponseBeep(state) {
        return state.activeSolution.playResponseBeep;
      },
      isAsrEnabled(state) {
        return state.activeSolution.enableAsr;
      },
      isTtsEnabled(state) {
        return state.activeSolution.enableTts;
      },
      getPollyVoice(state) {
        return state.activeSolution.pollyVoice;
      },
      isPollyEnabled(state) {
        return window.leopardConfig.tts.url && state.activeSolution.ttsEngine === "AWS Polly"
          ? true
          : false;
      },
      isAsrTtsOnOpenEnabled(state) {
        return state.tts.isAsrTtsOnOpenEnabled;
      },
      isAuthProviderEnabled: _state => provider => {
        let authProviders = window.leopardConfig.firebase.authProviders;
        if (authProviders) {
          return authProviders.indexOf(provider) > -1;
        } else {
          return true; // just so those that haven't added the env variable get all the existing auth providers
        }
      },
      locationInfo(state) {
        let locationInfo = state.locationInfo;
        return locationInfo ? `&${generateQueryParams(locationInfo)}` : "";
      },
      emergencyConfig(state) {
        return state.ui.emergencyConfig;
      },
      snotify(state) {
        return state.ui.snotify;
      },
      teneoSessionId(state) {
        return state.teneoSessionId;
      },
      mustCloseBecauseOfEscape(state) {
        return state.ui.closeChatEsc;
      },
      theme(state) {
        return state.ui.theme;
      },
      fullscreenEmbed(state) {
        return state.ui.embed && state.ui.parent.width && state.ui.parent.width <= 464;
      },
      accessibleAnnouncement(state) {
        return state.accessibleAnnouncement;
      },
      responseDelay(state) {
        return state.activeSolution.responseDelay;
      },
      leopardFont(state) {
        return state.activeSolution.font;
      },
      responseLookAndFeel(state) {
        return state.activeSolution.lookAndFeel.response;
      },
      questionLookAndFeel(state) {
        return state.activeSolution.lookAndFeel.question;
      },
      showOverlayAlert(state) {
        return state.overlay.showOverlayAlert;
      },
      overlayAlertMessage(state) {
        return state.overlay.overlayAlertMessage;
      },
      liveChatApiToken(state) {
        return state.liveAgent.apiAccessToken;
      },
      hide508(state) {
        return state.hide508;
      },
      hasLoggedInTeneo(state) {
        return state.auth.hasLoggedInTeneo;
      },
      isLiveAgentAssist(state) {
        return state.liveAgent.isAgentAssist;
      },
      config(state) {
        return state.chatConfig;
      },
      isPromptPollingActive(state) {
        if (
          "promptTriggers" in state.activeSolution &&
          state.activeSolution.promptTriggers.enabled
        ) {
          return true;
        }
        return false;
      },
      getPromptPollingIntervalInMilliseconds(state) {
        if (
          "promptTriggers" in state.activeSolution &&
          state.activeSolution.promptTriggers.pollSeconds
        ) {
          return parseInt(state.activeSolution.promptTriggers.pollSeconds) * 1000;
        }
        return 10000; // default to 10 seconds
      },
      showDelayedResponse(state) {
        return state.ui.showDelayedResponse;
      },
      isChatOpen(state) {
        logger.debug(`store:getters:isChatOpen: ${state.ui.showChatWindow}`);
        return state.ui.showChatWindow;
      },
      minimize(state) {
        logger.debug(`store:getters:minimize: ${state.ui.minimize}`);
        return state.ui.minimize;
      },
      hideConfigMenu(state) {
        return state.ui.hideConfigMenu;
      },
      uuid(_state) {
        return uuid();
      },
      showButtonOnly(state) {
        logger.debug(`store: showButtonOnly: ${state.ui.embed && !state.ui.showChatWindow}`);
        return state.ui.embed && !state.ui.showChatWindow;
      },
      getAnimatedIn(state, getters) {
        if (getters.isMobileDevice) {
          return "";
        }
        let animation = "";
        if ("animations" in state.activeSolution && !getters.embed) {
          animation = state.activeSolution.animations.in;
        }
        return animation;
      },
      getAnimatedOut(state, getters) {
        if (getters.isMobileDevice) {
          return "";
        }
        let animation = "";
        if ("animations" in state.activeSolution && !getters.embed) {
          animation = state.activeSolution.animations.out;
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
        if (getters.getItemProperty(item, "uploadConfig")) {
          uploadConfigJson = getters.getItemProperty(item, "uploadConfig");
        }

        return uploadConfigJson;
      },
      isMobileDevice: state => state.browser.isMobile,
      isSimulatedMobileDevice: state => state.browser.isSimulatedMobile,
      socialAuthEnabled: state => (state.auth.firebase ? true : false),
      lastReplyItem: state => {
        return state.conversation.dialog
          .slice()
          .reverse()
          .find(item => item.type === "reply");
      },
      userInformationParams(state) {
        let userInfoParams = "";

        // {
        //   user: user,
        //   providerId: "microsoft.com",
        //   additional: {
        //     credentials: result.credentials,
        //     mail: result.additionalUserInfo.profile.mail,
        //     phone: result.additionalUserInfo.profile.mobilePhone,
        //     displayName: result.additionalUserInfo.profile.displayName,
        //     surname: result.additionalUserInfo.profile.surname,
        //     givenName: result.additionalUserInfo.profile.givenName,
        //     jobTitle: result.additionalUserInfo.profile.jobTitle,
        //     userPrincipleName: result.additionalUserInfo.profile.userPrincipleName,
        //     accessToken: result.credential.accessToken,
        //     providerId: "microsoft.com"
        //   }
        // }
        if (state.auth.userInfo.user) {
          logger.info(`USER-INFO`, state.auth.userInfo.user.additional);
          if (
            "providerId" in state.auth.userInfo.user &&
            state.auth.userInfo.user.providerId === "microsoft.com"
          ) {
            userInfoParams = `&${generateQueryParams(state.auth.userInfo.user.additional)}`;
            logger.debug(`Microsoft query Params:`, userInfoParams);
          } else {
            userInfoParams = `&name=${state.auth.userInfo.user.user.displayName}&email=${state.auth.userInfo.user.user.email}`;
          }
        }
        return userInfoParams;
      },
      askingForPassword(_state, getters) {
        let item = getters.lastReplyItem;
        let isAskingForPassword = false;
        if (item && item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (
            tResp.hasParameter("inputType") &&
            tResp.getParameter("inputType").trim().toLowerCase() === "password"
          ) {
            isAskingForPassword = true;
          }
        }
        return isAskingForPassword;
      },
      inputHelpText(_state, getters) {
        let item = getters.lastReplyItem;
        let inputHelpText;
        if (item && item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter("inputHelpText") && tResp.getParameter("inputHelpText")) {
            inputHelpText = tResp.getParameter("inputHelpText");
          }
        }
        return inputHelpText;
      },
      itemInputMask(_state, getters) {
        let item = getters.lastReplyItem;
        let itemInputMask;
        if (item && item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter("inputMask")) {
            itemInputMask = tResp.getParameter("inputMask");
          }
        }
        logger.debug("Input Mask: ", itemInputMask);
        return itemInputMask;
      },
      askingForEmail(_state, getters) {
        let item = getters.lastReplyItem;
        let isAskingForEmail = false;
        if (item && item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (
            tResp.hasParameter("inputType") &&
            tResp.getParameter("inputType").trim().toLowerCase() === "email"
          ) {
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
        let modalPosition = null;
        if (item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter("modalPosition")) {
            modalPosition = tResp.getParameter("modalPosition").toLowerCase();
          }
        }
        return modalPosition;
      },
      modalSize: _state => item => {
        let modalSize = null;
        if (item.teneoResponse) {
          let tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter("modalSize")) {
            modalSize = tResp.getParameter("modalSize").toLowerCase();
          }
        }
        return modalSize;
      },
      outputLink: _state => item => {
        const tResp = TIE.wrap(item.teneoResponse);
        return tResp.getLink();
      },
      liveChatTranscript: _state => item => {
        let tResp = TIE.wrap(item.teneoResponse);
        return tResp.getParameter("liveChat");
      },
      profileImageFromEmail: _state => email => {
        return gravatar.url(email, { protocol: "https" });
      },
      isVideoFile: _state => url => {
        logger.debug("IsVideo:" + url);
        const regExp = /\.(?:mp4|webm|ogg)$/i;
        const match = url.match(regExp);
        let result = match ? match[0].substring(1, match[0].length) : false;
        logger.debug(result);
        return result;
      },
      isAudioFile: _state => url => {
        logger.debug("ISAudio:" + url);
        const regExp = /\.(?:wav|mp3|ogg)$/i;
        const match = url.match(regExp);
        let result = match ? match[0].substring(1, match[0].length) : false;
        logger.debug(result);
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
      textColor: state => themeColorName => {
        if (!vuetify.framework.theme.isDark) {
          let hexColor = state.ui.theme[themeColorName];
          return isLight(hexColor) ? "black--text" : "white--text";
        } else {
          return "white--text";
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
          if (
            !getters.extensionIsInline(extension) &&
            !extension.name.startsWith("displayCollection")
          ) {
            modalExtensions.push(extension);
          }
        });
        return modalExtensions;
      },
      getItemProperty: _state => (item, name) => {
        let response = {};
        if (item && item.teneoResponse) {
          const tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter(name)) {
            response = tResp.getParameter(name);
          }
        }
        return response;
      },
      itemExtensions: _state => item => {
        let actions = [];
        if (item && item.teneoResponse) {
          const tResp = TIE.wrap(item.teneoResponse);
          if (
            Object.keys(tResp.getJson().output.parameters).some(function (k) {
              return ~k.indexOf("extensions");
            })
          ) {
            // sort the keys for ordering of extensions
            const ordered = {};
            Object.keys(tResp.getJson().output.parameters)
              .sort()
              .forEach(function (key) {
                ordered[key] = tResp.getParameter(key);
              });
            try {
              for (let key in ordered) {
                if (key.startsWith("extensions")) {
                  // let value = parseExtraData(ordered[key]);
                  if (ordered[key]) {
                    logger.debug(`Item Extensions > Key: ${key} Value:`, ordered[key]);
                    actions.push(ordered[key]);
                  }
                }
              }
            } catch (e) {
              logger.error(e);
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
        let result = false;
        if (item.teneoResponse) {
          const tResp = TIE.wrap(item.teneoResponse);
          if (tResp.hasParameter("offerFeedbackForm")) {
            result = true;
          }
        }
        return result;
      },
      hasModal: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        let hasModal = false;
        extensions.forEach(extension => {
          if (
            extension &&
            !extension.inline &&
            extension.name &&
            !extension.name.startsWith("displayCollection") &&
            !extension.name.startsWith("displayRouterCheckList")
          ) {
            hasModal = true;
          }
        });

        return hasModal;
      },
      getNamedExtension: (_state, getters) => (item, name) => {
        let extensions = getters.itemExtensions(item);
        let foundExtension = null;
        extensions.forEach(extension => {
          if (extension.name && extension.name.toLowerCase() === name.toLowerCase()) {
            foundExtension = extension;
          }
        });

        return foundExtension;
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
      hasExtensions: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        return extensions.length > 0;
      },
      hasMediaExtensions: (_state, getters) => item => {
        let extensions = getters.itemExtensions(item);
        let hasMediaExtensions = false;
        extensions.forEach(extension => {
          if (getters.hasExtensionType(extension, "youTube")) {
            hasMediaExtensions = true;
          } else if (getters.hasExtensionType(extension, "vimeo")) {
            hasMediaExtensions = true;
          } else if (getters.hasExtensionType(extension, "video")) {
            hasMediaExtensions = true;
          } else if (getters.hasExtensionType(extension, "map")) {
            hasMediaExtensions = true;
          } else if (getters.hasExtensionType(extension, "image")) {
            hasMediaExtensions = true;
          } else if (getters.hasExtensionType(extension, "carousel")) {
            hasMediaExtensions = true;
          }
        });
        return hasMediaExtensions;
      },
      hasExtensionType: (_state, getters) => (extension, type) => {
        if (extension) {
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
            case "cardCutomHtml":
              if (extension.name === "displayCardCutomHtml") {
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
      hasInlineType: (_state, getters) => (extension, type) => {
        if (extension && extension.inline) {
          switch (type) {
            case "youTube":
              if (getters.youTubeVideoId(extension)) {
                return true;
              }
              break;
            case "alert":
              if (extension.name === "displayAlert") {
                return true;
              }
              break;
            case "cardCustomHtml":
              if (extension.name === "displayCardCutomHtml") {
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
            case "table":
              if (extension.name === "displaySimpleTable") {
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
          logger.debug(`image URL ${extension.parameters.image_url}`);
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
        logger.debug(
          `Session Storage? ${setupConfig.USE_SESSION_STORAGE} Dialog Length ${state.conversation.dialog.length}`
        );
        if (!setupConfig.USE_SESSION_STORAGE && state.conversation.dialog.length === 0) {
          logger.debug("Checking for stale session - embed");
          // typically here when in production embedded state
          // check if session expired
          let now = new Date();
          let lastInteractionTime = localStorage.getItem(
            STORAGE_KEY + setupConfig.TENEO_LAST_INTERACTION_DATE
          );
          if (!lastInteractionTime) {
            logger.debug("No previous interaction time...");
            state.conversation.dialog = JSON.parse(
              localStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]")
            );
          } else {
            logger.debug(`found last interaction time: ${lastInteractionTime}`);
            var diff = (now.getTime() - lastInteractionTime) / 1000;
            diff /= 60;
            let diffMins = Math.abs(Math.round(diff));
            logger.debug(`Minutes Difference: ${diffMins}`);
            if (diffMins > 0) {
              localStorage.setItem(
                STORAGE_KEY + setupConfig.TENEO_LAST_INTERACTION_DATE,
                now.getTime()
              );
              state.conversation.dialog = [];
              localStorage.setItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]");
            } else {
              // "session" still active
              state.conversation.dialog = JSON.parse(
                localStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]")
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
          if (setupConfig.USE_SESSION_STORAGE) {
            state.conversation.dialogHistory = JSON.parse(
              sessionStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]")
            );
          } else {
            state.conversation.dialogHistory = JSON.parse(
              localStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]")
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
        return state.auth.userInfo.user.user ? state.auth.userInfo.user.user.photoURL : "";
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
        return state.liveAgent.isAgentAssist ? true : state.activeSolution.showChatIcons;
      },
      showUploadButton(state) {
        return state.ui.showUploadButton;
      }
    },
    mutations: {
      SET_EMERGENCY_CONFIG(state, config) {
        config.payload = config.payload.split("?").join("&");
        state.ui.emergencyConfig = config;
      },
      SET_SNOTIFY(state, config) {
        state.ui.snotify = config;
      },
      SET_CUSTOM_CSS(state, config) {
        state.ui.css = config;
      },
      SET_TENEO_SESSION_ID(state, newSessionId) {
        state.teneoSessionId = newSessionId;
      },
      CLEAR_TENEO_SESSION_ID(state) {
        state.teneoSessionId = null;
      },
      HIDE_508_CONTENT(state) {
        state.hide508 = true;
      },
      SHOW_508_CONTENT(state) {
        state.hide508 = false;
      },
      SET_ACCESSIBLE_ANNOUNCEMENT(state, message) {
        state.accessibleAnnouncement = stripHtml(message);
      },
      SHOW_OVERLAY_ALERT(state, message) {
        state.overlay.overlayAlertMessage = message;
        state.overlay.showOverlayAlert = true;
        setTimeout(function () {
          state.overlay.showOverlayAlert = false;
          state.overlay.overlayAlertMessage = "";
        }, 2000);
      },
      SET_CHAT_CONFIG(state, chatConfig) {
        state.chatConfig = chatConfig;
      },
      CLOSE_CHAT_ESC(state) {
        logger.debug(`CLOSE_CHAT_ESC`);
        state.ui.closeChatEsc = true;
      },
      RESET_MUST_CLOSE(state) {
        state.ui.closeChatEsc = false;
      },
      CLOSE_OVERLAY_ALERT(state) {
        state.overlay.showOverlayAlert = false;
        state.overlay.overlayAlertMessage = "";
      },
      LIVE_CHAT_API_ACCESS_TOKEN(state, token) {
        state.liveAgent.apiAccessToken = token;
      },
      CHANGE_CHAT_TITLE(state, title) {
        state.ui.chatTitle = title;
      },
      RESET_CHAT_TITLE(state) {
        state.ui.chatTitle = setupConfig.CHAT_TITLE;
      },
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
      HIDE_CHAT_WINDOW_DISPLAY_EMBED(state, _getters) {
        logger.debug(`HIDE_CHAT_WINDOW_DISPLAY_EMBED`);
        localStorage.setItem("isChatOpen", false);
        state.ui.showChatWindow = false;
      },
      HIDE_CHAT_WINDOW(state) {
        polly.stop();
        polly.destroy();
        logger.debug(`store: HIDE_CHAT_WINDOW`);
        state.ui.showChatWindow = false;
      },
      OPEN_CHAT_WINDOW_DISPLAY_EMBED(state, _getters) {
        state.ui.showChatWindow = true;
        logger.debug(`OPEN_CHAT_WINDOW_DISPLAY_EMBED`);
        postMessage.sendMessageToParent("showLeopard");
        localStorage.setItem("isChatOpen", true);
      },
      TOGGLE_CHAT_WINDOW_DISPLAY(state, _getters) {
        state.ui.showChatWindow = !state.ui.showChatWindow;
        if (!state.ui.showChatWindow) {
          polly.stop();
          polly.destroy();
        }
        logger.debug(
          `store: TOGGLE_CHAT_WINDOW_DISPLAY:  state.ui.showChatWindow has toggled to: ${state.ui.showChatWindow}`
        );
        if (state.ui.embed) {
          logger.debug(`TOGGLE_CHAT_WINDOW_DISPLAY: ${state.ui.showChatWindow}`);
          localStorage.setItem("isChatOpen", state.ui.showChatWindow);
          logger.debug(
            `store: TOGGLE_CHAT_WINDOW_DISPLAY: sending message to parent to ${state.ui.showChatWindow}`
          );
          postMessage.sendMessageToParent(state.ui.showChatWindow ? "showLeopard" : "hideLeopard");
        }
      },
      SHOW_CHAT_WINDOW(state) {
        logger.debug(`store: SHOW_CHAT_WINDOW`);
        state.ui.showChatWindow = true;
      },
      LOGGED_INTO_TENEO(state) {
        state.auth.hasLoggedInTeneo = true;
      },
      LOG_OUT_TENEO(state) {
        state.auth.hasLoggedInTeneo = false;
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
      SHOW_SIMPLE_MESSAGE_IN_CHAT(state, config) {
        state.progress.showChatLoading = false;
        let miscMessage = {
          type: "miscMessage",
          message: null,
          borderPosition: "left",
          alertType: null,
          color: "info",
          prominent: false,
          outlined: false,
          icon: null,
          bodyText: "",
          hasExtraData: false
        };
        Object.assign(miscMessage, config);
        if (!miscMessage.icon && !miscMessage.alertType) {
          miscMessage.alertType = "info";
        }
        state.conversation.dialog.push(miscMessage);
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
          message: message,
          borderPosition: borderPosition,
          alertType: type,
          color: color,
          prominent: prominent,
          outlined: outlined,
          icon: icon,
          bodyText: "",
          hasExtraData: false
        };
        state.conversation.dialog.push(miscMessage);
      },
      PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG(state, liveChatResponse) {
        logger.debug(`Pushing LiveChat response onto chat dialog`, liveChatResponse);
        state.conversation.dialog.push(liveChatResponse);
      },
      CLEAR_USER_INPUT(state) {
        state.userInput.userInput = "";
      },
      SET_FIREBASE(state, firebase) {
        state.auth.firebase = firebase;
      },
      SHOW_CHAT_LOADING(state) {
        logger.debug("Showing Chat Loading Animation");
        state.progress.showChatLoading = true;
      },
      HIDE_CHAT_LOADING(state) {
        logger.debug("Hiding Chat Loading Animation");
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
        logger.debug(`Clearing Chat History`);
        state.conversation.dialog = [];
        localStorage.setItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY, "[]");
      },
      LIVE_CHAT(_state, transcript) {
        setupConfig.liveChat.sendMessage(transcript);
      },
      START_LIVE_CHAT(state) {
        state.liveAgent.isLiveChat = true;
      },
      STOP_LIVE_CHAT(state) {
        state.liveAgent.isLiveChat = false;
      },
      DISABLE_LIVE_CHAT(state) {
        state.liveAgent.enableLiveChat = false;
      },
      MINIMIZE_NOW(state) {
        state.ui.minimize = 0.1;
      },
      MINIMIZE_DELAY(state, delaySeconds) {
        state.ui.minimize = delaySeconds;
      },
      MINIMIZE_DELAY_REMOVE(state) {
        state.ui.minimize = null;
      },
      CHANGE_THEME(state) {
        state.ui.dark = !state.ui.dark;
        localStorage.setItem(
          STORAGE_KEY + setupConfig.TENEO_CHAT_DARK_THEME,
          JSON.stringify(state.ui.dark)
        );
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
        } else {
          state.userInput.userInput = "";
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
        if (payload.response.teneoResponse) {
          const tResp = TIE.wrap(payload.response.teneoResponse);
          if (
            Object.keys(tResp.getJson().output.parameters).some(function (k) {
              return ~k.indexOf("extensions");
            }) ||
            tResp.hasParameter("liveChat") ||
            tResp.hasLink()
          ) {
            hasExtraData = true;
          }
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
          id: uuid(),
          text: cleanEmptyChunks(payload.response.teneoAnswer),
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

        // deal with persisting the chat history
        if (!setupConfig.USE_SESSION_STORAGE) {
          localStorage.setItem(
            STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY,
            JSON.stringify(state.conversation.dialog)
          );
        }
        state.conversation.dialogHistory = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY)
        );
        if (state.conversation.dialogHistory === null) {
          state.conversation.dialogHistory = state.conversation.dialog;
        } else {
          // add current user input and teneo response to the dialog history
          if (newUserInput.text) {
            state.conversation.dialogHistory.push(newUserInput);
          }
          state.conversation.dialogHistory.push(newReply);
        }
        // save the dialog history in session storage
        sessionStorage.setItem(
          STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY,
          JSON.stringify(state.conversation.dialogHistory)
        );
      },
      REMOVE_FORM_CONFIG(state, itemId) {
        let foundHistory = state.conversation.dialogHistory.find(function (item) {
          return item.id === itemId;
        });

        let tResHis = null;
        if (foundHistory && foundHistory.teneoResponse) {
          tResHis = TIE.wrap(foundHistory.teneoResponse);
        }

        if (tResHis && tResHis.hasParameter("formConfig")) {
          delete foundHistory.teneoResponse.output.parameters.formConfig;
        }

        let found = state.conversation.dialog.find(function (item) {
          return item.id === itemId;
        });

        let tResConv = null;
        if (found && found.teneoResponse) {
          tResConv = TIE.wrap(found.teneoResponse);
        }

        if (tResConv && tResConv.hasParameter("formConfig")) {
          delete found.teneoResponse.output.parameters.formConfig;
        }

        sessionStorage.setItem(
          STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY,
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
        polly.stop(); // leave
        state.asr.stopAudioCapture = true;
      },
      START_AUDIO_CAPTURE(state) {
        polly.stop();
        if (state.asr.asr !== null) {
          if (state.tts.tts.isSpeaking()) {
            logger.debug(`TTS was speaking. Stopping the existing chatter.`);
            state.tts.tts.shutUp();
          }
          state.asr.stopAudioCapture = false;
          try {
            state.asr.asr.start();
          } catch (e) {
            logger.debug(`Attempted to start ASR when it was already active`, e);
          }
        }
      },
      ADD_FEEDBACK_FORM(state, feedbackFormConfig) {
        state.conversation.feedbackFormConfig = feedbackFormConfig;
      },
      CLEAR_FEEDBACK_FORM(state) {
        state.conversation.feedbackFormConfig = null;
      },
      HIDE_CHAT_MODAL(state) {
        logger.debug("hiding modal");
        state.userInput.userInputReadyForSending = false;
        state.modals.showModal = false;
        state.modals.modalItem = null;
        logger.debug("modal item should be empty");
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
          postMessage.sendMessageToParent(`runLeopardScript|window.location.href = '${newUrl}';`);
        }
        state.iframe.iframeUrl = newUrl;
        state.iframe.iframeUrlBase = newUrl.substring(0, newUrl.lastIndexOf("/")) + "/";
      },
      USER_INFO(state, userInfo) {
        state.auth.userInfo.user = userInfo;
        // TODO: tell sentry and logrocket
      },
      CHANGE_ASR_TTS(state, lang) {
        state.tts.tts = initializeTTS(lang);
        initializeASR(store, setupConfig.ASR_CORRECTIONS_MERGED);
      },
      CHANGE_POLLY_VOICE(state, voice) {
        state.activeSolution.pollyVoice = voice;
        state.activeSolution.ttsEngine = "AWS Polly";
      },
      CLEAR_USER_INFO(state) {
        state.auth.userInfo.user = null;
      }
    },
    actions: {
      shouldBackupSolutionsConfig() {
        return new Promise(resolve => {
          let now = dayjs();

          let lastSolutionBackupDate = localStorage.getItem(STORAGE_KEY + "lastBackupDate");

          if (lastSolutionBackupDate) {
            let pastDate = dayjs(lastSolutionBackupDate);
            let daysDiff = now.diff(pastDate, "day");
            if (daysDiff >= 14) {
              localStorage.setItem(STORAGE_KEY + "lastBackupDate", now.format());
              resolve(true); // backup probably needed
            } else {
              resolve(false); // no backup needed
            }
          } else {
            localStorage.setItem(STORAGE_KEY + "lastBackupDate", now.format());
            resolve(true); // backup needed
          }
        });
      },
      liveChatAddCannedResponse(context, config) {
        // config.data.token = context.getters.liveChatApiToken;
        logger.debug(`Adding LiveChat Canned Response`, config);

        superagent
          .post(`${window.leopardConfig.liveChat.agentAssistServerUrl}/can`)
          .accept("json")
          .type("json")
          .send(config)
          .then(res => {
            // res.body = json, res.headers, res.status
            logger.debug("Agent Assist: Canned Response Created", res.body);
          })
          .catch(err => {
            // err.message, err.response
            logger.error(`Could not add LiveChat canned response`, err);
          });
      },
      async putLiveChatAgentMessage(_context, message) {
        // await LiveChat.refreshSessionId();
        await LiveChat.putMessage(stripHtml(message));
      },
      setupLiveChatAgentAssist(context) {
        logger.debug(">> Before Live Agent Assist Setup");
        if (context.getters.isLiveAgentAssist) {
          logger.debug(`Is this an Agent Assist App?`, context.getters.isLiveAgentAssist);
          logger.debug(">> In Live Agent Assist Setup");
          let liveChatAgentAssistLastMessage = null;
          LiveChat.init({ authorize: false })
            .then(async () => {
              logger.debug(">> Live Agent Assist Setup");
              context.commit("DISABLE_LIVE_CHAT");

              await LiveChat.refreshSessionId();
              logger.debug("LiveChat Agent Assist Setup!");
              LiveChat.on("customer_profile", profile => {
                logger.debug("customer_profile", profile);
              });

              LiveChat.on("message", message => {
                logger.debug("message received", message);
                if (
                  message.message_source === "visitor" &&
                  message.message_id !== liveChatAgentAssistLastMessage &&
                  !message.message.includes("VIRTUAL ASSISTANT CONVERSATION HISTORY")
                ) {
                  liveChatAgentAssistLastMessage = message.message_id;
                  context.commit("SET_USER_INPUT", message.message);
                  context.dispatch("sendUserInput").then(() => {});
                }

                // putLiveChatMessage("Wow this works a treat");
              });

              await LiveChat.watchMessages();
              accountsSdk.init({
                client_id: liveChatConfig.client_id,
                onIdentityFetched: (error, data) => {
                  if (error) {
                    logger.error(`Could not init LiveChat accountsSdk`, error);
                  } else {
                    if (data && data.access_token) {
                      context.commit("LIVE_CHAT_API_ACCESS_TOKEN", data.access_token);
                      logger.debug("LIVE_CHAT_API_ACCESS_TOKEN", data.access_token);
                    } else {
                      const redirectUrl = `${liveChatConfig.account_url}?response_type=token&client_id=${liveChatConfig.client_id}&redirect_uri=${window.location.href}`;
                      logger.debug("No LiveChat access token. Redirect page to... ", redirectUrl);
                      window.location.href = redirectUrl;
                    }
                  }
                }
              });
            })
            .catch(err => {
              logger.error(`Can't setup LiveChat`, err);
              liveChatAssistConnectCount += 1;
              if (liveChatAssistConnectCount < 5) {
                setTimeout(() => {
                  context.dispatch("setupLiveChatAgentAssist");
                }, 2000);
              }
            });
        }
      },
      openChatWindow(context, mustLogin = true) {
        context.commit("HIDE_CHAT_BUTTON"); // toggle the chat button visibility

        if (context.getters.isAsrTtsOnOpenEnabled) {
          context.commit("START_TTS");
        } else {
          context.commit("STOP_TTS");
        }
        let siteFrame;
        //animate the IFrame
        if (!this.embed && !this.overlayChat) {
          siteFrame = document.getElementById("site-frame");
        }
        let chatButton = document.getElementById("chat-open-close-button");
        // show chat window
        if (!context.getters.isChatOpen) {
          if (router.currentRoute.path !== "/") {
            router.push({ name: "chat" }); // make sure we show the main chat window
          }

          context.commit("SHOW_CHAT_LOADING"); // display the loading spinner
          let isChatUiFloating = context.getters.float;
          setTimeout(
            function () {
              // wait just a bit before animating things - need the chat button to hide first
              context.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // show the chat window
              logger.debug(`In move button left: ${isChatUiFloating}`);
              // wait just a bit before animating things - need the chat button to hide first
              if (chatButton) {
                if (isChatUiFloating) {
                  chatButton.setAttribute("class", "move-button-left-float"); // reposition the chat button
                } else {
                  chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
                }
              }

              if (!context.getters.embed && !context.getters.overlayChat && siteFrame) {
                setTimeout(function () {
                  siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
                }, 1000);
              }
            }.bind(this),
            400
          );
          logger.debug("Toggle Chat: Send Login");
          if (mustLogin) {
            context
              .dispatch("beginTeneoSession")
              .then(() => {
                logger.debug("Successfully logged into chat");
                context.commit("LOGGED_INTO_TENEO");
                setTimeout(
                  function () {
                    context.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
                    context.commit("HIDE_CHAT_LOADING");
                  }.bind(this),
                  1500
                ); // only show the chat button after a successful login
              })
              .catch(err => {
                logger.debug("ERROR LOGGING IN TO CHAT: ", err.teneoUrl);
              });
          } else {
            context.commit("HIDE_CHAT_LOADING");
          }
        }
      },
      sendFeedback(context, feedback) {
        let queryParams =
          setupConfig.REQUEST_PARAMETERS +
          window.leopardConfig.requestParams +
          context.getters.userInformationParams +
          context.getters.timeZoneParam +
          context.getters.ctxParameters;

        queryParams = replaceString(queryParams, "CURL_CONNECT_TIMEOUT", "");

        let queryObj = queryParamStringAsObject(queryParams);
        queryObj.command = "feedback";
        queryObj.text = ""; // it's a login we don't have to say anything yet
        queryObj.feedback = JSON.stringify(feedback);

        TIE.sendInput(
          context.getters.teneoUrl,
          context.getters.teneoSessionId,
          queryObj,
          window.leopardConfig.tieTimeoutSecs
        ).then(() => logger.debug("Feedback sent to Teneo"));
      },
      setUserInformation({ commit, getters }) {
        if (!window.leopardConfig.firebase.apiKey) {
          return;
        }
        if (getters.firebase) {
          logger.debug(`SET USER INFORMATION > Located Firebase`);
          getters.firebase.auth().onAuthStateChanged(function (user) {
            if (user && !getters.authenticated) {
              commit("USER_INFO", { user: user }); // user is still signed in
            }
          });
        } else {
          let retryCount = 0;
          let checkExist = setInterval(function () {
            retryCount++;

            if (getters.firebase) {
              logger.debug(`SET USER INFORMATION > Firebase > Found on retry: ${retryCount}`);
              getters.firebase.auth().onAuthStateChanged(function (user) {
                if (user && !getters.authenticated) {
                  commit("USER_INFO", { user: user }); // user is still signed in
                }
              });
              clearInterval(checkExist);
            }

            if (retryCount++ > 80) {
              logger.debug("SET USER INFORMATION > Firebase > Giving up trying waiting!!");
              clearInterval(checkExist);
            }
          }, 100); // check every 100ms
        }
      },
      logoutSocial({ commit, getters }) {
        if (!window.leopardConfig.firebase.apiKey) {
          return;
        }
        if (getters.firebase) {
          getters.firebase
            .auth()
            .signOut()
            .then(
              () => {
                commit("LOG_OUT_TENEO");
                commit("CLEAR_USER_INFO");
                logger.debug("Signed out of chat");
              },
              function (error) {
                // An error happened.
                logger.error(error);
              }
            );
        }
      },
      setupFirebase(context) {
        return new Promise((resolve, _reject) => {
          if (!window.leopardConfig.firebase.apiKey) {
            logger.debug("No configuration for Firebase - skipping");
            resolve();
            return;
          }
          if (!context.getters.firebase) {
            Firebase.init().then(firebase => {
              context.commit("SET_FIREBASE", firebase);
              logger.debug(`Firebase has been initiated`, firebase);
              resolve(firebase);
              return;
            });
          } else {
            resolve(context.getters.firebase);
            return;
          }
        });
      },
      loginSocial({ commit, getters }, socialProvider) {
        return new Promise((resolve, reject) => {
          if (!window.leopardConfig.firebase.apiKey) {
            resolve();
            return;
          }
          let provider = null;
          logger.debug(`Firebase Login `, socialProvider);
          switch (socialProvider) {
            case "google":
              provider = new getters.firebase.auth.GoogleAuthProvider();
              break;
            case "microsoft":
              const scopes = ["User.Read.All"];
              provider = new getters.firebase.auth.OAuthProvider("microsoft.com");
              provider.setCustomParameters({
                prompt: "select_account",
                tenant: window.leopardConfig.auth.microsoft.tenant,
                domain_hint: window.leopardConfig.auth.microsoft.domainHint
              });
              scopes.forEach(scope => {
                provider.addScope(scope);
              });

              break;
            case "facebook":
              provider = new getters.firebase.auth.FacebookAuthProvider();
              break;
            case "github":
              provider = new getters.firebase.auth.GithubAuthProvider();
              break;
            default:
              break;
          }

          // getters.firebase.auth().languageCode = "en";
          // To apply the default browser preference instead of explicitly setting it.
          getters.firebase.auth().useDeviceLanguage();

          getters.firebase
            .auth()
            .signInWithPopup(provider)
            .then(function (result) {
              logger.debug("Authentication Result:", result);
              // This gives you a Google Access Token. You can use it to access the Google API.
              // var token = result.credential.accessToken;
              // The signed-in user info.
              let user = result.user;
              logger.debug(user);
              if (socialProvider === "microsoft") {
                let userInfo = {
                  user: user,
                  providerId: "microsoft.com",
                  additional: {
                    credentials: result.credential,
                    email: result.additionalUserInfo.profile.mail,
                    phone: result.additionalUserInfo.profile.mobilePhone,
                    displayName: result.additionalUserInfo.profile.displayName,
                    surname: result.additionalUserInfo.profile.surname,
                    givenName: result.additionalUserInfo.profile.givenName,
                    name: result.additionalUserInfo.profile.givenName,
                    jobTitle: result.additionalUserInfo.profile.jobTitle,
                    userPrincipleName: result.additionalUserInfo.profile.userPrincipalName,
                    accessToken: result.credential.accessToken,
                    providerId: "microsoft.com"
                  }
                };
                logger.debug(`Microsoft User Info:`, userInfo);
                commit("USER_INFO", userInfo);
              } else {
                commit("USER_INFO", {
                  user: user
                });
              }

              resolve();
            })
            .catch(function (error) {
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
          if (!window.leopardConfig.firebase.apiKey) {
            resolve();
            return;
          }
          loginInfo.photoURL = getters.profileImageFromEmail(loginInfo.email);
          getters.firebase
            .auth()
            .signInWithEmailAndPassword(loginInfo.email, loginInfo.password)
            .then(user => {
              commit("USER_INFO", { user: user });
              resolve();
            })
            .catch(function (error) {
              reject(error.message);
            });
        });
      },
      registerUserWithUsernameEmailPassword({ commit, getters }, registrationInfo) {
        return new Promise((resolve, reject) => {
          if (!window.leopardConfig.firebase.apiKey) {
            resolve();
            return;
          }
          registrationInfo.photoURL = getters.profileImageFromEmail(registrationInfo.email);
          getters.firebase
            .auth()
            .createUserWithEmailAndPassword(registrationInfo.email, registrationInfo.password)
            .then(user => {
              let currentUser = getters.firebase.auth().currentUser;
              logger.debug(registrationInfo.displayName);
              logger.debug(registrationInfo.photoURL);
              currentUser
                .updateProfile({
                  displayName: registrationInfo.displayName,
                  photoURL: registrationInfo.photoURL
                })
                .then(function () {
                  logger.debug("User's profile info updated");
                })
                .catch(function (error) {
                  logger.error(`Unable to update user's profile information:`, error);
                });
              commit("USER_INFO", { user: user });
              resolve();
            })
            .catch(function (error) {
              logger.error(error);
              reject(error.message);
            });
        });
      },
      stopAudioCapture(context) {
        if (context.getters.tts && context.getters.tts.isSpeaking()) {
          logger.debug("muted TTS!");
          context.getters.tts.shutUp();
        }
        if (context.getters.tts && context.getters.tts.isObeying()) {
          context.getters.asr.stop();
          context.commit("STOP_AUDIO_CAPTURE");
        }
      },
      endTeneoSessionLite(context) {
        context.commit("REMOVE_MODAL_ITEM");
        TIE.close(
          context.getters.teneoUrl,
          context.getters.teneoSessionId,
          window.leopardConfig.tieTimeoutSecs
        )
          .then(() => {
            context.commit("CLEAR_TENEO_SESSION_ID");
            logger.debug("Session Ended");
          })
          .catch(err => {
            logger.debug("End session lite error:", err);
          });
      },
      endTeneoSession(context) {
        context.commit("CLEAR_DIALOGS");
        context.commit("REMOVE_MODAL_ITEM");
        TIE.close(
          context.getters.teneoUrl,
          context.getters.teneoSessionId,
          window.leopardConfig.tieTimeoutSecs
        )
          .then(() => {
            context.commit("CLEAR_TENEO_SESSION_ID");
            context.commit("HIDE_CHAT_LOADING");
            context.commit("HIDE_UPLOAD_BUTTON");
            logger.debug("Session Ended");
          })
          .catch(err => {
            logger.debug("End session error:", err);
          });
      },
      beginTeneoSession(context) {
        let that = this;
        context.commit("SHOW_CHAT_LOADING");
        // get the greeting message if we haven't done so for this session
        return new Promise((resolve, reject) => {
          let queryObj = buildQueryParamsObjectNewTeneoSession(context); // it's a login we don't have to say anything yet

          TIE.sendInput(
            context.getters.teneoUrl,
            context.getters.teneoSessionId,
            queryObj,
            window.leopardConfig.tieTimeoutSecs
          )
            .then(json => {
              handleLoginResponse(context, json, vuetify, resolve);
            })
            .catch(err => {
              handleTieErrorResponse(context, err, reject);
            });
        });
      },
      async sendUserInput(context, params = "") {
        // important because sometimes some weird object gets injected from chrome browser extensions
        if (typeof params !== "string") {
          params = "";
        }
        let now = new Date();
        let currentUserInput = "";
        currentUserInput = handlePromptBefore(params, now, currentUserInput, context);
        if (currentUserInput) playAudioConfirmation(context);

        if (!context.getters.isLiveChat) {
          // normal user input - discussion with the VA
          await handleTeneoResponse(currentUserInput, context, params, vuetify);
        } else if (context.getters.isLiveChat && params.indexOf("command=prompt") === -1) {
          // live chat discussion
          handleLiveChatResponse(currentUserInput, context);
        }
      },
      captureAudio(context) {
        if (context.getters.isAsrEnabled) context.commit("START_AUDIO_CAPTURE");
      }
    }
  });

  // setup i18n for Leopard UI
  setupI18n();

  // Setup ASR
  setupAsr();

  // setup Live Chat
  setupLiveChat();

  // setup Embed Messaging
  setupEmbedMessaging();

  // ok vuetify and store are setup
  return { vuetify, store };
}

function buildQueryParamsObjectNewTeneoSession(context) {
  let queryParams =
    setupConfig.REQUEST_PARAMETERS +
    window.leopardConfig.requestParams +
    context.getters.userInformationParams +
    context.getters.timeZoneParam +
    context.getters.ctxParameters +
    context.getters.locationInfo;
  queryParams = replaceString(queryParams, "CURL_CONNECT_TIMEOUT", "");
  let queryObj = queryParamStringAsObject(queryParams);
  queryObj.command = "login";
  queryObj.text = ""; // it's a login we don't have to say anything yet
  return queryObj;
}

function setupEmbedMessaging() {
  postMessage = new PostMessage(store, setupConfig);
}

function setupLiveChat() {
  try {
    if (window.leopardConfig.liveChat.licenseKey) {
      logger.debug(`About to try and setup Live Chat`);
      setupConfig.setupLiveChat(store);
    }
  } catch (e) {
    logger.info(`Error setting up LiveChat`, e);
  }
}

function setupAsr() {
  try {
    initializeASR(store, setupConfig.ASR_CORRECTIONS_MERGED);
  } catch (err) {
    logger.error(`Error setting up ASR and TTS`, err);
  }
}

function setupI18n() {
  Vue.use(vuexI18n.plugin, store);
  Object.keys(TRANSLATIONS).forEach(function (key) {
    Vue.i18n.add(key, TRANSLATIONS[key]);
  });
  Vue.i18n.set(setupConfig.LOCALE);
}

function handleTieErrorResponse(context, err, reject) {
  context.commit("HIDE_CHAT_LOADING");
  const errResp = {
    error: err,
    teneoUrl: setupConfig.TENEO_URL,
    message: "Could not send login command to TIE"
  };
  logger.debug(`Problems sending login command`, errResp);
  context.commit(
    "SHOW_MESSAGE_IN_CHAT",
    "Problems sending login to TIE: Is your solution published and online? Is your TIE url correct?"
  );
  reject(errResp);
}

async function handleTeneoResponse(currentUserInput, context, params, vuetify) {
  logger.debug("Question 💬", currentUserInput.trim());
  await sleep(context.getters.responseDelay); // delay responses if needed
  let queryObj = buildQueryParamsObjectUserInput(params, context, currentUserInput);
  TIE.sendInput(
    context.getters.teneoUrl,
    context.getters.teneoSessionId,
    queryObj,
    window.leopardConfig.tieTimeoutSecs
  )
    .then(json => {
      // live chat assist - train
      if (params.indexOf("command=train") !== -1) {
        return;
      }

      let tResp = handleTeneoResponseEarly(context, json);
      handleToastResponse(tResp, context);
      handleCustomCSSResponse(tResp, context);
      handleMinimizeResponse(tResp, context);
      handleThemeResponse(tResp, vuetify);

      let mustStop = handlePromptPollingResponse(tResp, context, params);
      if (mustStop) {
        return;
      }
      context.commit("HIDE_CHAT_LOADING");
      handleDarkLightThemeResponse(tResp, vuetify);
      handleFeedbackFormResponse(tResp, context);

      // if (
      //   params.indexOf("langSwitch") === -1 &&
      //   (json.responseData.isNewSession || json.responseData.extraData.newsession)
      // ) {
      //   logger.debug("Session is stale.. keep chat open and continue with the new session");
      //   const awayMessage = "This is a new chat bot session.";
      //   context.commit("SHOW_SIMPLE_MESSAGE_IN_CHAT", {
      //     message: awayMessage,
      //     icon: "mdi-timer"
      //   });
      //   context.commit("SET_ACCESSIBLE_ANNOUNCEMENT", awayMessage);
      // }

      handleScriptResponse(tResp, context);
      handleDelayResponse(tResp, context, params);
      handleUploadResponse(tResp, context);
      handleLocationResponse(tResp, context);

      logger.debug(`Response 💬: `, cleanEmptyChunks(tResp.getOutputText()));
      const response = {
        userInput: currentUserInput,
        id: uuid(),
        teneoAnswer: md.render(
          cleanEmptyChunks(tResp.getOutputText()).replace(/onclick="[^"]+"/g, 'class="sendInput"')
        ),
        teneoResponse: json
      };
      if (response.teneoResponse) {
        let ttsText = stripHtml(addTtsPauses(cleanEmptyChunks(tResp.getOutputText())));
        if (tResp.hasParameter("tts") && tResp.getParameter("tts").indexOf("<speak>") !== -1) {
          ttsText = tResp.getParameter("tts");
        } else if (tResp.hasParameter("tts")) {
          ttsText = stripHtml(tResp.getParameter("tts"));
        }
        context.commit("SET_ACCESSIBLE_ANNOUNCEMENT", "Chat Bot Said. " + ttsText + ".");
        // check if this browser supports the Web Speech API
        if (
          Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
          Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
        ) {
          if (
            context.getters.isTtsEnabled &&
            context.getters.tts &&
            (!context.getters.isAsrEnabled || context.getters.speakBackResponses)
          ) {
            // console.log(`About to say: ${ttsText}`);
            ttsText = ttsText.replace(
              /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFE])|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u2764\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])?|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g,
              ""
            );
            context.getters.isPollyEnabled
              ? polly.say(
                  ttsText,
                  context.getters.getPollyVoice,
                  params.indexOf("langSwitch") === -1 ? false : true
                )
              : context.getters.tts.say(ttsText);
          }
        }

        let finalLeopardPayload = {
          response,
          mask: false
        };

        if (context.getters.askingForPassword) {
          finalLeopardPayload.mask = true;
        }

        context.commit("UPDATE_CHAT_WINDOW_AND_STORAGE", finalLeopardPayload);
        context.commit("HIDE_PROGRESS_BAR");
        handleSignalToStartLiveChatResponse(tResp, context);
        handleChangeChatTitleResponse(tResp, context);
        handleTieUrlSwitchResponse(tResp, context);
      }
    })
    .catch(err => {
      const errResp = {
        error: err,
        teneoUrl: setupConfig.TENEO_URL
      };
      if (err.status && err.status === 408) {
        logger.error("Request To Teneo Timed Out: 408", errResp);
        context.commit(
          "SHOW_MESSAGE_IN_CHAT",
          "I'm sorry but the request timed out - Please try again."
        );
      } else if (err.status && err.status === 400) {
        logger.error("Request To Teneo Timed Out: 400", errResp);
        context.commit(
          "SHOW_MESSAGE_IN_CHAT",
          "I'm sorry, I wasn't able to communicate with the virtual assistant. Please check your internet connection."
        );
      } else {
        logger.error("Could not communicate with Teneo", errResp);
        context.commit("SHOW_MESSAGE_IN_CHAT", err.message);
      }
      context.commit("HIDE_PROGRESS_BAR");
    });
}

function handleChangeChatTitleResponse(tResp, context) {
  if (tResp.hasParameter("chatTitle")) {
    let chatTitle = tResp.getParameter("chatTitle");
    if (chatTitle !== "undefined") {
      context.commit("SET_CHAT_TITLE", chatTitle);
    }
  }
}

function handleSignalToStartLiveChatResponse(tResp, context) {
  if (tResp.hasParameter("liveChat")) {
    context.commit("START_LIVE_CHAT");
  }
}

function handleTieUrlSwitchResponse(tResp, context) {
  if (tResp.hasParameter("langengineurl") && tResp.hasParameter("langinput")) {
    context.dispatch("endTeneoSessionLite");
    context.commit("UPDATE_TENEO_URL", tResp.getParameter("langengineurl"));
    context.commit("SET_USER_INPUT", tResp.getParameter("langinput"));
    context.commit("SHOW_PROGRESS_BAR");
    if (tResp.hasParameter("lang")) {
      context.commit("UPDATE_UI_LOCALE", tResp.getParameter("lang"));
      context.commit("CHANGE_ASR_TTS", tResp.getParameter("lang"));
    }
    if (tResp.hasParameter("voice")) {
      context.commit("CHANGE_POLLY_VOICE", tResp.getParameter("voice"));
    }

    if (tResp.hasParameter("langurl")) {
      context.commit("UPDATE_FRAME_URL", tResp.getParameter("langurl"));
    }
    context
      .dispatch("sendUserInput", "&langSwitch=true")
      .then(logger.debug("Sent original lang input to new lang specific solution"))
      .catch(err => {
        logger.error("Unable to send lang input to new lang specific solution", err);
        context.commit(
          "SHOW_MESSAGE_IN_CHAT",
          "Unable to send lang input to new lang specific solution: " + err.message
        );
      });
  }
}

function handlePromptPollingResponse(tResp, context, params) {
  let mustStop = false;
  if (tResp.hasParameter("numActiveFlows")) {
    // deal with polling
    let numActiveFlows = parseInt(tResp.getParameter("numActiveFlows"));
    if (numActiveFlows > 0) {
      // mid dialog stop polling
      context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
      logger.debug("Stop polling - there active dialogs");
    } else if (context.getters.isPromptPollingActive) {
      // setup the polling again if needed
      if (
        !context.getters.showButtonOnly &&
        context.getters.isChatOpen &&
        context.getters.getActivePromptInterval === null
      ) {
        logger.debug("Start up Prompt Trigger Polling");
        let interval = setInterval(function () {
          context.dispatch("sendUserInput", "&command=prompt");
        }, context.getters.getPromptPollingIntervalInMilliseconds);
        context.commit("SET_PROMPT_TRIGGER_INTERVAL", interval);
      } else if (!context.getters.isChatOpen) {
        logger.debug(`Stop prompt trigger polling - chat is closed`);
        context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
      }
    }
  } else if (!tResp.hasParameter("numActiveFlows") && context.getters.isPromptPollingActive) {
    console.groupCollapsed(
      `%c Config Error!! ⚠ %c Leopard Chat UI 💬 %c`,
      "background:#C60909 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
      "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
      "background:transparent"
    );
    logger.debug(
      "Prompt polling is active but you are not returning the numActiveFlows from Teneo"
    );
    logger.debug(
      "Documentation: https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling"
    );
    console.groupEnd();
  }
  if (params.indexOf("command=prompt") !== -1 && cleanEmptyChunks(tResp.getOutputText()) === "") {
    logger.debug(`Poll returned nothing..`);
    mustStop = true;
  } else if (
    params !== "" &&
    params.indexOf("command=prompt") !== -1 &&
    cleanEmptyChunks(tResp.getOutputText()) !== ""
  ) {
    playAudioConfirmation(context);
  }
  return mustStop;
}

function buildQueryParamsObjectUserInput(params, context, currentUserInput) {
  let queryParams =
    (setupConfig.SEND_CTX_PARAMS === "all" ? setupConfig.REQUEST_PARAMETERS + params : params) +
    context.getters.userInformationParams +
    window.leopardConfig.requestParams +
    context.getters.timeZoneParam +
    context.getters.ctxParameters;
  queryParams = replaceString(queryParams, "CURL_CONNECT_TIMEOUT", "");
  let queryObj = queryParamStringAsObject(queryParams);
  queryObj.text = currentUserInput.trim();
  return queryObj;
}

function handleDarkLightThemeResponse(tResp, vuetify) {
  if (tResp.hasParameter("theme") && tResp.getParameter("theme") === "dark") {
    vuetify.framework.theme.dark = true;
  } else if (tResp.hasParameter("theme") && tResp.getParameter("theme") === "light") {
    vuetify.framework.theme.dark = false;
  }
}

function handleFeedbackFormResponse(tResp, context) {
  if (tResp.hasParameter("offerFeedbackForm")) {
    const feedbackConfig = tResp.getParameter("offerFeedbackForm");
    context.commit("ADD_FEEDBACK_FORM", feedbackConfig);
  } else {
    context.commit("CLEAR_FEEDBACK_FORM");
  }
}

function handleTeneoResponseEarly(context, json) {
  context.commit("SET_TENEO_SESSION_ID", json.sessionId);
  logger.info("PARSED Teneo Resp: ", json);
  let tResp = TIE.wrap(json);
  return tResp;
}

function handleToastResponse(tResp, context) {
  if (tResp.hasParameter("toast")) {
    context.commit("SET_SNOTIFY", tResp.getParameter("toast"));
  }
}

function handleCustomCSSResponse(tResp, context) {
  if (tResp.hasParameter("css")) {
    context.commit("SET_CUSTOM_CSS", tResp.getParameter("css"));
  }
}

function handleMinimizeResponse(tResp, context) {
  if (tResp.hasParameter("minimize")) {
    context.commit("MINIMIZE_DELAY", tResp.getParameter("minimize"));
  } else if (context.getters.minimize) {
    context.commit("MINIMIZE_DELAY_REMOVE");
  }
}

function handleThemeResponse(tResp, vuetify) {
  if (tResp.hasParameter("theme")) {
    Object.assign(vuetify.framework.theme.themes.light, tResp.getParameter("theme"));
  }
}

function handleScriptResponse(tResp, context) {
  if (tResp.hasParameter("script") && window.leopardConfig.embed.enableScriptEval) {
    let theScript = decodeURIComponent(tResp.getParameter("script"));
    if (context.getters.embed) {
      postMessage.sendMessageToParent("runLeopardScript|" + theScript);
    }
  }
}

function handleUploadResponse(tResp, context) {
  if (tResp.hasParameter("inputType") && tResp.getParameter("inputType") === "upload") {
    context.commit("SHOW_UPLOAD_BUTTON");
  }
}

function handleDelayResponse(tResp, context, params) {
  if (tResp.hasParameter("command") && tResp.getParameter("command") === "delay") {
    context.commit("SHOW_RESPONSE_DELAY");
    context.commit("SET_USER_INPUT", "");
    context
      .dispatch("sendUserInput", "&command=continue")
      .then(logger.debug(`Continue with long operation`))
      .catch(err => {
        logger.error("Unable to continue conversation", err);
        context.commit("SHOW_MESSAGE_IN_CHAT", "We're sorry for the inconvenience: " + err.message);
      });
  }
  if (params.indexOf("command=continue") !== -1) {
    context.commit("HIDE_RESPONSE_DELAY");
  }
}

function handleLocationResponse(tResp, context) {
  if (tResp.hasParameter("inputType") && tResp.getParameter("inputType").startsWith("location")) {
    setupConfig
      .getLocator()
      .then(function (position) {
        // we now have the user's lat and long
        logger.debug(`${position.coords.latitude}, ${position.coords.longitude}`);
        if (tResp.getParameter("inputType") === "locationLatLong") {
          // send the lat and long
          context
            .dispatch(
              "sendUserInput",
              "&locationLatLong=" +
                encodeURI(position.coords.latitude + "," + position.coords.longitude)
            )
            .then(
              logger.debug(
                `Sent user's lat and long: ${position.coords.latitude}, ${position.coords.longitude}`
              )
            )
            .catch(err => {
              logger.error("Unable to send lat and long info", err);
              context.commit(
                "SHOW_MESSAGE_IN_CHAT",
                "We were unable to obtain your location information.: " + err.message
              );
            });
        } else if (window.leopardConfig.locationIqKey) {
          // good we have a licence key we can send all location information back
          let locationRequestType = tResp.getParameter("inputType");
          superagent
            .get(
              `https://us1.locationiq.com/v1/reverse.php?key=${
                window.leopardConfig.locationIqKey
              }&lat=${position.coords.latitude}&lon=${
                position.coords.longitude
              }&format=json&normalizecity=1&t=${new Date().valueOf()}`
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
                  logger.debug(
                    `Sent user's location information: ${data.address.city}, ${data.address.state} ${data.address.postcode}`
                  )
                )
                .catch(err => {
                  logger.error("Unable to send user location", err);
                  context.commit(
                    "SHOW_MESSAGE_IN_CHAT",
                    "We were unable to obtain your location information.: " + err.message
                  );
                });
            })
            .catch(err => logger.error(err));
        } else if (
          !window.leopardConfig.locationIqKey &&
          tResp.getParameter("inputType") ===
            ("locationCityStateZip" || "locationZip" || "locationJson")
        ) {
          // no good. Asking for location information that requires a licence  key
          context.commit(
            "SHOW_MESSAGE_IN_CHAT",
            "A licence key for https://locationiq.com/ is needed to obtain the requested location information. Check the documentation."
          );
        }
      })
      .catch(function (err) {
        logger.error("Position Error ", err);
      });
  }
}

function handleLiveChatResponse(currentUserInput, context) {
  // send the input to live chat agent and save user input to history
  let newUserInput = {
    type: "userInput",
    text: currentUserInput,
    bodyText: "",
    hasExtraData: false
  };
  context.commit("PUSH_USER_INPUT_TO_DIALOG", newUserInput);
  if (!setupConfig.USE_SESSION_STORAGE) {
    localStorage.setItem(
      STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY,
      JSON.stringify(context.getters.dialog)
    );
  }
  context.commit(
    "SET_DIALOG_HISTORY",
    JSON.parse(sessionStorage.getItem(STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY))
  );
  if (context.getters.dialogHistory === null) {
    context.commit("SET_DIALOG_HISTORY", context.getters.dialog);
  } else {
    context.commit("PUSH_USER_INPUT_TO_DIALOG_HISTORY", newUserInput);
  }
  sessionStorage.setItem(
    STORAGE_KEY + setupConfig.TENEO_CHAT_HISTORY,
    JSON.stringify(context.getters.dialogHistory)
  );
  setupConfig.liveChat.sendMessage(currentUserInput.trim());
  context.commit("HIDE_PROGRESS_BAR");
  context.commit("CLEAR_USER_INPUT");
}

function playAudioConfirmation(context) {
  if (context.getters.playResponseBeep) {
    try {
      var audio = new Audio(require("@/assets/notification.mp3"));
      audio.play();
    } catch {}
  }
}

function handlePromptBefore(params, now, currentUserInput, context) {
  if (params.indexOf("command=prompt") === -1) {
    logger.debug("Updating last interaction time in localstorage");
    localStorage.setItem(STORAGE_KEY + setupConfig.TENEO_LAST_INTERACTION_DATE, now.getTime());
    currentUserInput = stripHtml(context.getters.userInput);
    context.commit("CLEAR_USER_INPUT");
    // send user input to Teneo when a live chat has not begun
    if (context.getters.tts && context.getters.tts.isSpeaking()) {
      // tts is speaking something. Let's shut it up
      context.getters.tts.shutUp();
    }
    context.commit("HIDE_CUSTOM_MODAL");
    context.commit("HIDE_CHAT_MODAL");
    context.commit("REMOVE_MODAL_ITEM");
  }
  return currentUserInput;
}

function handleLoginResponse(context, json, vuetify, resolve) {
  context.commit("SET_TENEO_SESSION_ID", json.sessionId);
  logger.info("PARSED Teneo Resp: ", json);
  const tResp = TIE.wrap(json);
  context.commit("HIDE_CHAT_LOADING");

  handleMinimizeResponse(tResp, context);
  if (tResp.hasParameter("theme")) {
    Object.assign(vuetify.framework.theme.themes.light, tResp.getParameter("theme"));
  }
  if (tResp.hasParameter("toast")) {
    context.commit("SET_SNOTIFY", tResp.getParameter("toast"));
  }
  if (tResp.hasParameter("emergency")) {
    context.commit("SET_EMERGENCY_CONFIG", tResp.getParameter("emergency"));
  }
  if (tResp.hasParameter("numActiveFlows")) {
    let numActiveFlows = parseInt(tResp.getParameter("numActiveFlows"));
    if (numActiveFlows > 0) {
      // mid dialog stop polling
      context.commit("CLEAR_PROMPT_TRIGGER_INTERVAL");
      logger.debug("Stop polling - there active dialogs");
    } else if (context.getters.isPromptPollingActive) {
      // setup the polling again if needed
      if (!context.getters.showButtonOnly && context.getters.getActivePromptInterval === null) {
        logger.debug("Start up Prompt Trigger Polling");
        let interval = setInterval(function () {
          context.dispatch("sendUserInput", "&command=prompt");
        }, context.getters.getPromptPollingIntervalInMilliseconds);
        context.commit("SET_PROMPT_TRIGGER_INTERVAL", interval);
      }
    }
  } else if (!tResp.hasParameter("numActiveFlows") && context.getters.isPromptPollingActive) {
    console.groupCollapsed(
      `%c Config Error!! ⚠ %c Leopard Chat UI 💬 %c`,
      "background:#C60909 ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
      "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
      "background:transparent"
    );
    logger.error(
      "Prompt polling is active but you are not returning the numActiveFlows from Teneo"
    );
    logger.error(
      "Documentation: https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling"
    );
    console.groupEnd();
  }
  context.commit("HIDE_CHAT_LOADING"); // about to show the greeting - hide the chat loading spinner
  logger.debug(`Login Message from Teneo: ${cleanEmptyChunks(tResp.getOutputText())}`);

  let ttsText = stripHtml(addTtsPauses(cleanEmptyChunks(tResp.getOutputText())));
  if (tResp.hasParameter("tts") && tResp.getParameter("tts").indexOf("<speak>") !== -1) {
    ttsText = tResp.getParameter("tts");
  } else if (tResp.hasParameter("tts")) {
    ttsText = stripHtml(tResp.getParameter("tts"));
  }
  // check if this browser supports the Web Speech API
  if (
    context.getters.isTtsEnabled &&
    context.getters.tts &&
    (!context.getters.isAsrEnabled ||
      (context.getters.isAsrEnabled && context.getters.speakBackResponses)) &&
    Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
    Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
  ) {
    // console.log(`About to say: ${ttsText}`);
    ttsText = ttsText.replace(
      /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFE])|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69])(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83E\uDDD1(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u2764\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])?|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g,
      ""
    );
    context.getters.isPollyEnabled
      ? polly.say(ttsText, context.getters.getPollyVoice, false)
      : context.getters.tts.say(ttsText);
  }

  let hasExtraData = false;
  if (
    Object.keys(json.output.parameters).some(function (k) {
      return ~k.indexOf("extensions");
    }) ||
    tResp.hasParameter("liveChat")
  ) {
    hasExtraData = true;
  }
  const response = {
    type: "reply",
    id: uuid(),
    text: md.render(
      cleanEmptyChunks(tResp.getOutputText()).replace(/onclick="[^"]+"/g, 'class="sendInput"')
    ),
    bodyText: "",
    teneoResponse: json,
    hasExtraData: hasExtraData
  };
  // sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(response))
  context.commit("PUSH_RESPONSE_TO_DIALOG", response); // push the getting message onto the dialog
  context.commit("SET_ACCESSIBLE_ANNOUNCEMENT", response.text);
  if (hasExtraData) {
    context.commit("SHOW_CHAT_MODAL", response);
  }
  context.commit("LOGGED_INTO_TENEO");
  resolve();
}
