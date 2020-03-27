const path = require("path");
const fs = require("fs");
const CompressionPlugin = require("compression-webpack-plugin");
const BrotliPlugin = require("brotli-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const WebpackDeletePlugin = require("webpack-delete-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// devtool: isLocalDev ? "source-map" : produceSourceMaps ? "source-map" : "",

const environmentVariables = process.env;
const getEnvValue = (name, fallback = "") => {
  let result = fallback;
  if (name in environmentVariables && environmentVariables[name] !== "") {
    result = environmentVariables[name];
    if (result === "true") {
      result = true;
    } else if (result === "false") {
      result = false;
    }
  }
  return result;
};

const isDev = process.env.NODE_ENV === "development";
const isLocalDev = getEnvValue("LOCAL", false);

let produceSourceMaps = false;

if (!isLocalDev && process.env.VUE_APP_SOURCE_MAP === "true") {
  produceSourceMaps = true;
} else {
  produceSourceMaps = false;
}

const enableCssCompression = getEnvValue("VUE_APP_BUILD_COMPRESS_CSS_ASSETS", true);
const enableJavaScriptCompression = getEnvValue("VUE_APP_BUILD_COMPRESS_JAVASCRIPT_ASSETS", true);

console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
if (isLocalDev) {
  console.log(`Local Development - npm run serve: ${isLocalDev}`);
}
console.log(`Produce Source Maps: ${produceSourceMaps}`);
console.log(`Enable CSS Compression: ${enableCssCompression}`);
console.log(`Enable JavaScript Compression: ${enableJavaScriptCompression}`);

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

const useStaticSolutionConfig = getEnvValue("VUE_APP_GET_STATIC_DEFAULT_CONFIG", false);

if (!useStaticSolutionConfig) {
  console.log(
    `Solutions Config ${process.env.VUE_APP_SOLUTION_CONFIG_FILE} being ported to /dist/assets/js/leopardConfig.*.js`
  );
}
const solutionConfigFile = getEnvValue("VUE_APP_SOLUTION_CONFIG_FILE", "./env.solution.json");

let rawdata = fs.readFileSync(`${process.env.VUE_APP_SOLUTION_CONFIG_FILE}`);
let solutionConfig = JSON.parse(rawdata);
// if (useStaticSolutionConfig) {
//   const vueVariables = {};
//   for (let [key, value] of Object.entries(environmentVariables)) {
//     if (key.startsWith("VUE_APP")) {
//       vueVariables[key] = value;
//     }
//   }
//   solutionConfig.env = vueVariables;
// }
// let data = JSON.stringify(solutionConfig,null, 2);
// fs.writeFileSync("config.json", data);

let buildConfig = {
  css: {
    extract: { ignoreOrder: true }
  },
  devServer: {
    https: false,
    port: 8080,
    disableHostCheck: true,
    host: "0.0.0.0",
    open: "Google Chrome",
    progress: true,
    overlay: {
      warnings: false,
      errors: false
    }
  },
  configureWebpack: {
    devtool: isLocalDev ? "eval" : produceSourceMaps ? "source-map" : "",
    plugins: []
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

if (!isLocalDev && (enableJavaScriptCompression || enableCssCompression)) {
  buildConfig.configureWebpack.plugins.push(
    new CompressionPlugin({
      test: compressionPluginTest(),
      exclude: /leopardConfig(?:\..{1,10}?)??\.js/,
      threshold: 7000
    })
  );

  buildConfig.configureWebpack.plugins.push(
    new BrotliPlugin({
      asset: "[path].br[query]",
      test: brotliPluginTest(),
      threshold: 7000,
      minRatio: 0.8
    })
  );
}

if (!isDev) {
  console.log(`Using TerserPlugin`);
  buildConfig.configureWebpack.plugins.push(
    new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: produceSourceMaps, // Must be set to true if using source-maps in production
      terserOptions: {
        output: {
          comments: false
        },
        extractComments: true,
        exclude: [
          "setup.js",
          "setup",
          "leopardConfig",
          "leopardConfig.js",
          "/leopardConfig(?:..{1,20}?)??.js/"
        ],
        mangle: true,
        compress: {
          drop_console: false,
          drop_debugger: false
        }
      }
    })
  );
}

if (!isLocalDev && !isDev) {
  buildConfig.configureWebpack.plugins.push(
    new WebpackDeletePlugin([
      "./dist/static/embed-leopard.js.gz",
      "./dist/static/embed-leopard.js.br"
    ])
  );

  const fileManagerOptions = {
    onEnd: {
      copy: []
    }
  };

  if (useStaticSolutionConfig) {
    console.log(`Copying to solution config to > dist/static/config.json`);
    fileManagerOptions.onEnd.copy.push({
      source: solutionConfigFile,
      destination: "dist/static/config.json"
    });
  }

  if (fileManagerOptions.onEnd.copy.length > 0) {
    buildConfig.configureWebpack.plugins.push(new FileManagerPlugin(fileManagerOptions));
  }

  try {
    if (fs.existsSync(`${solutionConfigFile}.token`)) {
      console.log(`Copying to solution config to > dist/static/config.json.token`);
      fileManagerOptions.onEnd.copy.push({
        source: `${solutionConfigFile}.token`,
        destination: "dist/static/config.json.token"
      });
    }
  } catch (e) {}
}

module.exports = buildConfig;
