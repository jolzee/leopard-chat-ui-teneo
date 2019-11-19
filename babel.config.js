module.exports = {
  presets: [["@vue/app", { useBuiltIns: "entry" }]],
  plugins: [
    "@babel/transform-runtime",
    "@babel/syntax-dynamic-import",
    [
      "@babel/plugin-transform-modules-commonjs",
      {
        strictMode: false
      }
    ]
  ]
};
