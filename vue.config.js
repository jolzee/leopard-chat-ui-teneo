const path = require("path");
module.exports = {
  chainWebpack: config => {
    config.module
      .rule("eslint")
      .use("eslint-loader")
      .tap(options => {
        options.configFile = path.resolve(__dirname, ".eslintrc.js");
        return options;
      });
  },
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  assetsDir: "./assets/",
  productionSourceMap: true,
  transpileDependencies: ['vuetify', "replace-string", "url-regex", "string-strip-html", "vue-long-press-directive"]
};
