const path = require("path");
// const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
var BrotliPlugin = require("brotli-webpack-plugin");

module.exports = {
  configureWebpack: {
    // optimization: {
    //   minimize: true,
    //   minimizer: [new TerserPlugin()]
    // },
    plugins:
      process.env.NODE_ENV === "production"
        ? [
            new CompressionPlugin({
              test: /\.js$|\.css$|\.html$/,
              threshold: 8192
            }),
            new BrotliPlugin({
              asset: "[path].br[query]",
              test: /\.(js|css|html|svg)$/,
              threshold: 10240,
              minRatio: 0.8
            })
          ]
        : []
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
