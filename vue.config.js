const path = require("path");
// const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
var BrotliPlugin = require("brotli-webpack-plugin");

var prod = process.env.NODE_ENV === "production";

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/sass/variables.scss"`
      }
    }
  },
  configureWebpack: {
    // optimization: {
    //   minimize: true,
    //   minimizer: [new TerserPlugin({
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //   },
    // },
    // })]
    // },
    plugins: prod
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
  publicPath: prod ? "./" : "/",
  assetsDir: "./assets/",
  productionSourceMap: false,
  transpileDependencies: ["vuetify", "replace-string", "url-regex", "vue-long-press-directive"]
};
