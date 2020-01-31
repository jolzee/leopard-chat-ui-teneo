/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */

const replaceString = require("replace-string");
const solutionDefault = require("../constants/solution-config-default")
  .SOLUTION_DEFAULT;
const jsonpack = require("jsonpack/main");

export const fixSolution = solution => {
  if (!("id" in solution)) {
    const id = uuid();
    // TODO: I know I need to fix this...
    // if (solution.name === allSolutions.activeSolution) {
    //   allSolutions.activeSolution = id;
    // }
    solution.id = id;
  }
  if (!("responseDelay" in solution)) {
    solution.responseDelay = 0;
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

  if (!("focusButton" in solution.theme)) {
    solution.theme.focusButton = solutionDefault.theme.focusButton;
  }

  if (!("sendButton" in solution.theme)) {
    solution.theme.sendButton = solution.theme.primary;
  }

  if (!("textButton" in solution.theme)) {
    solution.theme.textButton = solutionDefault.theme.textButton;
  }

  if (!("animations" in solution)) {
    solution.animations = solutionDefault.animations;
  }
  if (!("promptTriggers" in solution)) {
    solution.promptTriggers = solutionDefault.promptTriggers;
  }
  return solution;
};

export const fixSolutions = allSolutions => {
  let origChatConfig = JSON.stringify(allSolutions);
  origChatConfig = replaceString(origChatConfig, '"true"', "true");
  origChatConfig = replaceString(origChatConfig, '"false"', "false");
  allSolutions = JSON.parse(origChatConfig);

  if ("solutions" in allSolutions) {
    allSolutions.solutions.forEach(solution => {
      solution = fixSolution(solution);
    });
  } else if ("url" in allSolutions) {
    // not really a solutions file rather just a solution
    let solutionsWrapper = {
      activeSolution: "",
      solutions: []
    };
    let fixedSolution = fixSolution(allSolutions);
    solutionsWrapper.activeSolution = fixedSolution.id;
    solutionsWrapper.solutions.push(fixedSolution);
    allSolutions = solutionsWrapper;
  }

  return allSolutions;
};

export const sendMessageToParent = message => {
  if (parent) {
    parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specifiy origin for each post.
  }
};

export const removeAll = (targetStr, findArr) => {
  findArr.forEach(find => {
    targetStr = replaceAll(targetStr, find);
  });
  return targetStr;
};

export const replaceAll = (targetStr, findStr, replaceStr = "") => {
  return targetStr.split(findStr).join(replaceStr);
};

export const debounce = (func, wait, immediate) => {
  var timeout;
  return () => {
    const context = this,
      args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

/**
 * Smooth scroll
 */
// easing functions http://goo.gl/5HLl8
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

Math.easeInCubic = function(t, b, c, d) {
  let tc = (t /= d) * t * t;
  return b + c * tc;
};

Math.inOutQuintic = function(t, b, c, d) {
  let ts = (t /= d) * t,
    tc = ts * t;
  return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
};

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
export let requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

export const scrollTo = (to, callback, duration) => {
  // because it's so fucking difficult to detect the scrolling element, just move them all
  function move(amount) {
    document.documentElement.scrollTop = amount;
    document.body.parentNode.scrollTop = amount;
    document.body.scrollTop = amount;
  }
  function position() {
    return (
      document.documentElement.scrollTop ||
      document.body.parentNode.scrollTop ||
      document.body.scrollTop
    );
  }
  let start = position(),
    change = to - start,
    currentTime = 0,
    increment = 20;
  duration = typeof duration === "undefined" ? 500 : duration;
  let animateScroll = function() {
    // increment the time
    currentTime += increment;
    // find the value with the quadratic in-out easing function
    let val = Math.easeInOutQuad(currentTime, start, change, duration);
    // move the document.body
    move(val);
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll);
    } else {
      if (callback && typeof callback === "function") {
        // the animation is done so lets callback
        callback();
      }
    }
  };
  animateScroll();
};
// end smooth scroll

export const cleanEmptyChunks = answerText => {
  let finalAnswerText = "";
  let chunks = answerText.split("||");
  chunks.forEach(chunk => {
    let trimmedChunk = chunk.trim();
    if (trimmedChunk) {
      finalAnswerText += `||${trimmedChunk}`;
    }
  });
  if (finalAnswerText.startsWith("||")) {
    finalAnswerText = finalAnswerText.substring(2);
  }
  return finalAnswerText.trim();
};

export const lowerCase = str => {
  return str.toLowerCase();
};

/**
 * "Safer" String.toUpperCase()
 */
export const upperCase = str => {
  return str.toUpperCase();
};

/**
 * Convert string to camelCase text.
 */
export const camelCase = str => {
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
export const unCamelCase = str => {
  str = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2");
  str = str.toLowerCase(); //add space between camelCase text
  return str;
};

/**
 * UPPERCASE first char of each word.
 */
export const properCase = str => {
  return lowerCase(str).replace(/^\w|\s\w/g, upperCase);
};

/**
 * camelCase + UPPERCASE first char
 */
export const pascalCase = str => {
  return camelCase(str).replace(/^[a-z]/, upperCase);
};

/**
 * UPPERCASE first char of each sentence and lowercase other chars.
 */
export const sentenceCase = str => {
  // Replace first char of each sentence (new line or after '.\s+') to
  // UPPERCASE
  return lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, upperCase);
};

/**
 * Convert to lower case, remove accents, remove non-word chars and
 * replace spaces with the specified delimeter.
 * Does not split camelCase text.
 */
export const slugify = (str, delimeter) => {
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
export const hyphenate = str => {
  str = unCamelCase(str);
  return slugify(str, "-");
};

/**
 * Replaces hyphens with spaces. (only hyphens between word chars)
 */
export const unhyphenate = str => {
  return str.replace(/(\w)(-)(\w)/g, "$1 $3");
};

/**
 * Replaces spaces with underscores, split camelCase text, remove
 * non-word chars, remove accents and convert to lower case.
 */
export const underscore = str => {
  str = unCamelCase(str);
  return slugify(str, "_");
};

/**
 * Remove non-word chars.
 */
export const removeNonWord = str => {
  return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, "");
};

/**
 * Convert line-breaks from DOS/MAC to a single standard (UNIX by default)
 */
export const normalizeLineBreaks = (str, lineEnd) => {
  lineEnd = lineEnd || "\n";

  return str
    .replace(/\r\n/g, lineEnd) // DOS
    .replace(/\r/g, lineEnd) // Mac
    .replace(/\n/g, lineEnd); // Unix
};

/**
 * Replaces all accented chars with regular ones
 */
export const replaceAccents = str => {
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
export const contains = (str, substring, fromIndex) => {
  return str.indexOf(substring, fromIndex) !== -1;
};

/**
 * Truncate string at full words.
 */
export const crop = (str, maxChars, append) => {
  return truncate(str, maxChars, append, true);
};

/**
 * Escape RegExp string chars.
 */
export const escapeRegExp = str => {
  let ESCAPE_CHARS = /[\\.+*?\^$\[\](){}\/'#]/g;
  return str.replace(ESCAPE_CHARS, "\\$&");
};

/**
 * Escapes a string for insertion into HTML.
 */
export const escapeHtml = str => {
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
export const unescapeHtml = str => {
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
export const escapeUnicode = (str, shouldEscapePrintable) => {
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
export const stripHtmlTags = str => {
  return str.replace(/<[^>]*>/g, "");
};

export const createSharableLink = solution => {
  return `${location.protocol}//${location.host}${
    location.pathname
  }?import=${encodeURIComponent(jsonpack.pack(solution))}`;
};

/**
 * Remove non-printable ASCII chars
 */
export const removeNonASCII = str => {
  // Matches non-printable ASCII chars -
  // http://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
  return str.replace(/[^\x20-\x7E]/g, "");
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
export const rpad = (str, minLen, ch) => {
  ch = ch || " ";
  return str.length < minLen ? str + repeat(ch, minLen - str.length) : str;
};

/**
 * Pad string with `char` if its' length is smaller than `minLen`
 */
export const lpad = (str, minLen, ch) => {
  ch = ch || " ";

  return str.length < minLen ? repeat(ch, minLen - str.length) + str : str;
};

/**
 * Repeat string n times
 */
export const repeat = (str, n) => {
  return new Array(n + 1).join(str);
};

/**
 * Limit number of chars.
 */
export const truncate = (str, maxChars, append, onlyFullWords) => {
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

let WHITE_SPACES = [
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
export const ltrim = (str, chars) => {
  chars = chars || WHITE_SPACES;

  let start = 0,
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
export const rtrim = (str, chars) => {
  chars = chars || WHITE_SPACES;

  let end = str.length - 1,
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
export const trim = (str, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(str, chars), chars);
};

/**
 * Capture all capital letters following a word boundary (in case the
 * input is in all caps)
 */
export const abbreviate = str => {
  return str.match(/\b([A-Z])/g).join("");
};

export const includeFile = file => {
  let script = document.createElement("script");
  script.src = file;
  script.type = "text/javascript";
  script.defer = true;
  document.head.appendChild(script);
};

export let isUndefined = e => typeof e === "undefined",
  isconst = e => typeof e === "function",
  isNumber = e => typeof e === "number" && isFinite(e),
  isObject = e => typeof e === "object",
  isArray = e => Array.isArray(e),
  isImage = e => e instanceof HTMLImageElement,
  isNull = e => e === null,
  isInt = e => Number(e) === e && e % 1 === 0,
  isFloat = e => Number(e) === e && e % 1 !== 0;

export const createSlug = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const loadScript = src => {
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
export const wait = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms));
};

export const sleep = (ms = 0) => {
  return new Promise(r => setTimeout(r, ms));
};

export const queryParametersAsObject = () => {
  let query_string = {};
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      let arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
};

export const setFullscreen = fullscreen => {
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

export const doesParameterExist = paramName => {
  let queryString = location.search;
  let params = queryString.substring(1).split("&");
  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split("=");
    if (decodeURIComponent(pair[0]) == paramName) return true;
  }
  return false;
};

export const download = (data, filename, type = "text/plain") => {
  let file = new Blob([data], {
    type: type
  });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    let a = document.createElement("a"),
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

export const getBase64Image = img => {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  let dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

export const generateRandomId = () => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(2, 10);
};

export const cloneObject = obj => {
  // this is a deep clone
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
};

export const cloneObjectPromise = obj => {
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

export const uuidv4 = require("uuid/v4");
export const uuid = () => uuidv4();

export const uuidPromise = () => {
  return new Promise(resolve => resolve(uuidv4()));
};

export const decodeHTML = html => {
  let txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const generateQueryParams = jsObject =>
  Object.keys(jsObject)
    .map(key => key + "=" + jsObject[key])
    .join("&");

export const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

export const getUrlVarsAsObj = () => {
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
};

export const getUrlParam = (parameter, defaultvalue) => {
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
