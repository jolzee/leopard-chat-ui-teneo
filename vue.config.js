const path = require("path");
const fs = require("fs");
const CompressionPlugin = require("compression-webpack-plugin");
var BrotliPlugin = require("brotli-webpack-plugin");
var WebpackDeletePlugin = require("webpack-delete-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// const prod = process.env.NODE_ENV === "production";
const dev = process.env.NODE_ENV === "development";
// var const = process.env.NODE_ENV === "qa";

let produceSourceMaps = false;
if (process.env.VUE_APP_SOURCE_MAP === "true" || dev) {
  produceSourceMaps = true;
} else {
  produceSourceMaps = false;
}

console.log(`produceSourceMaps: ${produceSourceMaps}`);

const enableJavaScriptCompression = process.env
  .VUE_APP_BUILD_COMPRESS_JAVASCRIPT_ASSETS
  ? process.env.VUE_APP_BUILD_COMPRESS_JAVASCRIPT_ASSETS
  : false;

const enableCssCompression = process.env.VUE_APP_BUILD_COMPRESS_CSS_ASSETS
  ? process.env.VUE_APP_BUILD_COMPRESS_CSS_ASSETS
  : true;

const compressionPluginTest = () => {
  let test = /\.css$|\.html$/;
  if (enableJavaScriptCompression && enableCssCompression) {
    test = /\.js$|\.css$|\.html$/;
  } else if (enableJavaScriptCompression) {
    test = /\.js$|\.html$/;
  }
  return test;
};

const brotliPluginTest = () => {
  let test = /\.(css|html|svg)$/;
  if (enableJavaScriptCompression && enableCssCompression) {
    test = /\.(js|css|html|svg)$/;
  } else if (enableJavaScriptCompression) {
    test = /\.(js|html|svg)$/;
  }
  return test;
};

// VUE_APP_BUILD_COMPRESS_JAVASCRIPT_ASSETS = true;
// VUE_APP_BUILD_COMPRESS_CSS_ASSETS = true;

console.log(`NODE_ENV = ${process.env.NODE_ENV}`);

const useInternalSolutionConfig =
  !process.env.VUE_APP_GET_STATIC_DEFAULT_CONFIG ||
  process.env.VUE_APP_GET_STATIC_DEFAULT_CONFIG === "false";

if (useInternalSolutionConfig) {
  console.log(`Solution Config = ${process.env.VUE_APP_SOLUTION_CONFIG_FILE}`);
} else {
  console.log(`Solution Config = /static/default.json`);
}

// const vueVariables = Object.entries(process.env).filter(k => {
//   return k[0].startsWith("VUE_APP_");
// });
// console.log(`Build Variables:`);
// vueVariables.forEach(variable => {
//   console.log(`${variable[0]}=${variable[1]}`);
// });

let rawdata = fs.readFileSync(`${process.env.VUE_APP_SOLUTION_CONFIG_FILE}`);
let solutionConfig = JSON.parse(rawdata);

let buildConfig = {
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
  configureWebpack: {
    devtool: "source-map",
    plugins:
      enableJavaScriptCompression || enableCssCompression
        ? [
            new CompressionPlugin({
              test: compressionPluginTest(),
              exclude: /leopardConfig(?:\..{1,10}?)??\.js/,
              threshold: 7000
            }),
            new BrotliPlugin({
              asset: "[path].br[query]",
              test: brotliPluginTest(),
              threshold: 7000,
              minRatio: 0.8
            })
          ]
        : []
  },
  chainWebpack: config => {
    config.externals({
      leopardConfig: "@/../public/static/config.js"
    });
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
  productionSourceMap: produceSourceMaps,
  transpileDependencies: [
    "ip-regex",
    "vuetify",
    "is-html",
    "vue-plyr",
    "replace-string",
    "url-regex",
    "vue-long-press-directive"
  ]
};

if (!dev) {
  console.log(`Using TerserPlugin`);
  buildConfig.configureWebpack.plugins.push(
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: produceSourceMaps, // Must be set to true if using source-maps in production
      terserOptions: {
        mangle: true,
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    })
  );
}

if (useInternalSolutionConfig && !dev) {
  buildConfig.configureWebpack.plugins.push(
    new WebpackDeletePlugin([
      "./dist/static/default.json",
      "./dist/static/embed-leopard.js.gz"
    ])
  );
}

module.exports = buildConfig;
