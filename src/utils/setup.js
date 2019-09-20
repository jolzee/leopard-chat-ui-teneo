import { Ripple } from "vuetify/lib/directives";
import replaceString from "replace-string";
const superagent = require("superagent");
import PromisedLocation from "promised-location";

import { COLOR_NAMES } from "../constants/color-names.js";
import Vue from "vue";
import Vuetify from "vuetify/lib";
import internalConfig from "../assets/default.json";

// import "vuetify/src/stylus/app.styl";

import { ASR_CORRECTIONS } from "../constants/asr-corrections"; // fix ASR issues before they get to Teneo
import { LiveChat } from "../utils/live-chat";
import { STORAGE_KEY } from "../constants/solution-config-default";

export default class Setup {
  constructor() {
    this.TENEO_CHAT_HISTORY = "teneo-chat-history";
    this.TENEO_LAST_INTERACTION_DATE = "teneo-last-interaction";
    this.TENEO_CHAT_DARK_THEME = "darkTheme";
    this.ASR_CORRECTIONS_MERGED;
    this.liveChat;
    this.CHAT_TITLE = "Configure Me";
    this.EMBED = this.doesParameterExist("embed") || this.doesParameterExist("button");
    this.SHOW_BUTTON_ONLY = this.doesParameterExist("button");
    this.ENABLE_LIVE_CHAT = false;
    this.FLOAT = false;
    this.THEME = {
      primary: "#3277D5",
      secondary: "#E78600",
      accent: "#4CAF50",
      error: "#FF5252",
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#FFC107"
    };
    this.IFRAME_URL = "";
    this.KNOWLEDGE_DATA = [];
    this.LOCALE = "en";
    this.REQUEST_PARAMETERS = "";
    this.RESPONSE_ICON = "";
    this.SEND_CTX_PARAMS = "login";
    this.TENEO_URL = "";
    this.USE_SESSION_STORAGE = !this.EMBED;
    this.USER_ICON = "";
    this.activeSolution = null;
    this.chatConfig = null;
    this.firebaseConfig = {
      apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
      authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID
    };
    // Get the dark theme setting from local storage
    if ((localStorage.getItem(STORAGE_KEY + "darkTheme") === "true") === null) {
      localStorage.setItem(STORAGE_KEY + "darkTheme", "false");
    }
  }

  init() {
    return new Promise((resolve, reject) => {
      this.getSolutionConfig()
        .then(() => {
          this.addressBooleans();
          if (!this.EMBED && !this.SHOW_BUTTON_ONLY) {
            this.addIframeHtml();
          }

          if (this.chatConfig && this.chatConfig.activeSolution) {
            let deepLink = this.getParameterByName("dl"); // look for deep link
            if (!deepLink) {
              this.activeSolution = this.chatConfig.activeSolution;
              const matchingSolutions = this.chatConfig.solutions.filter(
                solution => solution.name === this.activeSolution
              );
              this.activeSolution = matchingSolutions[0];
            } else {
              // allow for deep linking to a specific solution ?dl=<deepLink>
              const matchingSolutions = this.chatConfig.solutions.filter(solution => solution.deepLink === deepLink);
              if (matchingSolutions.length > 0) {
                this.activeSolution = matchingSolutions[0];
              } else {
                // fall back to default
                this.activeSolution = this.chatConfig.activeSolution;
                const matchingSolutions = this.chatConfig.solutions.filter(
                  solution => solution.name === this.activeSolution
                );
                this.activeSolution = matchingSolutions[0];
              }
            }
            this.ASR_CORRECTIONS_MERGED = this.getMergedAsrCorrections(ASR_CORRECTIONS);
            this.CHAT_TITLE = this.activeSolution.chatTitle;
            this.IFRAME_URL = this.activeSolution.iframeUrl;
            this.KNOWLEDGE_DATA = this.activeSolution.knowledgeData;
            this.LOCALE = this.activeSolution.locale;
            this.FLOAT = this.activeSolution.float;
            this.RESPONSE_ICON = this.activeSolution.responseIcon;
            this.SEND_CTX_PARAMS = this.activeSolution.sendContextParams
              ? this.activeSolution.sendContextParams
              : "login";
            this.TENEO_URL = this.activeSolution.url + "?viewname=STANDARDJSONP";
            this.USER_ICON = this.activeSolution.userIcon;

            let theme = this.activeSolution.theme;
            // convert color names to their #hex equivalent
            for (const key in theme) {
              if (theme[key].charAt(0) !== "#") theme[key] = COLOR_NAMES[theme[key]];
            }
            this.THEME = theme;

            this.ENABLE_LIVE_CHAT = this.activeSolution.enableLiveChat;
            this.UNIQUE_KEY =
              this.activeSolution.deepLink + (window.location.href.indexOf("mobile=true") > -1 ? "_mobile" : "");
            document.title = this.activeSolution.name;

            let self = this;
            // find active CTX parameters and build the parameters part of the URL
            this.activeSolution.contextParams.forEach(contextParam => {
              if (contextParam) {
                contextParam.values.forEach(value => {
                  if (value.active) {
                    self.REQUEST_PARAMETERS =
                      self.REQUEST_PARAMETERS + "&" + contextParam.name + "=" + encodeURIComponent(value.text);
                  }
                });
              }
            });
          }

          // update the IFRAME URL
          if (!this.EMBED && !this.SHOW_BUTTON_ONLY && document.getElementById("site-frame")) {
            document.getElementById("site-frame").src = this.IFRAME_URL;
          }

          Vue.use(Vuetify, {
            directives: {
              Ripple
            }
          });

          let vuetify = new Vuetify({
            // icons: {
            //   iconfont: ["mdi", "fa", "md"]
            // },
            theme: {
              dark: false,
              themes: {
                light: this.THEME,
                dark: {
                  primary: "#212121",
                  secondary: "#424242",
                  accent: "#00FF00",
                  error: "#940B0B",
                  info: "#0048BA",
                  success: "#086908",
                  warning: "#9B5D09"
                }
              }
            },
            directives: {
              Ripple
            }
          });
          resolve(vuetify);
        })
        .catch(message => reject(message));
    });
  }

  addressBooleans() {
    let origChatConfig = JSON.stringify(this.chatConfig);
    origChatConfig = replaceString(origChatConfig, '"true"', "true");
    origChatConfig = replaceString(origChatConfig, '"false"', "false");
    this.chatConfig = JSON.parse(origChatConfig);
  }

  getSolutionConfig() {
    return new Promise((resolve, reject) => {
      // Reload config for each load. Maybe there a new deployment change that you want to
      if (process.env.VUE_APP_LOAD_CONFIG_FOR_NEW_SESSIONS === "true") {
        localStorage.removeItem(STORAGE_KEY + "config");
        console.log("Cleared local storage");
      }
      this.chatConfig = JSON.parse(localStorage.getItem(STORAGE_KEY + "config"));
      if (!this.chatConfig || (this.chatConfig && this.chatConfig.solutions.length === 0)) {
        console.log("No config: Looking for default.json");
        this._loadDefaultConfig()
          .then(defaultConfig => {
            this.chatConfig = defaultConfig;
            resolve(this.chatConfig);
          })
          .catch(message => reject(message));
      } else {
        resolve(this.chatConfig);
      }
    });
  }

  _loadDefaultConfig() {
    return new Promise((resolve, reject) => {
      if (!process.env.VUE_APP_GET_STATIC_DEFAULT_CONFIG) {
        console.log("Loaded internal config");
        resolve(internalConfig);
      } else {
        // look for default config on the server
        const defaultConfigUrl = `${location.protocol}//${location.host}${location.pathname}/../static/default.json`;
        superagent
          .get(defaultConfigUrl)
          .accept("application/json")
          .then(res => {
            console.log("Found and loaded external default config");
            let defaultConfig = res.body;
            localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(defaultConfig));
            resolve(defaultConfig);
          })
          .catch(function(error) {
            reject("Could not load default.json: " + error.message);
          });
      }
    });
  }

  setupLiveChat(store) {
    this.liveChat = new LiveChat(store, !this.USE_SESSION_STORAGE, STORAGE_KEY, this.TENEO_CHAT_HISTORY);
  }

  getMergedAsrCorrections(leopardDefaultCorrections) {
    let finalCorrections = leopardDefaultCorrections;
    if ("asrCorrections" in this.activeSolution) {
      let solutionResplacements = [];
      let lines = this.activeSolution.asrCorrections.split(/\r?\n/);
      lines.forEach(replacement => {
        if (replacement.trim() !== "") {
          let thisThatArray = replacement.split(/\|/);
          if (thisThatArray.length === 2) {
            thisThatArray[0] = thisThatArray[0].trim();
            thisThatArray[1] = thisThatArray[1].trim();
            solutionResplacements.push(thisThatArray);
          }
        }
      });
      finalCorrections = leopardDefaultCorrections.concat(solutionResplacements);
    }
    return finalCorrections;
  }

  getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      vars[key] = value;
    });
    return vars;
  }

  getUrlParam(parameter, defaultvalue) {
    let urlparameter = "";
    if (window.location.href.indexOf(parameter) > -1) {
      urlparameter = this.getUrlVars()[parameter];
      if (urlparameter) {
        urlparameter = urlparameter.split("#")[0];
        urlparameter = urlparameter === "true" ? true : urlparameter === "false" ? false : urlparameter;
      } else {
        urlparameter = defaultvalue;
      }
    } else {
      urlparameter = defaultvalue;
    }
    return urlparameter;
  }

  getLocator() {
    const LOCATION_OPTIONS = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };
    let locator = new PromisedLocation(LOCATION_OPTIONS);
    return locator;
  }

  // get markDownConvertor() {
  //   return this.converter;
  // }

  isPusherEnabled() {
    // return process.env.VUE_APP_FIREBASE_API_KEY ? true : false;
    return false;
  }

  addIframeHtml() {
    let iframeHtml = this.getFunctionHTMLTemplate(function() {
      /*!
      <iframe id="site-frame" src="" frameborder="0"></iframe>
      */
    });
    document.body.innerHTML += iframeHtml;
  }

  getFunctionHTMLTemplate(f) {
    return f
      .toString()
      .replace(/^[^/]+\/\*!?/, "")
      .replace(/\*\/[^/]+$/, "");
  }

  doesParameterExist(name) {
    var queryString = location.search;
    var params = queryString.substring(1).split("&");
    for (var i = 0; i < params.length; i++) {
      var pair = params[i].split("=");
      if (decodeURIComponent(pair[0]) == name) return true;
    }
    return false;
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  setupPusher() {
    // if (this.isPusherEnabled()) {
    //   Vue.use(require("vue-pusher"), {
    //     api_key: process.env.VUE_APP_PUSHER_KEY,
    //     options: {
    //       cluster: "us2",
    //       encrypted: true,
    //       forceTLS: true
    //     }
    //   });
    // }
  }
}
