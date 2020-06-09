const config = {
  assets: {
    compressCss: true, // gzip and brotli compress CSS
    compressJavascript: true, // gzip and brotli compress JavaScript
    produceSourceMap: false // in production you probably want to disable
  },
  demoMode: true, // true = stores configs in local storage. In production it should be false
  /**
   * https://www.livechat.com/ integration - live chat handover
   */
  liveChatInc: {
    agentAssist: {
      /**
       * Server URL for creating agent assist canned responses -
       * https://github.com/jolzee/agent-assist-livechat-server-leopard
       */
      serverUrl: ""
    },
    key: "" // livechat.com license key
  },
  location: {
    /**
     * if you want to capture location information from the user then
     * provide a https://locationiq.com/ api key
     * https://jolzee.gitbook.io/leopard/configuration/response-options/field-types#location-information
     */
    locationIq: {
      key: ""
    },
    login: {
      /**
       * Capture and send geo location information at login.
       * Uses both https://ipapi.co/ip/ & http://www.geoplugin.net
       * This setting can be costly on first run.
       */
      sendAtLogin: false, // false = disabled, true = tries to obtain geo before greeting
      /**
       * Jaguar provides rest endpoint to proxy both the acquisition of the user's
       * IP and their geo location. This speeds up the whole process and deals with
       * any potential CORS issues.
       * https://github.com/jolzee/jaguar
       */
      serviceUrls: {
        geo: "", // https://my-jaguar.com/utils/geo
        ip: "" // https://my-jaguar.com/utils/ip
      }
    }
  },
  /**
   * Leopard can send debug information to both Log Rocket and Sentry.
   * If let absent nothing is sent.
   */
  logging: {
    logRocket: {
      key: "" // https://logrocket.com/
    },
    sentry: {
      key: "" // https://sentry.io/
    }
  },
  /**
   * Only applies when Leopard is embedded in production:
   * https://jolzee.gitbook.io/leopard/embedding
   */
  productionEmbed: {
    initialStateOpen: false, // should leopard automatically open on first load
    killSessionWhenClosed: false, // should the conversational session be closed when x is clicked
    showCloseButton: true, // allows you to hide the close button
    leopardTrustedDomains: [], // empty array = trust all domains // array of trusted domains - eg: ["https://my-domain.com", "https://my-other-domain.com"]
    enableScriptEval: false // this disabled the sending of JavaScript from Teneo Responses in production
  },
  /**
   * Social Authentication is provided through https://firebase.google.com/
   * Empty values signals no authentication
   */
  socialAuthentication: {
    firebase: {
      apiKey: "",
      authDomain: "",
      databaseUrl: "", // Firebase Realtime Database
      messagingSenderId: "",
      microsoft: {
        domainHint: "", // my-domain.com
        tenant: "" // Azure AD Tenant ID
      },
      projectId: "", // firebase project id
      providers: ["microsoft", "facebook", "google", "github"], // login and register will only show buttons for these providers
      storageBucket: ""
    }
  },
  solution: {
    location: {
      placeInStaticFolder: false, // false = loaded client side via JavaScript ; true = .env.solution.json is placed in /static/config.json
      sourceFile: ".env.solution.json" // relative path to your solution(s) config file - probably don't need to change
    }
  },
  tts: {
    url: "" // Jaguar URL if you plan to use AWS Polly instead of default Web Speech APIs TTS
  },
  ui: {
    configArea: {
      shareLink: {
        kuttItApiKey: "" // Optional - URL Shortener https://kutt.it/ can shortener shared links generated in the config area
      }
    },
    hideConfigMenu: false, // true = Set in production | false when in demo/development mode
    hideTeneoBranding: false // optionally hide Teneo Branding
  }
};

module.exports = config;
