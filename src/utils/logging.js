import utils from "./utils";
const logger = require("consola");
logger.level = process.env.NODE_ENV === "production" && !utils.doesParameterExist("leopardDebug") ? 0 : 5;

module.exports = function(tagName) {
  return logger.withTag(tagName);
};
