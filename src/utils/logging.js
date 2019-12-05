var utils = require("@/utils/utils");
var logger = require("consola");
console.log(utils);
logger.level =
  process.env.NODE_ENV === "production" &&
  utils.doesParameterExist("leopardDebug")
    ? 5
    : 0;

const getLogger = tagName => logger.withTag(tagName);

module.exports = {
  getLogger
};
