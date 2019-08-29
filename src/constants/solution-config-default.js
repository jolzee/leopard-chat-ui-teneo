export const SOLUTION_DEFAULT = {
  asrCorrections: `
replacethis | with that
replacethat | with this
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
  deepLink: "",
  enableLiveChat: "true",
  float: "true",
  pulseButton: "true",
  iframeUrl: "",
  knowledgeData: ["What's your name?", "Who created you?"],
  locale: "en-us-female",
  longResponsesInModal: "false",
  name: "",
  responseIcon: "mdi-comment-account",
  sendContextParams: "login",
  showChatIcons: "true",
  theme: {
    accent: "#4CAF50",
    error: "#FF5252",
    info: "#2196F3",
    primary: "#0062B1",
    secondary: "#5B017B",
    success: "#4CAF50",
    warning: "#FFC107"
  },
  displayAccent: "true",
  url: "",
  useLocalStorage: "false",
  userIcon: "mdi-message-text"
};

export const STORAGE_KEY = window.location.hostname + window.location.pathname + ":";
