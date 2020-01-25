// var leopardUrl = "http://192.168.1.112:8080/";

var leopardUrl;

var leopardEmbedSrc = null;
var scripts = document.getElementsByTagName("script");
for (var i = 0; i < scripts.length; ++i) {
  if (isLeopard(scripts[i])) {
    leopardEmbedSrc = scripts[i].getAttribute("src");
  }
}

function isLeopard(scriptElem) {
  var srcValue = scriptElem.getAttribute("src");
  return srcValue && srcValue.indexOf("embed-leopard.js") !== -1;
}

// console.log(leopardEmbedSrc);

if (leopardEmbedSrc.lastIndexOf("http", 0) === 0) {
  leopardUrl = leopardEmbedSrc.replace("/static/embed-leopard.js", "/");
} else {
  if (leopardEmbedSrc.indexOf("/") === 0) {
    leopardUrl = leopardEmbedSrc.replace("/static/embed-leopard.js", "");
  } else {
    leopardUrl = leopardEmbedSrc.replace("static/embed-leopard.js", "");
  }
  leopardUrl = window.location.href + leopardUrl;
  leopardUrl = leopardUrl.substring(0, leopardUrl.lastIndexOf("/")) + "/";
}

// console.log(leopardUrl);

function getLeopardTemplate(f) {
  return f
    .toString()
    .replace(/^[^/]+\/\*!?/, "")
    .replace(/\*\/[^/]+$/, "");
}

var leopardChatTemplate = getLeopardTemplate(function() {
  /*!
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css">
<style>
.teneo-chat-widget {
     -webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
     -moz-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
     box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12);
     opacity: 1;
     visibility: visible;
     z-index: 9000;
     position: fixed;
     right: 30px;
     bottom: 50px;
     width: 360px;
     height: 85%;
     max-width: 100%;
     max-height: 655px;
     min-height: 260px;
     min-width: 257px;
     background-color: transparent !important;
     border: 0px;
     transition: none 0s ease 0s;
     border-radius: 13px;
     -moz-border-radius: 13px;
     -webkit-border-radius: 13px;
     height: calc(var(--vh, 1vh) * 85);
}

.teneo-transparent::-moz-selection { background: transparent !important; background-color: transparent !important;}
.teneo-transparent::selection { background: transparent !important; background-color: transparent !important; }

.teneo-chat-button-widget {
    opacity: 1;
    visibility: visible;
    z-index: 9000;
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 90px;
    height: 82px;
    background-color: transparent !important;
    border: 0px;
    transition: none 0s ease 0s !important;
}

@media only screen and (max-width: 480px) {
  .teneo-chat-widget {
     z-index: 10000;
     top: 0;
     left: 0;
     -webkit-box-shadow: none;
     -moz-box-shadow: none;
     box-shadow: none;
     width: 100%;
     max-width: 100%;
     max-height: 100%;
     border-radius: 0px;
     -moz-border-radius: 0px;
     -webkit-border-radius: 0px;
     min-height: calc(var(--vh, 1vh) * 20);
     height: calc(var(--vh, 1vh) * 100);
  }

  .teneo-chat-button-widget {
    opacity: 1;
    visibility: visible;
    z-index: 9000;
    position: fixed;
    bottom: 0px;
    right: 0px;
    width: 90px;
    height: 82px;
    background-color: transparent !important;
    border: 0px;
    transition: none 0s ease 0s !important;
  }
}
</style>

<div
  id="teneo-chat-widget-container" style="display:none;"
>
  <iframe
    src="[leopardUrl]index.html?embed[teneoCtxParams]"
    allowtransparency="true"
    allowfullscreen="allowfullscreen"
    id="teneo-chat-widget"
    name="teneochatwidget"
    title="Chatbot"
    scrolling="no"
    role="application"
    aria-label="Chat Bot"
    style="height: 100%; width: 100%; border-width: 0px; border-style: none; border-color: transparent; border-image: unset; background: transparent !important; background-color: transparent !important;"
    class="teneo-transparent"
  ></iframe>
</div>
  */
});

var leopardUrlRegex = /\[leopardUrl\]/g;
var teneoCtxParamsRegex = /\[teneoCtxParams\]/g;

leopardChatTemplate = leopardChatTemplate.replace(leopardUrlRegex, leopardUrl);
if (window.TENEOCTX) {
  leopardChatTemplate = leopardChatTemplate.replace(
    teneoCtxParamsRegex,
    "&teneoCtx=" + encodeURIComponent(JSON.stringify(window.TENEOCTX))
  );
} else {
  leopardChatTemplate = leopardChatTemplate.replace(teneoCtxParamsRegex, "");
}
var vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty("--vh", vh + "px");
document.body.insertAdjacentHTML("afterbegin", leopardChatTemplate);

var leopardAnimations = {
  in: "flipInY",
  out: "zoomOutDown"
};

var shouldShowLeopard = false;

// eslint-disable-next-line no-unused-vars
function getLeopardElementHeight() {
  var el = document.getElementById("teneo-chat-widget-container");
  var el_style = window.getComputedStyle(el, ""),
    el_display = el_style.display,
    el_position = el_style.position,
    el_visibility = el_style.visibility,
    el_max_height = el_style.maxHeight.replace("px", "").replace("%", ""),
    wanted_height = 0;

  if (el_display !== "none" && el_max_height !== "0") {
    return el.offsetHeight;
  }

  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.display = "block";

  wanted_height = el.offsetHeight;

  el.style.display = el_display;
  el.style.position = el_position;
  el.style.visibility = el_visibility;

  return wanted_height;
}

function receiveLeopardMessage(event) {
  // sendLeopardFrameHeight();
  /* if (event.origin !== "http://example.org:8080") return; */
  try {
    if (event.data === "showLeopard" && !shouldShowLeopard) {
      var leopardButtonElement = document.getElementsByClassName(
        "teneo-chat-button-widget"
      );
      if (leopardButtonElement.length > 0) {
        leopardButtonElement[0].style.display = "none";
        leopardButtonElement[0].className = "";
      }
      // console.log("👁 Leopard");
      var leopardContainer = document.getElementById(
        "teneo-chat-widget-container"
      );

      leopardContainer.className = "teneo-chat-widget";
      leopardContainer.style.display = "block";
      shouldShowLeopard = true;
      animateLeopard(leopardAnimations.in);
    } else if (event.data === "hideLeopard" && shouldShowLeopard) {
      // console.log("Hide 👁 Leopard");
      shouldShowLeopard = false;
      animateLeopard(leopardAnimations.out, function() {
        var node = document.getElementById("teneo-chat-widget-container");
        node.style.display = "none";
        if (!shouldShowLeopard) {
          setTimeout(function() {
            node = document.getElementById("teneo-chat-widget-container");
            node.className = "teneo-chat-button-widget";
            node.style.display = "block";
          }, 100);
        }
      });
    } else if (event.data === "hideLeopard" && !shouldShowLeopard) {
      var leopardContainer = document.getElementById(
        "teneo-chat-widget-container"
      );
      leopardContainer.className = "teneo-chat-button-widget";
      leopardContainer.style.display = "block";
    } else if (event.data.startsWith("runLeopardScript")) {
      var results = event.data.split("|");
      eval(results[1]);
    }
  } catch (err) {
    /* ignore as it's most likely another message from another source */
  }
}

function animateLeopard(animationName, callback) {
  var node = document.getElementById("teneo-chat-widget-container");
  node.classList.remove("animated", leopardAnimations.out);
  node.classList.remove("animated", leopardAnimations.in);

  node.classList.add("animated", animationName);

  function handleAnimationEnd() {
    node.classList.remove("animated", leopardAnimations.out);
    node.classList.remove("animated", leopardAnimations.in);
    node.removeEventListener("animationend", handleAnimationEnd);
    if (typeof callback === "function") {
      callback();
    }
  }

  node.addEventListener("animationend", handleAnimationEnd);

  var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

  if (isIE11) {
    if (node.style.display !== "none") {
      callback();
    }
  }
}

function updateLeopardHeight() {
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", vh + "px");
}

window.addEventListener("message", receiveLeopardMessage, false);
window.addEventListener("resize", updateLeopardHeight);
