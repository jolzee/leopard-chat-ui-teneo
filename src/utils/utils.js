/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */

const replaceString = require("replace-string");
const solutionDefault = require("../constants/solution-config-default")
  .SOLUTION_DEFAULT;

const fixSolution = solution => {
  if (!("id" in solution)) {
    const id = uuid();
    // TODO: I know I need to fix this...
    // if (solution.name === allSolutions.activeSolution) {
    //   allSolutions.activeSolution = id;
    // }
    solution.id = id;
  }
  if (!("font" in solution)) {
    solution.font = solutionDefault.font;
  }
  if (!("lookAndFeel" in solution)) {
    solution.lookAndFeel = solutionDefault.lookAndFeel;
  }

  if (!("custom1" in solution.theme)) {
    solution.theme.dark = solutionDefault.theme.dark;
    solution.theme.custom1 = solutionDefault.theme.custom1;
    solution.theme.custom2 = solutionDefault.theme.custom2;
    solution.theme.custom3 = solutionDefault.theme.custom3;
  }

  if (!("animations" in solution)) {
    solution.animations = solutionDefault.animations;
  }
  if (!("promptTriggers" in solution)) {
    solution.promptTriggers = solutionDefault.promptTriggers;
  }
  return solution;
};

const fixSolutions = allSolutions => {
  let origChatConfig = JSON.stringify(allSolutions);
  origChatConfig = replaceString(origChatConfig, '"true"', "true");
  origChatConfig = replaceString(origChatConfig, '"false"', "false");
  allSolutions = JSON.parse(origChatConfig);

  allSolutions.solutions.forEach(solution => {
    solution = fixSolution(solution);
  });

  return allSolutions;
};

const lowerCase = str => {
  return str.toLowerCase();
};

/**
 * "Safer" String.toUpperCase()
 */
const upperCase = str => {
  return str.toUpperCase();
};

/**
 * Convert string to camelCase text.
 */
const camelCase = str => {
  str = replaceAccents(str);
  str = removeNonWord(str)
    .replace(/\-/g, " ") //convert all hyphens to spaces
    .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
    .replace(/\s+/g, "") //remove spaces
    .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
  return str;
};

/**
 * Add space between camelCase text.
 */
const unCamelCase = str => {
  str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2");
  str = str.toLowerCase(); //add space between camelCase text
  return str;
};

/**
 * UPPERCASE first char of each word.
 */
const properCase = str => {
  return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
};

/**
 * camelCase + UPPERCASE first char
 */
const pascalCase = str => {
  return camelCase(str).replace(/^[a-z]/, upperCase);
};

/**
 * UPPERCASE first char of each sentence and lowercase other chars.
 */
const sentenceCase = str => {
  // Replace first char of each sentence (new line or after '.\s+') to
  // UPPERCASE
  return lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, upperCase);
};

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
const slugify = (str, delimeter) => {
  if (delimeter == null) {
    delimeter = "-";
  }

  str = replaceAccents(str);
  str = removeNonWord(str);
  str = trim(str) //should come after removeNonWord
    .replace(/ +/g, delimeter) //replace spaces with delimeter
    .toLowerCase();

  return str;
};

/**
 * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
 */
const hyphenate = str => {
  str = unCamelCase(str);
  return slugify(str, "-");
};

/**
 * Replaces hyphens with spaces. (only hyphens between word chars)
 */
const unhyphenate = str => {
  return str.replace(/(\w)(-)(\w)/g, "$1 $3");
};

/**
 * Replaces spaces with underscores, split camelCase text, remove
 * non-word chars, remove accents and convert to lower case.
 */
const underscore = str => {
  str = unCamelCase(str);
  return slugify(str, "_");
};

/**
 * Remove non-word chars.
 */
const removeNonWord = str => {
  return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, "");
};

/**
 * Convert line-breaks from DOS/MAC to a single standard (UNIX by default)
 */
const normalizeLineBreaks = (str, lineEnd) => {
  lineEnd = lineEnd || "\n";

  return str
    .replace(/\r\n/g, lineEnd) // DOS
    .replace(/\r/g, lineEnd) // Mac
    .replace(/\n/g, lineEnd); // Unix
};

/**
 * Replaces all accented chars with regular ones
 */
const replaceAccents = str => {
  // verifies if the String has accents and replace them
  if (str.search(/[\xC0-\xFF]/g) > -1) {
    str = str
      .replace(/[\xC0-\xC5]/g, "A")
      .replace(/[\xC6]/g, "AE")
      .replace(/[\xC7]/g, "C")
      .replace(/[\xC8-\xCB]/g, "E")
      .replace(/[\xCC-\xCF]/g, "I")
      .replace(/[\xD0]/g, "D")
      .replace(/[\xD1]/g, "N")
      .replace(/[\xD2-\xD6\xD8]/g, "O")
      .replace(/[\xD9-\xDC]/g, "U")
      .replace(/[\xDD]/g, "Y")
      .replace(/[\xDE]/g, "P")
      .replace(/[\xE0-\xE5]/g, "a")
      .replace(/[\xE6]/g, "ae")
      .replace(/[\xE7]/g, "c")
      .replace(/[\xE8-\xEB]/g, "e")
      .replace(/[\xEC-\xEF]/g, "i")
      .replace(/[\xF1]/g, "n")
      .replace(/[\xF2-\xF6\xF8]/g, "o")
      .replace(/[\xF9-\xFC]/g, "u")
      .replace(/[\xFE]/g, "p")
      .replace(/[\xFD\xFF]/g, "y");
  }

  return str;
};

/**
 * Searches for a given substring
 */
const contains = (str, substring, fromIndex) => {
  return str.indexOf(substring, fromIndex) !== -1;
};

/**
 * Truncate string at full words.
 */
const crop = (str, maxChars, append) => {
  return truncate(str, maxChars, append, true);
};

/**
 * Escape RegExp string chars.
 */
const escapeRegExp = str => {
  var ESCAPE_CHARS = /[\\.+*?\^$\[\](){}\/'#]/g;
  return str.replace(ESCAPE_CHARS, "\\$&");
};

/**
 * Escapes a string for insertion into HTML.
 */
const escapeHtml = str => {
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;");

  return str;
};

/**
 * Unescapes HTML special chars
 */
const unescapeHtml = str => {
  str = str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
  return str;
};

/**
 * Escape string into unicode sequences
 */
const escapeUnicode = (str, shouldEscapePrintable) => {
  return str.replace(/[\s\S]/g, function(ch) {
    // skip printable ASCII chars if we should not escape them
    if (!shouldEscapePrintable && /[\x20-\x7E]/.test(ch)) {
      return ch;
    }
    // we use "000" and slice(-4) for brevity, need to pad zeros,
    // unicode escape always have 4 chars after "\u"
    return "\\u" + ("000" + ch.charCodeAt(0).toString(16)).slice(-4);
  });
};

/**
 * Remove HTML tags from string.
 */
const stripHtmlTags = str => {
  return str.replace(/<[^>]*>/g, "");
};

/**
 * Remove non-printable ASCII chars
 */
const removeNonASCII = str => {
  // Matches non-printable ASCII chars -
  // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
  return str.replace(/[^\x20-\x7E]/g, "");
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
const rpad = (str, minLen, ch) => {
  ch = ch || " ";
  return str.length < minLen ? str + repeat(ch, minLen - str.length) : str;
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
const lpad = (str, minLen, ch) => {
  ch = ch || " ";

  return str.length < minLen ? repeat(ch, minLen - str.length) + str : str;
};

/**
 * Repeat string n times
 */
const repeat = (str, n) => {
  return new Array(n + 1).join(str);
};

/**
 * Limit number of chars.
 */
const truncate = (str, maxChars, append, onlyFullWords) => {
  append = append || "...";
  maxChars = onlyFullWords ? maxChars + 1 : maxChars;

  str = trim(str);
  if (str.length <= maxChars) {
    return str;
  }
  str = str.substr(0, maxChars - append.length);
  //crop at last space or remove trailing whitespace
  str = onlyFullWords ? str.substr(0, str.lastIndexOf(" ")) : trim(str);
  return str + append;
};

var WHITE_SPACES = [
  " ",
  "\n",
  "\r",
  "\t",
  "\f",
  "\v",
  "\u00A0",
  "\u1680",
  "\u180E",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200A",
  "\u2028",
  "\u2029",
  "\u202F",
  "\u205F",
  "\u3000"
];

/**
 * Remove chars from beginning of string.
 */
const ltrim = (str, chars) => {
  chars = chars || WHITE_SPACES;

  var start = 0,
    len = str.length,
    charLen = chars.length,
    found = true,
    i,
    c;

  while (found && start < len) {
    found = false;
    i = -1;
    c = str.charAt(start);

    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        start++;
        break;
      }
    }
  }

  return start >= len ? "" : str.substr(start, len);
};

/**
 * Remove chars from end of string.
 */
const rtrim = (str, chars) => {
  chars = chars || WHITE_SPACES;

  var end = str.length - 1,
    charLen = chars.length,
    found = true,
    i,
    c;

  while (found && end >= 0) {
    found = false;
    i = -1;
    c = str.charAt(end);

    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        end--;
        break;
      }
    }
  }

  return end >= 0 ? str.substring(0, end + 1) : "";
};

/**
 * Remove white-spaces from beginning and end of string.
 */
const trim = (str, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(str, chars), chars);
};

/**
 * Capture all capital letters following a word boundary (in case the
 * input is in all caps)
 */
const abbreviate = str => {
  return str.match(/\b([A-Z])/g).join("");
};

const includeFile = file => {
  var script = document.createElement("script");
  script.src = file;
  script.type = "text/javascript";
  script.defer = true;
  document.head.appendChild(script);
};

var isUndefined = e => typeof e === "undefined",
  isconst = e => typeof e === "function",
  isNumber = e => typeof e === "number" && isFinite(e),
  isObject = e => typeof e === "object",
  isArray = e => Array.isArray(e),
  isImage = e => e instanceof HTMLImageElement,
  isNull = e => e === null,
  isInt = e => Number(e) === e && e % 1 === 0,
  isFloat = e => Number(e) === e && e % 1 !== 0;

const createSlug = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const loadScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.onload = resolve;
    script.onerror = reject;

    script.src = src;
    document.body.appendChild(script);
  });
};

// ES6, native Promises, arrow functions, default arguments
// wait(1000).then(() => {
//   console.log("b");
// });
const wait = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms));
};

const queryParametersAsObject = () => {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
};

const setFullscreen = fullscreen => {
  let el = document.documentElement;
  if (fullscreen) {
    let rfs =
      el.requestFullscreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    rfs.call(el);
  } else {
    let rfs =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozExitFullscreen ||
      document.msExitFullscreen;
    rfs.call(document);
  }
};

const doesParameterExist = paramName => {
  var queryString = location.search;
  var params = queryString.substring(1).split("&");
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split("=");
    if (decodeURIComponent(pair[0]) == paramName) return true;
  }
  return false;
};

const download = (data, filename, type = "text/plain") => {
  var file = new Blob([data], {
    type: type
  });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
};

const getBase64Image = img => {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

const generateRandomId = () => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(2, 10);
};

const cloneObject = obj => {
  // this is a deep clone
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
};

const cloneObjectPromise = obj => {
  return new Promise((resolve, reject) => {
    // this is a deep clone
    try {
      let clonedObject = obj ? JSON.parse(JSON.stringify(obj)) : obj;
      resolve(clonedObject);
    } catch (e) {
      reject(r);
    }
  });
};

const uuidv4 = require("uuid/v4");
const uuid = () => uuidv4();

const uuidPromise = () => {
  return new Promise(resolve => resolve(uuidv4()));
};

const decodeHTML = html => {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const generateQueryParams = jsObject =>
  Object.keys(jsObject)
    .map(key => key + "=" + jsObject[key])
    .join("&");

const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const getUrlVarsAsObj = () => {
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
};

const getUrlParam = (parameter, defaultvalue) => {
  let urlparameter = "";
  if (window.location.href.indexOf(parameter) > -1) {
    urlparameter = this.getUrlVars()[parameter];
    if (urlparameter) {
      urlparameter = urlparameter.split("#")[0];
      urlparameter =
        urlparameter === "true"
          ? true
          : urlparameter === "false"
          ? false
          : urlparameter;
    } else {
      urlparameter = defaultvalue;
    }
  } else {
    urlparameter = defaultvalue;
  }
  return urlparameter;
};

const utils = {
  fixSolutions,
  fixSolution,
  createSlug,
  download,
  generateRandomId,
  doesParameterExist,
  queryParametersAsObject,
  getUrlVarsAsObj,
  getParameterByName,
  getUrlParam,
  generateQueryParams,
  uuid,
  uuidPromise,
  decodeHTML,
  cloneObject,
  cloneObjectPromise,
  getBase64Image,
  wait
};

module.exports = utils;
