export const SOLUTION_DEFAULT = {
  asrCorrections: `
replacethis | with that
replacethat | with this
okkay | ok
`,
  chatTitle: "Teneo Chat Client",
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
  enableLiveChat: "false",
  float: "false",
  iframeUrl: "",
  knowledgeData: ["What's your name?", "Who created you?"],
  locale: "en",
  name: "",
  responseIcon: "fa-robot",
  sendContextParams: "login",
  theme: {
    accent: "#4CAF50",
    error: "#FF5252",
    info: "#2196F3",
    primary: "#D60270",
    secondary: "#5B017B",
    success: "#4CAF50",
    warning: "#FFC107"
  },
  url: "",
  useLocalStorage: "false",
  userIcon: "fa-comment-alt"
};

export const STORAGE_KEY = window.location.hostname + window.location.pathname + ":";
