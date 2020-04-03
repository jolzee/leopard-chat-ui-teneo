const environmentVariables = process.env;

const getEnvValue = (name, fallback = "") => {
  let result = fallback;
  if (name in environmentVariables && environmentVariables[name] !== "") {
    result = environmentVariables[name];
    if (result === "true") {
      result = true;
    } else if (result === "false") {
      result = false;
    }
  }
  return result;
};

export default {
  isProduction: getEnvValue("NODE_ENV", "production") === "production",
  killSessionOnCloseEmbed: getEnvValue("VUE_APP_EMBED_KILL_SESSION_ON_CLOSE", false),
  solutionConfig: {
    buildConfig: getEnvValue("VUE_APP_SOLUTION_CONFIG", {})
  },
  mustSendLocationAtLogin: getEnvValue("VUE_APP_SEND_LOCATION_LOGIN", true),
  hideConfigMenu: getEnvValue("VUE_APP_HIDE_CONFIG_MENU", true),
  hideArtificalSolutionsBranding: getEnvValue("VUE_APP_HIDE_AS_BRANDING", false),
  loadFreshConfigForNewSessions: getEnvValue("VUE_APP_LOAD_FRESH_CONFIG_FOR_NEW_SESSIONS", false),
  mustGetStaticDefaultConfig: getEnvValue("VUE_APP_GET_STATIC_DEFAULT_CONFIG", false),
  liveChat: {
    licenseKey: getEnvValue("VUE_APP_LIVE_CHAT_INC_KEY"),
    agentAssistServerUrl: getEnvValue("VUE_APP_LIVE_CHAT_AGENT_ASSIST_SERVER")
  },
  kuttItKey: getEnvValue("VUE_APP_KUTT_IT_API_KEY"),
  pusherKey: getEnvValue("VUE_APP_PUSHER_KEY"),
  locationIqKey: getEnvValue("VUE_APP_LOCATION_IQ_KEY"),
  firebase: {
    apiKey: getEnvValue("VUE_APP_FIREBASE_API_KEY"),
    authDomain: getEnvValue("VUE_APP_FIREBASE_AUTH_DOMAIN"),
    databaseUrl: getEnvValue("VUE_APP_FIREBASE_DATABASE_URL"),
    projectId: getEnvValue("VUE_APP_FIREBASE_PROJECT_ID"),
    storageBucket: getEnvValue("VUE_APP_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnvValue("VUE_APP_FIREBASE_MESSAGING_SENDER_ID")
  },
  auth: {
    microsoft: {
      tenant: getEnvValue("VUE_APP_AUTH_MS_TENANT"),
      domainHint: getEnvValue("VUE_APP_AUTH_MS_DOMAIN_HINT")
    }
  },
  logging: {
    sentryDsn: getEnvValue("VUE_APP_SENTRY_DSN"),
    logRocket: getEnvValue("VUE_APP_LOG_ROCKET")
  },
  build: {
    compressJavascript: getEnvValue("VUE_APP_BUILD_COMPRESS_JAVASCRIPT_ASSETS", false),
    compressCss: getEnvValue("VUE_APP_BUILD_COMPRESS_CSS_ASSETS", true)
  }
};
