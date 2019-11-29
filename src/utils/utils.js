const doesParameterExist = name => {
  var queryString = location.search;
  var params = queryString.substring(1).split("&");
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split("=");
    if (decodeURIComponent(pair[0]) == name) return true;
  }
  return false;
};

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

module.exports = {
  doesParameterExist,
  getParameterByName
};
