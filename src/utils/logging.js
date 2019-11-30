var utils = require("./utils");
var logger = require("consola");
logger.level =
  process.env.NODE_ENV === "production" &&
  !utils.doesParameterExist("leopardDebug")
    ? 0
    : 5;

const getLogger = tagName => logger.withTag(tagName);

module.exports = {
  getLogger
};
