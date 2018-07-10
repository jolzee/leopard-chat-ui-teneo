module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  },
  env: {
    browser: true
  },
  rules: {
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    semi: [2, "always"]
  },
  plugins: ["vue"], // enable vue plugin
  extends: ["plugin:vue/essential", "prettier"] // activate vue related rules
};
