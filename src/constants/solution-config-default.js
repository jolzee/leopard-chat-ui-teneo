export const SOLUTION_DEFAULT = {
  asrCorrections: `
replacethis | with that
replace that | with this
okkay | ok
`,
  chatTitle: "Teneo Chat Client",
  customCssButtonToolbar: "",
  contextParams: [
    {
      name: "channel",
      values: [
        {
          active: true,
          text: "webview"
        }
      ]
    }
  ],
  animations: {
    in: "slideInUp",
    out: "flipOutY"
  },
  deepLink: "",
  responseDelay: 0,
  enableLiveChat: false,
  float: true,
  font: "leopard-font-normal",
  pulseButton: true,
  promptTriggers: {
    enabled: false,
    pollSeconds: "10"
  },
  iframeUrl: "",
  knowledgeData: ["What's your name?", "Who created you?"],
  locale: "en-uk-female",
  longResponsesInModal: false,
  name: "",
  responseIcon: "mdi-message-reply-text",
  sendContextParams: "login",
  showChatIcons: true,
  lookAndFeel: {
    response: {
      iconColor: "secondary",
      blockBgColor: "white",
      blockTextColor: "dark"
    },
    question: {
      iconColor: "primary",
      blockBgColor: "white",
      blockTextColor: "dark"
    }
  },
  theme: {
    accent: "#4CAF50",
    error: "#FF5252",
    info: "#2196F3",
    primary: "#0062B1",
    secondary: "#5B017B",
    success: "#4CAF50",
    warning: "#FFC107",
    dark: "#0062B1",
    focusButton: "#C8C4C4",
    sendButton: "#0062B1",
    textButton: "#000000",
    custom1: "#0062B1",
    custom2: "#0062B1",
    custom3: "#0062B1"
  },
  displayAccent: true,
  url: "",
  useLocalStorage: false,
  userIcon: "mdi-comment-quote-outline",
  useInProduction: false
};

export const STORAGE_KEY = window.location.hostname + window.location.pathname + ":";
