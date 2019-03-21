import * as LivechatVisitorSDK from "@livechat/livechat-visitor-sdk"; // live chat
import Artyom from "artyom.js"; // for speech recognition and tts
import toHex from "colornames"; // can convert html color names to hex equivalent
import parseBool from "parseboolean";
import replaceString from "replace-string";
import request from "simple-json-request";
import stripHtml from "string-strip-html";
import URL from "url-parse";
import Vue from "vue";
import VueJsonp from "vue-jsonp";
import Vuex from "vuex";
import vuexI18n from "vuex-i18n"; // i18n the leopard interface
import { ASR_CORRECTIONS } from "./constants/asr-corrections"; // fix ASR issues before they get to Teneo
import { STORAGE_KEY } from "./constants/solution-config-default"; // application storage key
import { TRANSLATIONS } from "./constants/translations"; // add UI translations for different language here

// import request from "request";

// Vue.use(VueLocalStorage);
Vue.use(VueJsonp, 20000);
Vue.use(Vuex);

const TENEO_CHAT_HISTORY = "teneo-chat-history";
const TENEO_CHAT_DARK_THEME = "darkTheme";
let store;

// const USE_LOCAL_STORAGE = parseBool(activeSolution.useLocalStorage);
let artyom = null;
let CHAT_TITLE = "Configure Me";
let EMBED = false; // will eventually be used to build standard Web Component
let ENABLE_LIVE_CHAT = false;
let FLOAT = false;
let IFRAME_URL = "";
let KNOWLEDGE_DATA = [];
let LOCALE = "en";
let REQUEST_PARAMETERS = "";
let RESPONSE_ICON = "";
let SEND_CTX_PARAMS = "login";
let TENEO_URL = "";
let timeoutVar;
let USE_LOCAL_STORAGE = false;
let USE_PUSHER = false;
let USER_ICON = "";

let THEME = {
  primary: "#D60270",
  secondary: "#5B017B",
  accent: "#4CAF50",
  error: "#FF5252",
  info: "#2196F3",
  success: "#4CAF50",
  warning: "#FFC107"
}; // default theme

let chatConfig = JSON.parse(localStorage.getItem(STORAGE_KEY + "config"));
let activeSolution = null;

if (USE_PUSHER) {
  Vue.use(require("vue-pusher"), {
    api_key: process.env.VUE_APP_PUSHER_KEY,
    options: {
      cluster: "us2",
      encrypted: true,
      forceTLS: true
    }
  });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function storeInit(callback) {
  if (!chatConfig || (chatConfig && chatConfig.solutions.length === 0)) {
    console.log("No config: Looking for default.json");
    loadDefaultConfig(function() {
      setupStore(callback);
    });
  } else {
    setupStore(callback);
  }
}

async function loadDefaultConfig(callback) {
  // look for default config on the server
  const defaultConfigUrl = `${location.protocol}//${location.host}${location.pathname}/../static/default.json`;

  request
    .request({
      method: "GET",
      url: defaultConfigUrl
    })
    .then(data => {
      console.log("Found and loaded default config");
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(data));
      chatConfig = data;
      callback();
    })
    .catch(error => {
      console.log(error);
      callback();
    });
}

function setupStore(callback) {
  if (chatConfig && chatConfig.activeSolution) {
    let deepLink = getParameterByName("dl"); // look for deep link
    if (!deepLink) {
      activeSolution = chatConfig.activeSolution;
      const matchingSolutions = chatConfig.solutions.filter(solution => solution.name === activeSolution);
      activeSolution = matchingSolutions[0];
    } else {
      // allow for deep linking to a specific solution ?dl=<deepLink>
      const matchingSolutions = chatConfig.solutions.filter(solution => solution.deepLink === deepLink);
      if (matchingSolutions.length > 0) {
        activeSolution = matchingSolutions[0];
      } else {
        // fall back to default
        activeSolution = chatConfig.activeSolution;
        const matchingSolutions = chatConfig.solutions.filter(solution => solution.name === activeSolution);
        activeSolution = matchingSolutions[0];
      }
    }

    CHAT_TITLE = activeSolution.chatTitle;
    IFRAME_URL = activeSolution.iframeUrl;
    KNOWLEDGE_DATA = activeSolution.knowledgeData;
    LOCALE = activeSolution.locale;
    FLOAT = activeSolution.float ? activeSolution.float == "true" : false;
    RESPONSE_ICON = activeSolution.responseIcon;
    SEND_CTX_PARAMS = activeSolution.sendContextParams ? activeSolution.sendContextParams : "login";
    TENEO_URL = activeSolution.url + "?viewname=STANDARDJSONP";
    USER_ICON = activeSolution.userIcon;

    // const USE_LOCAL_STORAGE = parseBool(activeSolution.useLocalStorage);
    USE_LOCAL_STORAGE = false;
    let theme = activeSolution.theme;
    for (const key in theme) {
      if (theme[key].charAt(0) !== "#") theme[key] = toHex(theme[key]);
    }
    THEME = theme;
    ENABLE_LIVE_CHAT = parseBool(activeSolution.enableLiveChat);

    document.title = activeSolution.name;

    // find active CTX parameters and build the parameters part of the URL
    activeSolution.contextParams.forEach(function(contextParam) {
      if (contextParam) {
        contextParam.values.forEach(function(value) {
          if (value.active) {
            REQUEST_PARAMETERS = REQUEST_PARAMETERS + "&" + contextParam.name + "=" + encodeURIComponent(value.text);
          }
        });
      }
    });
  }

  // update the IFRAME URL
  if (document.getElementById("site-frame")) {
    document.getElementById("site-frame").src = IFRAME_URL;
  } else {
    EMBED = true;
  }

  if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
    artyom = new Artyom();
    artyom.ArtyomVoicesIdentifiers["en-GB"] = ["Google UK English Female", "Google UK English Male", "en-GB", "en_GB"];
    // artyom.ArtyomVoicesIdentifiers["en-ZA"] = ["Google US English", "en-US", "en_US"];
    artyom.initialize({
      soundex: true,
      continuous: false,
      listen: false, // Start recognizing
      lang:
        LOCALE === "fr"
          ? "fr-FR"
          : LOCALE === "de"
          ? "de-DE"
          : LOCALE === "nl"
          ? "nl-NL"
          : LOCALE === "es"
          ? "es-ES"
          : "en-GB",
      debug: false
    });
  }

  store = new Vuex.Store({
    state: {
      agentAvatar: null,
      agentID: null,
      agentName: null,
      chatConfig: chatConfig,
      chatTitle: CHAT_TITLE,
      dark: false,
      dialog: [],
      dialogHistory: [],
      embed: EMBED,
      enableLiveChat: ENABLE_LIVE_CHAT,
      iframeUrl: IFRAME_URL,
      iframeUrlBase: IFRAME_URL ? IFRAME_URL.substring(0, IFRAME_URL.lastIndexOf("/")) + "/" : IFRAME_URL,
      isLiveChat: false,
      isWebSite: true,
      knowledgeData: KNOWLEDGE_DATA,
      listening: false,
      liveChatMessage: null,
      modalItem: null,
      overlayChat: FLOAT,
      progressBar: false,
      requestParameters: REQUEST_PARAMETERS,
      responseIcon: RESPONSE_ICON,
      showChatLoading: false,
      showConfigModal: true,
      showCustomModal: false,
      showLiveChatProcessing: false,
      showModal: false,
      speakBackResponses: false,
      stopAudioCapture: false,
      teneoUrl: TENEO_URL,
      theme: THEME,
      userIcon: USER_ICON,
      userInput: "",
      userInputReadyForSending: false
    },
    getters: {
      agentAvatar(state) {
        return state.agentAvatar;
      },
      agentId(state) {
        return state.agentID;
      },
      agentName(state) {
        return state.agentName;
      },
      enableLiveChat(state) {
        return state.enableLiveChat;
      },
      chatConfig(state) {
        return state.chatConfig;
      },
      iFrameUrlBase(state) {
        return state.iframeUrlBase;
      },
      isLiveChat(state) {
        return state.isLiveChat;
      },
      knowledgeData(state) {
        return state.knowledgeData;
      },
      showCustomModal(state) {
        return state.showCustomModal;
      },
      speakBackResponses(state) {
        return state.speakBackResponses;
      },
      liveChatMessage(state) {
        return state.liveChatMessage;
      },
      showChatLoading(state) {
        return state.showChatLoading;
      },
      teneoUrl(state) {
        return state.teneoUrl;
      },
      showLiveChatProcessing(state) {
        return state.showLiveChatProcessing;
      },
      chatHistory(state) {
        if (USE_LOCAL_STORAGE) {
          if (state.dialog.length !== 0) {
            let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY, "[]"));
            if (chatHistory.length !== 0) {
              state.dialog.concat(chatHistory);
            }
          } else {
            state.dialog = JSON.parse(localStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY, "[]"));
          }
        }
        return state.dialog;
      },
      chatHistorySessionStorage(state) {
        // TODO: Try and make the chat history in session storage unique to the deeplink
        if (state.dialogHistory.length === 0) {
          state.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY));
          if (state.dialogHistory === null) {
            state.dialogHistory = [];
          }
        }
        return state.dialogHistory;
      },
      userInput(state) {
        return state.userInput;
      },
      embed(state) {
        return state.embed;
      },
      overlayChat(state) {
        return state.overlayChat;
      },
      float(state) {
        return state.overlayChat;
      },
      dialog(state) {
        return state.dialog;
      },
      dialogHistory(state) {
        return state.dialogHistory;
      },
      progressBar(state) {
        return state.progressBar;
      },
      stopAudioCapture(state) {
        return state.stopAudioCapture;
      },
      showModal(state) {
        // console.log("request for show modal");
        return state.showModal;
      },
      showConfigModal(state) {
        return state.showConfigModal;
      },
      modalItem(state) {
        return state.modalItem;
      },
      dark(state) {
        return state.dark;
      },
      chatTitle(state) {
        return state.chatTitle;
      }
    },
    mutations: {
      HIDE_CUSTOM_MODAL(state) {
        state.showCustomModal = false;
      },
      SHOW_CUSTOM_MODAL(state) {
        state.showCustomModal = true;
      },
      PUSH_RESPONSE_TO_DIALOG(state, response) {
        state.dialog.push(response);
      },
      PUSH_RESPONSE_TO_DIALOG_HISTORY(state, response) {
        state.dialogHistory.push(response);
      },
      PUSH_USER_INPUT_TO_DIALOG_HISTORY(state, userInput) {
        state.dialogHistory.push(userInput);
      },
      SET_DIALOG_HISTORY(state, newHistory) {
        state.dialogHistory = newHistory;
      },
      PUSH_USER_INPUT_TO_DIALOG(state, userInput) {
        state.dialog.push(userInput);
      },
      PUSH_LIVE_CHAT_STATUS_TO_DIALOG(state, liveChatStatus) {
        state.dialog.push(liveChatStatus);
      },
      PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG(state, liveChatResponse) {
        state.dialog.push(liveChatResponse);
      },
      CLEAR_USER_INPUT(state) {
        state.userInput = "";
      },
      SHOW_CHAT_LOADING(state) {
        if (!USE_LOCAL_STORAGE) {
          state.showChatLoading = true;
        }
      },
      HIDE_CHAT_LOADING(state) {
        if (!USE_LOCAL_STORAGE) {
          state.showChatLoading = false;
        }
      },
      LIVE_CHAT_LOADING(state, mustShow) {
        state.showLiveChatProcessing = mustShow;
      },
      SHOW_LIVE_CHAT_LOADING(state) {
        state.showLiveChatProcessing = true;
      },
      HIDE_LIVE_CHAT_LOADING(state) {
        state.showLiveChatProcessing = false;
      },
      CLEAR_CHAT_HISTORY(state) {
        state.dialog = [];
      },
      LIVE_CHAT(state, transcript) {
        doLiveChatRequest(transcript);
      },
      START_LIVE_CHAT(state) {
        state.isLiveChat = true;
      },
      STOP_LIVE_CHAT(state) {
        state.isLiveChat = false;
      },
      CHANGE_THEME(state) {
        state.dark = !state.dark;
        localStorage.setItem(STORAGE_KEY + TENEO_CHAT_DARK_THEME, JSON.stringify(state.dark));
      },
      SHOW_LISTING_OVERLAY(state) {
        state.listening = true;
      },
      HIDE_LISTENING_OVERLAY(state) {
        state.listening = false;
      },
      SET_USER_INPUT(state, userInput) {
        if (userInput) {
          //state.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
          state.userInput = userInput;
        }
      },
      START_TTS(state) {
        state.speakBackResponses = true;
      },
      STOP_TTS(state) {
        state.speakBackResponses = false;
      },
      TTS_ENABLE(state, useTTS) {
        state.speakBackResponses = useTTS;
      },
      UPDATE_CHAT_WINDOW_AND_STORAGE(state, response) {
        let hasExtraData = false;
        if (
          response.teneoResponse &&
          (response.teneoResponse.extraData.extensions ||
            response.teneoResponse.extraData.liveChat ||
            response.teneoResponse.link.href)
        ) {
          hasExtraData = true;
        }

        let newUserInput = {
          type: "userInput",
          text: response.userInput,
          bodyText: "",
          hasExtraData: false
        };

        // add the user input - display it on the chat dialog
        state.dialog.push(newUserInput);

        let newReply = {
          type: "reply",
          text: response.teneoAnswer,
          bodyText: "",
          teneoResponse: response.teneoResponse,
          hasExtraData: hasExtraData
        };

        // add the teneo response - display it on the chat dialog
        state.dialog.push(newReply);
        if (hasExtraData) {
          state.modalItem = newReply;
          state.showModal = true;
        }

        state.userInput = ""; // reset the user input to nothing

        // deal with persiting the chat history
        if (USE_LOCAL_STORAGE) {
          localStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(state.dialog));
        }
        state.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY));
        if (state.dialogHistory === null) {
          state.dialogHistory = state.dialog;
        } else {
          // add current user input and teneo response to the dialog history
          state.dialogHistory.push(newUserInput);
          state.dialogHistory.push(newReply);
        }
        // save the dislaog history in session storage
        sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(state.dialogHistory));
      },
      SHOW_PROGRESS_BAR(state) {
        state.progressBar = true;
      },
      HIDE_PROGRESS_BAR(state) {
        state.progressBar = false;
      },
      SHOW_CONFIG_MODAL(state) {
        state.showConfigModal = true;
      },
      HIDE_CONFIG_MODAL(state) {
        state.showConfigModal = false;
      },
      UPDATE_TENEO_URL(state, newUrl) {
        state.teneoUrl = newUrl;
      },
      SHOW_CHAT_MODAL(state, item) {
        state.modalItem = item;
        state.showModal = true;
      },
      STOP_AUDIO_CAPTURE(state) {
        state.stopAudioCapture = true;
      },
      START_AUDIO_CAPTURE(state) {
        state.stopAudioCapture = false;
      },
      HIDE_CHAT_MODAL(state) {
        // console.log("hiding modal");
        state.userInputReadyForSending = false;
        state.showModal = false;
        state.modalItem = null;
        // console.log("modal item should be empty");
      },
      CLEAR_DIALOGS(state) {
        state.dialog = [];
      },
      FLAG_SESSION_RESTART(state) {
        state.resetSession = true;
      },
      USER_INPUT_READY_FOR_SENDING(state) {
        state.userInputReadyForSending = true;
      },
      USER_INPUT_NOT_READY_FOR_SENDING(state) {
        state.userInputReadyForSending = false;
      },
      REMOVE_MODAL_ITEM(state) {
        state.modalItem = null;
      },
      AGENT_NAME(state, agentName) {
        state.agentName = agentName;
      },
      AGENT_ID(state, agentId) {
        state.agentID = agentId;
      },
      AGENT_AVATAR(state, imageUrl) {
        state.agentAvatar = imageUrl;
      }
    },
    actions: {
      stopAudioCapture(context) {
        if (artyom.isSpeaking()) {
          // console.log("muted TTS!");
          artyom.shutUp();
        }
        if (artyom.isObeying()) {
          UserDictation.stop();
          context.commit("STOP_AUDIO_CAPTURE");
        }
      },
      endSession(context) {
        context.commit("CLEAR_DIALOGS");
        context.commit("FLAG_SESSION_RESTART");
        context.commit("REMOVE_MODAL_ITEM");
        let fullUrl = new URL(context.getters.teneoUrl);
        let endSessionUrl =
          fullUrl.protocol +
          "//" +
          fullUrl.host +
          fullUrl.pathname +
          "endsession?viewtype=STANDARDJSONP" +
          (SEND_CTX_PARAMS === "all"
            ? REQUEST_PARAMETERS.length > 0
              ? "&" + REQUEST_PARAMETERS.substring(1, REQUEST_PARAMETERS.length)
              : ""
            : "");

        Vue.jsonp(endSessionUrl, {}).then(console.log("Session Ended"));
      },
      login(context) {
        // get the greeting message if we haven't done so for this session
        return new Promise((resolve, reject) => {
          Vue.jsonp(TENEO_URL + REQUEST_PARAMETERS, {
            command: "login"
            // userInput: ""
          })
            .then(json => {
              context.commit("HIDE_CHAT_LOADING"); // about to show the greeting - hide the chat loading spinner
              // console.log(decodeURIComponent(json.responseData.answer))
              let hasExtraData = false;
              if (json.responseData.extraData.extensions || json.responseData.extraData.liveChat) {
                hasExtraData = true;
              }
              const response = {
                type: "reply",
                text: decodeURIComponent(json.responseData.answer).replace(/onclick="[^"]+"/g, 'class="sendInput"'),
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
              reject(err);
            });
        });
      },
      sendUserInput(context, params = "") {
        // send user input to Teneo when a live chat has not begun
        if (artyom && artyom.isSpeaking()) {
          // Artyom is speaking something. Let's shut it up
          artyom.shutUp();
        }
        if (!context.getters.isLiveChat) {
          Vue.jsonp(context.getters.teneoUrl + (SEND_CTX_PARAMS === "all" ? REQUEST_PARAMETERS + params : params), {
            userinput: context.getters.userInput
          })
            .then(json => {
              if (json.responseData.isNewSession || json.responseData.extraData.newsession) {
                console.log("Session is stale.. keep chat open and continue with the new session");
              }
              // console.log(decodeURIComponent(json.responseData.answer))
              const response = {
                userInput: context.getters.userInput,
                teneoAnswer: decodeURIComponent(json.responseData.answer).replace(
                  /onclick="[^"]+"/g,
                  'class="sendInput"'
                ),
                teneoResponse: json.responseData
              };

              let ttsText = stripHtml(response.teneoAnswer);
              if (response.teneoResponse.extraData.tts) {
                ttsText = stripHtml(decodeURIComponent(response.teneoResponse.extraData.tts));
              }

              // check if this browser supports the Web Speech API
              if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
                if (artyom && context.getters.speakBackResponses) {
                  artyom.say(ttsText);
                }
              }

              context.commit("UPDATE_CHAT_WINDOW_AND_STORAGE", response);
              context.commit("HIDE_PROGRESS_BAR");
              if (response.teneoResponse && response.teneoResponse.extraData.liveChat) {
                context.commit("START_LIVE_CHAT");
              }

              // added on request from Mark J - switch languages based on NER language detection
              let langInput = decodeURIComponent(response.teneoResponse.extraData.langinput);
              let langEngineUrl = decodeURIComponent(response.teneoResponse.extraData.langengineurl);

              if (langEngineUrl !== "undefined" && langInput !== "undefined") {
                context.commit("UPDATE_TENEO_URL", langEngineUrl + "?viewname=STANDARDJSONP");
                context.commit("SET_USER_INPUT", langInput);
                context.commit("SHOW_PROGRESS_BAR");
                context
                  .dispatch("sendUserInput")
                  .then(console.log("Sent original lang input to new lang specific solution"))
                  .catch(err => {
                    console.err("Unable to send lang input to new lang specific solution", err.message);
                  });
              }
            })
            .catch(err => {
              console.log(err);
              if (err.status && err.status === 408) {
                console.log("Oh dear - Request Timed Out");
              }
              context.commit("HIDE_PROGRESS_BAR");
            });
        } else {
          // send the input to live chat agent and save user input to history
          let newUserInput = {
            type: "userInput",
            text: context.getters.userInput,
            bodyText: "",
            hasExtraData: false
          };
          context.commit("PUSH_USER_INPUT_TO_DIALOG", newUserInput);

          if (USE_LOCAL_STORAGE) {
            localStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(context.getters.dialog));
          }
          context.commit("SET_DIALOG_HISTORY", JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY)));
          if (context.getters.dialogHistory === null) {
            context.commit("SET_DIALOG_HISTORY", context.getters.dialog);
          } else {
            context.commit("PUSH_USER_INPUT_TO_DIALOG_HISTORY", newUserInput);
          }
          sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(context.getters.dialogHistory));
          doLiveChatRequest(context.getters.userInput);
          context.commit("HIDE_PROGRESS_BAR");
          context.commit("SET_USER_INPUT", "");
        }
      },
      captureAudio(context) {
        if (UserDictation != null) {
          if (artyom.isSpeaking()) {
            // console.log("Artyom is speaking something. Let's shut it up");
            artyom.shutUp();
          }
          context.commit("START_AUDIO_CAPTURE");
          UserDictation.start();
        }
      }
    }
  });

  // setup i18n for Leopard UI
  Vue.use(vuexI18n.plugin, store);
  Object.keys(TRANSLATIONS).forEach(function(key) {
    Vue.i18n.add(key, TRANSLATIONS[key]);
  });
  Vue.i18n.set(LOCALE);

  // Artyom Speech Recognition and TTS
  let UserDictation = null;
  if (artyom != null) {
    UserDictation = artyom.newDictation({
      soundex: true,
      continuous: false, // Enable continuous if HTTPS connection
      onResult: function(text) {
        clearTimeout(timeoutVar);
        // Do something with the text
        if (text) {
          //text = text.replace(/^\w/, c => c.toUpperCase()); // upercases first letter of user input -- use cautiously
          text = text.replace(/what's/gi, "what");
          store.commit("SET_USER_INPUT", text);
        }
        timeoutVar = setTimeout(function() {
          // console.log("timeout - aborting recognition");
          UserDictation.stop();
          if (text) {
            store.commit("SET_USER_INPUT", text); // final transcript from ASR
          }
        }, 800);
      },
      onStart: function() {},
      onEnd: function() {
        store.commit("HIDE_LISTENING_OVERLAY");

        if (store.getters.stopAudioCapture) {
          store.commit("CLEAR_USER_INPUT");
          store.commit("STOP_AUDIO_CAPTURE");
          // store.state.stopAudioCapture = false;
          return;
        }
        // let's fix sany ASR transcription erros

        if (store.getters.userInput) {
          let fixedUserInput = store.getters.userInput;
          // console.log("Final Transcription from ASR: " + store.state.userInput);
          ASR_CORRECTIONS.forEach(replacement => {
            let startingText = fixedUserInput;

            if (replacement[0].indexOf(".") > -1) {
              fixedUserInput = replaceString(
                fixedUserInput.toLowerCase(),
                replacement[0].toLowerCase(),
                replacement[1].toLowerCase()
              );
            } else {
              let search = replacement[0].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // escase any special characters
              var re = new RegExp("\\b" + search + "\\b", "gi");
              // fixedUserInput = fixedUserInput.toLowerCase().replace(re, replacement[1].toLowerCase());
              fixedUserInput = fixedUserInput.replace(re, replacement[1]);
            }

            // console.log(`Starting: ${startingText} | Ending: ${fixedUserInput}`);

            if (startingText.toLowerCase() !== fixedUserInput.toLowerCase()) {
              console.log("Made a change to ASR response: " + replacement[0] + " >> " + replacement[1]);
            }
          });

          if (store.getters.userInput.toLowerCase() !== fixedUserInput.toLowerCase()) {
            store.getters.userInput = fixedUserInput;
            console.log(`Final Transcription: ${fixedUserInput}`);
          }

          setTimeout(function() {
            store.commit("USER_INPUT_READY_FOR_SENDING");
          }, 100);
        }
      }
    });
  }

  // Live Chat
  let visitorSDK = null;

  if (store.getters.enableLiveChat) {
    const liveChatIncLicense = process.env.VUE_APP_LIVE_CHAT_INC_KEY; // change me https://www.livechatinc.com/
    visitorSDK = LivechatVisitorSDK.init({
      license: liveChatIncLicense
    });

    visitorSDK.on("chat_started", () => {
      // console.log("chat_started");
      // console.log(chatData);

      // when a user reloads the page while a chat is going on, the message history is loaded. We need to stop that from happening by closing the chat
      if (!store.getters.isLiveChat) {
        visitorSDK
          .closeChat()
          .then(() => {
            // console.log("Live chat has closed");
          })
          .catch(error => {
            console.log(error);
          });
      }
    });

    visitorSDK.on("visitor_queued", queueData => {
      // console.log(queueData);
      let message = "Chat request sent to agent. You are number " + queueData.numberInQueue + " in the queue.";
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.getters.isLiveChat) {
        let liveChatStatus = {
          type: "liveChatQueue",
          text: message,
          bodyText: "",
          hasExtraData: false
        };
        store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
      } else {
        visitorSDK
          .closeChat()
          .then(() => {
            // console.log("Live chat has closed");
          })
          .catch(error => {
            console.log(error);
          });
      }
    });

    visitorSDK.on("agent_changed", newAgent => {
      // console.log(newAgent);
      store.commit("AGENT_NAME", newAgent.name);
      store.commit("AGENT_ID", newAgent.id);
      store.commit("AGENT_AVATAR", newAgent.avatarUrl);
      // show typing output agentName + ' is typing...'

      let message = "You are talking to " + newAgent.name + ".";

      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.getters.isLiveChat) {
        let liveChatStatus = {
          type: "liveChatStatus",
          text: message,
          bodyText: "",
          hasExtraData: false
        };
        store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
      } else {
        visitorSDK
          .closeChat()
          .then(() => {
            // console.log("Chat is closed");
          })
          .catch(error => {
            console.log(error);
          });
      }
    });

    visitorSDK.on("chat_ended", () => {
      // console.log("chat ended");
      let message = "Chat with live agent ended.";
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.getters.isLiveChat) {
        let liveChatStatus = {
          type: "liveChatEnded",
          text: message,
          bodyText: "",
          hasExtraData: false
        };
        store.commit("PUSH_LIVE_CHAT_STATUS_TO_DIALOG", liveChatStatus); // push the getting message onto the dialog
      }
      store.commit("STOP_LIVE_CHAT");
    });

    visitorSDK.on("typing_indicator", data => {
      store.commit("LIVE_CHAT_LOADING", !!data.isTyping);
    });

    visitorSDK.on("new_message", newMessage => {
      // console.log(newMessage);
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.getters.isLiveChat) {
        if (newMessage.authorId === store.getters.agentId) {
          let liveChatResponse = {
            type: "liveChatResponse",
            text: newMessage.text,
            agentAvatar: store.getters.agentAvatar,
            agentName: store.getters.agentName,
            bodyText: "",
            hasExtraData: false
          };
          store.commit("PUSH_LIVE_CHAT_RESPONSE_TO_DIALOG", liveChatResponse); // push the getting message onto the dialog
          if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
            if (artyom && store.getters.speakBackResponses) {
              artyom.say(stripHtml(newMessage.text));
            }
          }

          if (USE_LOCAL_STORAGE) {
            localStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.getters.dialog));
          }
          store.commit("SET_DIALOG_HISTORY", JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY)));
          if (store.getters.dialogHistory === null) {
            store.commit("SET_DIALOG_HISTORY", store.getters.dialog);
          } else {
            store.commit("PUSH_RESPONSE_TO_DIALOG_HISTORY", liveChatResponse);
          }
          sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.getters.dialogHistory));
          store.commit("CLEAR_USER_INPUT");
        }
      }
    });
  }

  /**
   * Send a message to message to the live chat agent
   *
   * @param {*} message
   */
  function doLiveChatRequest(message) {
    // console.log("Sending message to Live Agent:" + message);
    visitorSDK
      .sendMessage({
        text: message,
        customId: String(Math.random())
      })
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // android and ios webview ASR and TTS

  window.sendVoiceInput = function(userInput) {
    // console.log(`In SendVoiceInput: ${userInput}`);
    //store.state.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
    store.commit("SET_USER_INPUT", userInput);
    store.commit("USER_INPUT_READY_FOR_SENDING");
    store.commit("HIDE_LISTENING_OVERLAY");
  };

  callback(store);
}
