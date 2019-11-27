module.exports = {
  presets: [["@vue/app", { useBuiltIns: "entry" }]],
  sourceType: "unambiguous",
  plugins: ["@babel/transform-runtime", "@babel/plugin-syntax-dynamic-import"]
};
