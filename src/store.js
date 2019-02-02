import Vue from "vue";
import Vuex from "vuex";
import VueJsonp from "vue-jsonp";
import Artyom from "artyom.js";
import vuexI18n from "vuex-i18n";
import parseBool from "parseboolean";
import * as LivechatVisitorSDK from "@livechat/livechat-visitor-sdk";
import URL from "url-parse";
import toHex from "colornames";
import request from "simple-json-request";
import stripHtml from "string-strip-html";
import { STORAGE_KEY, ASR_CORRECTIONS } from "./constants/constants";

const translationsEn = {
  "input.box.label": "Say something...",
  "empty.user.input": "Looks like you didn't say anything to me",
  listening: "Listening...",
  "more.button": "more",
  "more.info.title": "More Information",
  "back.to.chat.button": "back to chat",
  "menu.chat": "Chat",
  "menu.about": "About",
  "menu.help": "Help",
  "menu.history": "History",
  "menu.config": "Config",
  "no.chat.history.title": "No Chat History",
  "no.chat.history.body": "Ask me a few questions to get things rolling..",
  "about.page.button": "Learn more",
  "about.page.title": "Teneo by Artificial Solutions",
  "about.page.content":
    "Teneo allows your customers to speak to applications, devices and web services in a natural, human-like and intelligent way",
  "about.page.url": "https://www.artificial-solutions.com/",
  "help.page.title": "Here are some things that you can ask me"
};

const translationsFr = {
  "input.box.label": "Dis quelquechose...",
  "empty.user.input": "Tu ne m'as rien dit",
  listening: "j'écoute",
  "more.button": "plus",
  "more.info.title": "Plus d'information",
  "back.to.chat.button": "retour au chat",
  "menu.chat": "Parler",
  "menu.about": "À propos de nous",
  "menu.help": "Aidez-moi",
  "menu.history": "Histoire",
  "menu.config": "Config",
  "no.chat.history.title": "Aucun historique de discussion",
  "no.chat.history.body": "Posez-moi quelques questions pour faire avancer les choses..",
  "about.page.button": "Apprendre encore plus",
  "about.page.title": "Teneo par des Artificial Solutions",
  "about.page.content":
    "Teneo permet à vos clients de parler des applications, des appareils et des services Web de manière naturelle, humaine et intelligente",
  "about.page.url": "https://www.artificial-solutions.com/",
  "help.page.title": "Voici quelques choses que vous pouvez me demander"
};

const translationsDe = {
  "input.box.label": "Sag etwas...",
  "empty.user.input": "Sieht aus, als hättest du mir nichts gesagt",
  listening: "Zuhören...",
  "more.button": "mehr",
  "more.info.title": "Weitere Informationen",
  "back.to.chat.button": "zurück zum Chat",
  "menu.chat": "Chat",
  "menu.about": "Ungefähr",
  "menu.help": "Hilfe",
  "menu.history": "Geschichte",
  "menu.config": "Config",
  "no.chat.history.title": "Kein Chatverlauf",
  "no.chat.history.body": "Stellen Sie mir ein paar Fragen, um die Dinge ins Rollen zu bringen",
  "about.page.button": "Erfahren Sie mehr",
  "about.page.title": "Teneo von Artificial Solutions",
  "about.page.content":
    "Mit Teneo können Ihre Kunden auf natürliche, menschenähnliche und intelligente Weise mit Anwendungen, Geräten und Webdiensten sprechen",
  "about.page.url": "https://www.artificial-solutions.com/de/",
  "help.page.title": "Hier sind einige Dinge, die Sie mich fragen können"
};

const translationsNl = {
  "input.box.label": "Zeg iets...",
  "empty.user.input": "Het lijkt erop dat je niets tegen me zei",
  listening: "het luisteren...",
  "more.button": "meer",
  "more.info.title": "Meer informatie",
  "back.to.chat.button": "terug naar chat",
  "menu.chat": "Babbelen",
  "menu.about": "Over",
  "menu.help": "Help",
  "menu.history": "Geschiedenis",
  "menu.config": "Config",
  "no.chat.history.title": "Geen chatgeschiedenis",
  "no.chat.history.body": "Stel me een paar vragen om dingen aan het rollen te krijgen",
  "about.page.button": "Meer informatie",
  "about.page.title": "Teneo van Artificial Solutions",
  "about.page.content":
    "Met Teneo kunnen uw klanten op een natuurlijke, mensachtige en intelligente manier met applicaties, apparaten en webservices spreken",
  "about.page.url": "https://www.artificial-solutions.com/nl/",
  "help.page.title": "Hier zijn enkele dingen die u mij kunt vragen"
};

const translationsEs = {
  "input.box.label": "Di algo...",
  "empty.user.input": "Parece que no me dijiste nada",
  listening: "Escuchando...",
  "more.button": "Más",
  "more.info.title": "Más información",
  "back.to.chat.button": "volver al chat",
  "menu.chat": "Charla",
  "menu.about": "Acerca de",
  "menu.help": "Ayuda",
  "menu.history": "Historia",
  "menu.config": "Config",
  "no.chat.history.title": "Sin historial de chat",
  "no.chat.history.body": "Hazme algunas preguntas para que las cosas funcionen",
  "about.page.button": "Aprende más",
  "about.page.title": "Teneo por Artificial Solutions",
  "about.page.content":
    "Teneo les permite a sus clientes hablar con aplicaciones, dispositivos y servicios web de forma natural, humana e inteligente",
  "about.page.url": "https://www.artificial-solutions.com/es/",
  "help.page.title": "Aquí hay algunas cosas que puedes preguntarme"
};

// Vue.use(VueLocalStorage);
Vue.use(VueJsonp, 10000);
Vue.use(Vuex);

const TENEO_CHAT_HISTORY = "teneo-chat-history";
const TENEO_CHAT_DARK_THEME = "darkTheme";
let store;

let timeoutVar;
let TENEO_URL = "";
let IFRAME_URL = "";
let LOCALE = "en";
let CHAT_TITLE = "Configure Me";
let RESPONSE_ICON = "";
let USER_ICON = "";
let KNOWLEDGE_DATA = [];
let SEND_CTX_PARAMS = "login";
// const USE_LOCAL_STORAGE = parseBool(activeSolution.useLocalStorage);
let USE_LOCAL_STORAGE = false;
let ENABLE_LIVE_CHAT = false;
let REQUEST_PARAMETERS = "";
let THEME = {
  primary: "#D60270",
  secondary: "#5B017B",
  accent: "#4CAF50",
  error: "#FF5252",
  info: "#2196F3",
  success: "#4CAF50",
  warning: "#FFC107"
}; // default theme
let artyom = null;
let chatConfig = JSON.parse(localStorage.getItem(STORAGE_KEY + "config"));
let activeSolution = null;

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
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
  const defaultConfigUrl = `${location.protocol}//${location.host}${location.pathname}static/default.json`;

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

    TENEO_URL = activeSolution.url + "?viewname=STANDARDJSONP";
    IFRAME_URL = activeSolution.iframeUrl;
    LOCALE = activeSolution.locale;
    CHAT_TITLE = activeSolution.chatTitle;
    RESPONSE_ICON = activeSolution.responseIcon;
    USER_ICON = activeSolution.userIcon;
    KNOWLEDGE_DATA = activeSolution.knowledgeData;
    SEND_CTX_PARAMS = activeSolution.sendContextParams ? activeSolution.sendContextParams : "login";
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
  document.getElementById("site-frame").src = IFRAME_URL;

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
      theme: THEME,
      iframeUrl: IFRAME_URL,
      requestParameters: REQUEST_PARAMETERS,
      chatConfig: chatConfig,
      chatTitle: CHAT_TITLE,
      responseIcon: RESPONSE_ICON,
      userIcon: USER_ICON,
      knowledgeData: KNOWLEDGE_DATA,
      dark: false,
      listening: false,
      speakBackResponses: false,
      userInputReadyForSending: false,
      userInput: "",
      progressBar: false,
      showModal: false,
      teneoUrl: TENEO_URL,
      dialog: [],
      dialogHistory: [],
      modalItem: null,
      isLiveChat: false,
      isWebSite: true,
      enableLiveChat: ENABLE_LIVE_CHAT,
      agentName: null,
      agentID: null,
      agentAvatar: null,
      liveChatMessage: null,
      showLiveChatProcessing: false,
      showChatLoading: false,
      showConfigModal: true,
      stopAudioCapture: false
    },
    getters: {
      chatConfig() {
        return store.chatConfig;
      },
      isLiveChat() {
        return store.state.isLiveChat;
      },
      knowledgeData() {
        return store.state.knowledgeData;
      },
      liveChatMessage() {
        return store.state.liveChatMessage;
      },
      showChatLoading() {
        return store.state.showChatLoading;
      },
      showLiveChatProcessing() {
        return store.state.showLiveChatProcessing;
      },
      getChatHistory() {
        if (USE_LOCAL_STORAGE) {
          if (store.state.dialog.length !== 0) {
            let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY, "[]"));
            if (chatHistory.length !== 0) {
              store.state.dialog.concat(chatHistory);
            }
          } else {
            store.state.dialog = JSON.parse(localStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY, "[]"));
          }
        }
        return store.state.dialog;
      },
      getChatHistorySessionStorage() {
        // TODO: Try and make the chat history in session storage unique to the deeplink
        if (store.state.dialogHistory.length === 0) {
          store.state.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY));
          if (store.state.dialogHistory === null) {
            store.state.dialogHistory = [];
          }
        }
        return store.state.dialogHistory;
      },
      getUserInput() {
        return store.state.userInput;
      },
      progressBar() {
        return store.state.progressBar;
      },
      getShowModal() {
        return store.state.showModal;
      },
      getShowConfigModal() {
        return store.state.showConfigModal;
      },
      getModalItem() {
        return store.state.modalItem;
      },
      dark() {
        return store.state.dark;
      },
      chatTitle() {
        return store.state.chatTitle;
      }
    },
    mutations: {
      showChatLoading() {
        if (!USE_LOCAL_STORAGE) {
          store.state.showChatLoading = true;
        }
      },
      hideChatLoading() {
        if (!USE_LOCAL_STORAGE) {
          store.state.showChatLoading = false;
        }
      },
      showLiveChatLoading() {
        store.state.showLiveChatProcessing = true;
      },
      hideLiveChatLoading() {
        store.state.showLiveChatProcessing = false;
      },
      clearChatHistory() {
        store.state.dialog = [];
      },
      liveChat(state, transcript) {
        doLiveChatRequest(transcript);
      },
      liveChatStarted() {
        store.state.isLiveChat = true;
      },
      liveChatEnded() {
        store.state.isLiveChat = false;
      },
      changeTheme() {
        store.state.dark = !store.state.dark;
        localStorage.setItem(STORAGE_KEY + TENEO_CHAT_DARK_THEME, JSON.stringify(store.state.dark));
      },
      showListening() {
        store.state.listening = true;
      },
      hideListening() {
        store.state.listening = false;
      },
      setUserInput(state, userInput) {
        if (userInput) {
          //state.userInput = userInput.replace(/^\w/, c => c.toUpperCase());
          state.userInput = userInput;
        }
      },
      speakBackResponses(state, useTTS) {
        state.speakBackResponses = useTTS;
      },
      updateChatWindowAndStorage(state, response) {
        store.commit("hideProgressBar");
        let hasExtraData = false;
        if (
          response.teneoResponse.extraData.extensions ||
          response.teneoResponse.extraData.liveChat ||
          response.teneoResponse.link.href
        ) {
          hasExtraData = true;
        }
        if (response.teneoResponse.extraData.liveChat) {
          store.commit("liveChatStarted");
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
      showProgressBar() {
        store.state.progressBar = true;
      },
      hideProgressBar() {
        store.state.progressBar = false;
      },
      showConfigModal(state) {
        state.showConfigModal = true;
      },
      hideConfigModal(state) {
        state.showConfigModal = false;
      },
      showModal(state, item) {
        state.modalItem = item;
        state.showModal = true;
      },
      hideModal(state) {
        // console.log("hiding modal");
        state.showModal = false;
        state.modalItem = null;
        // console.log("modal item should be empty");
      }
    },
    actions: {
      stopAudioCapture() {
        if (artyom.isSpeaking()) {
          // console.log("muted TTS!");
          artyom.shutUp();
        }
        if (artyom.isObeying()) {
          UserDictation.stop();
          store.state.stopAudioCapture = true;
          // console.log("stopped audio capture!");
        }
      },
      endSession() {
        return new Promise((resolve, reject) => {
          let fullUrl = new URL(store.state.teneoUrl);
          let endSessionUrl =
            fullUrl.protocol +
            "//" +
            fullUrl.host +
            fullUrl.pathname +
            "endsession" +
            (SEND_CTX_PARAMS === "all"
              ? REQUEST_PARAMETERS.length > 0
                ? "?" + REQUEST_PARAMETERS.substring(1, REQUEST_PARAMETERS.length)
                : ""
              : "");

          Vue.jsonp(endSessionUrl, {})
            .then(() => {
              console.log("Session Ended");
              store.state.dialog = [];
              store.state.resetSession = true;
              store.state.modalItem = null;
              // router.push("/");
              // store.dispatch("login").then((store.state.dialogHistory = []));
              resolve();
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        });
      },
      login() {
        // get the greeting message if we haven't done so for this session
        return new Promise((resolve, reject) => {
          Vue.jsonp(TENEO_URL + REQUEST_PARAMETERS, {
            command: "login"
            // userInput: ""
          })
            .then(json => {
              store.commit("hideChatLoading"); // about to show the greeting - hide the chat loading spinner
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
              store.state.dialog.push(response); // push the getting message onto the dialog
              if (hasExtraData) {
                store.state.modalItem = response;
                store.state.showModal = true;
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
          // console.log("Artyom is speaking something. Let's shut it up");
          artyom.shutUp();
        }
        if (!store.getters.isLiveChat) {
          Vue.jsonp(store.state.teneoUrl + (SEND_CTX_PARAMS === "all" ? REQUEST_PARAMETERS + params : params), {
            userinput: store.state.userInput
          })
            .then(json => {
              if (json.responseData.isNewSession || json.responseData.extraData.newsession) {
                console.log("Session is stale");
                store.commit("hideProgressBar");
                store.dispatch("endSession");
                return true;
              }
              // console.log(decodeURIComponent(json.responseData.answer))
              const response = {
                userInput: store.state.userInput,
                teneoAnswer: decodeURIComponent(json.responseData.answer).replace(
                  /onclick="[^"]+"/g,
                  'class="sendInput"'
                ),
                teneoResponse: json.responseData
              };

              // const ttsText = store.getters.getTTSInput(json.responseData);

              let ttsText = stripHtml(response.teneoAnswer);
              if (response.teneoResponse.extraData.tts) {
                ttsText = stripHtml(decodeURIComponent(response.teneoResponse.extraData.tts));
              }

              webviewSay(ttsText);
              // check if this browser supports the Web Speech API
              if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
                if (artyom && store.state.speakBackResponses) {
                  artyom.say(ttsText);
                }
              }

              context.commit("updateChatWindowAndStorage", response);

              // added on request from Mark J - switch languages based on NER language detection
              let langInput = decodeURIComponent(response.teneoResponse.extraData.langinput);
              let langEngineUrl = decodeURIComponent(response.teneoResponse.extraData.langengineurl);

              if (langEngineUrl !== "undefined" && langInput !== "undefined") {
                store.state.teneoUrl = langEngineUrl + "?viewname=STANDARDJSONP";
                // console.log(store.state.teneoUrl);
                store.state.userInput = langInput;
                store.commit("showProgressBar");
                store
                  .dispatch("sendUserInput")
                  .then(console.log("Sent original lang input to new lang specific solution"))
                  .catch(err => {
                    console.err("Unable to send lang input to new lang specific solution", err.message);
                  });
              }
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          // send the input to live chat agent and save user input to history
          let newUserInput = {
            type: "userInput",
            text: store.state.userInput,
            bodyText: "",
            hasExtraData: false
          };
          store.state.dialog.push(newUserInput);

          if (USE_LOCAL_STORAGE) {
            localStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.state.dialog));
          }
          store.state.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY));
          if (store.state.dialogHistory === null) {
            store.state.dialogHistory = store.state.dialog;
          } else {
            store.state.dialogHistory.push(newUserInput);
          }
          sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.state.dialogHistory));
          doLiveChatRequest(store.state.userInput);
          // console.log("Sent a message to agent: " + store.state.userInput);
          store.commit("hideProgressBar");
          store.state.userInput = "";
        }
      },
      captureAudio() {
        if (UserDictation != null) {
          if (artyom.isSpeaking()) {
            // console.log("Artyom is speaking something. Let's shut it up");
            artyom.shutUp();
          }
          store.state.stopAudioCapture = false;
          UserDictation.start();
        }
        // webview asr for android and iOS
        webviewStartAsr();
      }
    }
  });

  Vue.use(vuexI18n.plugin, store);

  Vue.i18n.add("en", translationsEn);
  Vue.i18n.add("fr", translationsFr);
  Vue.i18n.add("de", translationsDe);
  Vue.i18n.add("nl", translationsNl);
  Vue.i18n.add("nl", translationsNl);
  Vue.i18n.add("es", translationsEs);

  Vue.i18n.set(LOCALE);

  let UserDictation = null;
  if (artyom != null) {
    UserDictation = artyom.newDictation({
      soundex: true,
      continuous: false, // Enable continuous if HTTPS connection
      onResult: function(text) {
        clearTimeout(timeoutVar);
        // Do something with the text
        if (text) {
          //text = text.replace(/^\w/, c => c.toUpperCase());
          text = text.replace(/what's/gi, "what");
          store.state.userInput = text;
        }
        timeoutVar = setTimeout(function() {
          // console.log("timeout - aborting recognition");
          UserDictation.stop();
          if (text) {
            store.state.userInput = text; // final transcript from ASR
          }
        }, 800);
      },
      onStart: function() {},
      onEnd: function() {
        store.state.listening = false;

        if (store.state.stopAudioCapture) {
          store.state.userInput = "";
          store.state.stopAudioCapture = false;
          return;
        }
        // let's fix sany ASR transcription erros

        if (store.state.userInput) {
          let fixedUserInput = store.state.userInput;
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

          if (store.state.userInput.toLowerCase() !== fixedUserInput.toLowerCase()) {
            store.state.userInput = fixedUserInput;
            console.log(`Final Transcription: ${fixedUserInput}`);
          }

          setTimeout(function() {
            store.state.userInputReadyForSending = true;
          }, 100);
        }
      }
    });
  }

  // Live Chat
  let visitorSDK = null;

  if (store.state.enableLiveChat) {
    const liveChatIncLicense = 9243615; // change me https://www.livechatinc.com/
    visitorSDK = LivechatVisitorSDK.init({
      license: liveChatIncLicense
    });

    visitorSDK.on("chat_started", chatData => {
      // console.log("chat_started");
      // console.log(chatData);

      // when a user reloads the page while a chat is going on, the message history is loaded. We need to stop that from happening by closing the chat
      if (!store.state.isLiveChat) {
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
      if (store.state.isLiveChat) {
        let liveChatStatus = {
          type: "liveChatQueue",
          text: message,
          bodyText: "",
          hasExtraData: false
        };
        store.state.dialog.push(liveChatStatus); // push the getting message onto the dialog
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
      store.state.agentName = newAgent.name;
      store.state.agentID = newAgent.id;
      store.state.agentAvatar = newAgent.avatarUrl;
      // show typing output agentName + ' is typing...'

      let message = "You are talking to " + newAgent.name + ".";

      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.state.isLiveChat) {
        let liveChatStatus = {
          type: "liveChatStatus",
          text: message,
          bodyText: "",
          hasExtraData: false
        };
        store.state.dialog.push(liveChatStatus); // push the getting message onto the dialog
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
        store.state.dialog.push(liveChatStatus); // push the getting message onto the dialog
      }
      store.commit("liveChatEnded");
    });

    visitorSDK.on("typing_indicator", data => {
      store.state.showLiveChatProcessing = !!data.isTyping;
    });

    visitorSDK.on("new_message", newMessage => {
      // console.log(newMessage);
      // only display messages if live chat is active (check for isLiveChat prevents messages from showing when user refreshed the page)
      if (store.state.isLiveChat) {
        if (newMessage.authorId === store.state.agentID) {
          let liveChatResponse = {
            type: "liveChatResponse",
            text: newMessage.text,
            agentAvatar: store.state.agentAvatar,
            agentName: store.state.agentName,
            bodyText: "",
            hasExtraData: false
          };
          store.state.dialog.push(liveChatResponse); // push the getting message onto the dialog
          this.webviewSay(stripHtml(newMessage.text));
          if (window.hasOwnProperty("webkitSpeechRecognition") && window.hasOwnProperty("speechSynthesis")) {
            if (artyom && store.state.speakBackResponses) {
              artyom.say(stripHtml(newMessage.text));
            }
          }

          if (USE_LOCAL_STORAGE) {
            localStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.state.dialog));
          }
          store.state.dialogHistory = JSON.parse(sessionStorage.getItem(STORAGE_KEY + TENEO_CHAT_HISTORY));
          if (store.state.dialogHistory === null) {
            store.state.dialogHistory = store.state.dialog;
          } else {
            store.state.dialogHistory.push(liveChatResponse);
          }
          sessionStorage.setItem(STORAGE_KEY + TENEO_CHAT_HISTORY, JSON.stringify(store.state.dialogHistory));
          store.state.userInput = "";
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
    store.state.userInput = userInput;
    store.state.userInputReadyForSending = true;
    store.state.listening = false;
  };

  window.webviewStartAsr = function() {
    // Android
    try {
      Android.startASR("sendVoiceInput");
    } catch (Exception) {
      //console.log('Could not start Android ASR: ' + Exception);
    }

    // iOS
    try {
      webkit.messageHandlers.startASR.postMessage("sendVoiceInput");
    } catch (Exception) {
      //console.log('Could not start iOS ASR: ' + Exception);
    }
  };

  window.webviewSay = function(message) {
    // Android
    try {
      // console.log("TTS Message: " + message);
      Android.speak("<speak>" + stripHtml(message) + "</speak>");
    } catch (Exception) {
      // ignore
    }

    // iOS
    try {
      webkit.messageHandlers.speak.postMessage(stripHtml(message));
    } catch (Exception) {
      // ignore
    }
  };

  window.startASRAfterTTS = function() {
    // console.log("startASRAfterTTS");
    // Android
    try {
      Android.startASRAfterTTS("sendVoiceInput");
    } catch (Exception) {
      //console.log('Could not start Android ASR: ' + Exception);
    }

    // iOS
    try {
      webkit.messageHandlers.startASRAfterTTS.postMessage("sendVoiceInput");
    } catch (Exception) {
      //console.log('Could not start iOS ASR: ' + Exception);
    }
  };

  callback(store);
}
