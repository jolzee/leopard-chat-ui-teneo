const path = require("path");
var BrotliGzipPlugin = require("brotli-gzip-webpack-plugin");
module.exports = {
  configureWebpack: {
    plugins: [
      new BrotliGzipPlugin({
        asset: "[path].br[query]",
        algorithm: "brotli",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      }),
      new BrotliGzipPlugin({
        asset: "[path].gz[query]",
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ]
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: false
    }
  },
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
  productionSourceMap: false,
  transpileDependencies: ["vuetify", "replace-string", "url-regex", "vue-long-press-directive"]
};
