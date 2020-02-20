module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    expect: true
  },
  extends: ["plugin:vue/essential", "prettier", "prettier/vue"],
  rules: {
    "import/no-unresolved": "off",
    "no-cond-assign": "off",
    "no-param-reassign": "off",
    "no-eval": "off",
    "no-nested-ternary": "off",
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "logger"
      }
    ],
    "prefer-destructuring": "off",
    "vue/no-v-html": "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
