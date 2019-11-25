const path = require("path");
const fs = require("fs");
const CompressionPlugin = require("compression-webpack-plugin");
var BrotliPlugin = require("brotli-webpack-plugin");

var prod = process.env.NODE_ENV === "production";
// var dev = process.env.NODE_ENV === "development";
// var qa = process.env.NODE_ENV === "qa";

console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
console.log(`Solution Config: ${process.env.VUE_APP_SOLUTION_CONFIG_FILE}`);

let rawdata = fs.readFileSync(`${process.env.VUE_APP_SOLUTION_CONFIG_FILE}`);
let solutionConfig = JSON.parse(rawdata);

module.exports = {
  devServer: {
    https: false,
    port: 8080,
    disableHostCheck: true,
    host: "0.0.0.0",
    open: "Google Chrome",
    progress: true,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "~@/sass/variables.scss"`
      }
    }
  },
  configureWebpack: {
    devtool: "source-map",
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
  chainWebpack: config => {
    config.module
      .rule("eslint")
      .use("eslint-loader")
      .tap(options => {
        options.configFile = path.resolve(__dirname, ".eslintrc.js");
        return options;
      });
    config.plugin("define").tap(definitions => {
      Object.assign(definitions[0]["process.env"], {
        VUE_APP_SOLUTION_CONFIG: JSON.stringify(solutionConfig)
      });
      return definitions;
    });
  },
  publicPath: "./",
  assetsDir: "./assets/",
  productionSourceMap: true,
  transpileDependencies: [
    "vuetify",
    "replace-string",
    "url-regex",
    "vue-long-press-directive"
  ]
};
