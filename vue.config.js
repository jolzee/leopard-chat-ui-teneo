module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  assetsDir: "./assets/",
  productionSourceMap: true,
  transpileDependencies: ["replace-string", "url-regex", "string-strip-html", "vue-long-press-directive"]
};
