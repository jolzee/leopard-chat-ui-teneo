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
exports.getEnvValue = getEnvValue;
