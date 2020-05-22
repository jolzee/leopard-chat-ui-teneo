const fs = require("fs");
const { getEnvValue } = require("./environmentVariables");
const config = require("mikro-config").default;
let rawData = fs.readFileSync(`${config.get("solution.location.sourceFile")}`);
let solutionConfig = JSON.parse(rawData);

let leopardConfig = {
  isLocalDev: getEnvValue("LOCAL", false),
  isDev: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV ? process.env.NODE_ENV === "production" : false,
  embed: {
    isInitialStateOpen: config.get("productionEmbed.initialStateOpen", false),
    showCloseButton: config.get("productionEmbed.showCloseButton", true),
    killSessionOnCloseEmbed: config.get("productionEmbed.killSessionWhenClosed", false)
  },
  solutionConfig: {
    buildConfig: solutionConfig
  },
  mustSendLocationAtLogin: config.get("location.login.sendAtLogin", true),
  ipUrl: config.get("location.login.serviceUrls.ip"),
  geoUrl: config.get("location.login.serviceUrls.geo"),
  hideConfigMenu: config.get("ui.hideConfigMenu", true),
  hideArtificialSolutionsBranding: config.get("ui.hideTeneoBranding", false),
  loadFreshConfigForNewSessions: !config.get("demoMode", false),
  mustGetStaticDefaultConfig: getEnvValue("LOCAL", false)
    ? false
    : config.get("solution.location.placeInStaticFolder", false),
  requestParams: "",
  liveChat: {
    licenseKey: config.get("liveChatInc.key"),
    agentAssistServerUrl: config.get("liveChatInc.agentAssist.serverUrl")
  },
  kuttItKey: config.get("ui.configArea.shareLink.kuttItApiKey"),
  pusherKey: "",
  locationIqKey: config.get("location.locationIq.key"),
  firebase: {
    authProviders: config.get("socialAuthentication.firebase.providers"),
    apiKey: config.get("socialAuthentication.firebase.apiKey"),
    authDomain: config.get("socialAuthentication.firebase.authDomain"),
    databaseUrl: config.get("socialAuthentication.firebase.databaseUrl"),
    projectId: config.get("socialAuthentication.firebase.projectId"),
    storageBucket: config.get("socialAuthentication.firebase.storageBucket"),
    messagingSenderId: config.get("socialAuthentication.firebase.messagingSenderId")
  },
  auth: {
    microsoft: {
      tenant: config.get("socialAuthentication.firebase.microsoft.tenant"),
      domainHint: config.get("socialAuthentication.firebase.microsoft.domainHint")
    }
  },
  logging: {
    sentryDsn: config.get("logging.sentry.key"),
    logRocket: config.get("logging.logRocket.key")
  },
  build: {
    compressJavascript: config.get("assets.compressJavascript", false),
    compressCss: config.get("assets.compressCss", true)
  }
};

exports.config = config;
exports.leopardConfig = leopardConfig;
