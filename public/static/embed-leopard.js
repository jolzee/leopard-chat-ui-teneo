var leopardUrl = "http://192.168.1.112:8080/";

function getLeopardTemplate(f) {
  return f
    .toString()
    .replace(/^[^/]+\/\*!?/, "")
    .replace(/\*\/[^/]+$/, "");
}

var leopardButtonTemplate = getLeopardTemplate(function() {
  /*!
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.min.css">
<style>
#teneo-chat-widget-container {
  -webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); opacity: 1; visibility: visible; z-index: 2147483639; position: fixed; bottom:100px; right: 3%; margin-top: auto; margin-bottom: auto; width: 360px; height: calc(100vh - 130px); max-width: 100%; max-height: calc(100% - 130px); min-height: 0px; min-width: 0px; background-color: transparent; border: 0px; transition: none 0s ease 0s !important; border-radius: 13px; -moz-border-radius: 13px; -webkit-border-radius: 13px; min-height: calc(var(--vh, 1vh) * 100 - 130px);
}

.teneo-transparent::-moz-selection { background: transparent !important; }
.teneo-transparent::selection { background: transparent !important; }

#teneo-chat-button-container {
    opacity: 1;
    visibility: visible;
    z-index: 2147483640;
    position: fixed;
    bottom: 17px;
    right: 3%;
    margin-right: -16px;
    width: 90px;
    height: 82px;
    background-color: transparent;
    border: 0px;
    transition: none 0s ease 0s !important;
}

@media only screen and (max-width: 480px) {
  #teneo-chat-widget-container {
    top: 100px; -webkit-box-shadow: unset; box-shadow: unset; width: 100vw; height: 100vh; max-width: 100%; max-height: 100vh; right: 0; border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; min-height: calc(var(--vh, 1vh) * 100); height: calc(var(--vh, 1vh) * 100);
  }

  #teneo-chat-widget-container-mobile {
    min-height: calc(var(--vh, 1vh) * 100) !important; height: calc(var(--vh, 1vh) * 100) !important;
  }


  #teneo-chat-button-container {
     display: none;
  }
}
</style>
<div
  id="teneo-chat-button-container"
>
  <iframe
    src="[leopardUrl]?button"
    allowtransparency="true"
    id="teneo-chat-button"
    name="teneochatbuttonwidget"
    scrolling="no"
    role="application"
    aria-label="Teneo chat widget button"
    style="height: 100%; width: 100%; border-width: 0px; border-style: none; border-image: unset;"
    class="teneo-transparent"
  ></iframe>
</div>
*/
});

var leopardChatTemplate = getLeopardTemplate(function() {
  /*!
<div
  id="teneo-chat-widget-container" style="display:none;"
>
  <iframe
    src="[leopardUrl]?embed[teneoCtxParams]"
    allowtransparency="true"
    id="teneo-chat-widget"
    name="teneochatwidget"
    scrolling="no"
    role="application"
    aria-label="Teneo chat widget"
    style="height: 100%; width: 100%; border-width: 0px; border-style: none; border-color: transparent; border-image: unset;"
    class="teneo-transparent"
  ></iframe>
</div>
  */
});

var leopardUrlRegex = /\[leopardUrl\]/g;
var teneoCtxParamsRegex = /\[teneoCtxParams\]/g;

leopardButtonTemplate = leopardButtonTemplate.replace(leopardUrlRegex, leopardUrl);
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
document.documentElement.style.setProperty("--vh", `${vh}px`);
document.body.innerHTML += leopardButtonTemplate + leopardChatTemplate;

var leopardAnimations = {
  in: "flipInY",
  out: "zoomOutDown"
};

var shouldShowLeopard = false;
// var leopardFrameHeight = null;

// function sendLeopardFrameHeight() {
//   var newFrameHeight = getElementHeight(document.getElementById("teneo-chat-widget-container"));
//   if (newFrameHeight !== leopardFrameHeight) {
//     leopardFrameHeight = newFrameHeight;
//     var teneoFrameWindow = window.frames.teneochatbuttonwidget;
//     if (teneoFrameWindow) {
//       var info = {
//         frameHeight: newFrameHeight
//       };
//       teneoFrameWindow.postMessage(JSON.stringify(info), "*");
//       console.log("Sent height from Embed to Leopard: " + JSON.stringify(info));
//     }
//   }
// }

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
      console.log("👁 Leopard");
      shouldShowLeopard = true;
      animateLeopard(leopardAnimations.in);

      setTimeout(function() {
        if (shouldShowLeopard) {
          var node = document.querySelector("#teneo-chat-widget-container");
          node.style.display = "block";
        }
      }, 500);
    } else if (event.data === "hideLeopard" && shouldShowLeopard) {
      console.log("Hide 👁 Leopard");
      shouldShowLeopard = false;
      animateLeopard(leopardAnimations.out, function() {
        if (!shouldShowLeopard) {
          var node = document.querySelector("#teneo-chat-widget-container");
          node.style.display = "none";
        }
      });
    } else if (event.data.startsWith("runLeopardScript")) {
      var results = event.data.split("|");
      eval(results[1]);
    }
  } catch (err) {
    /* ignore as it's most likely another message from another source */
  }
}

function animateLeopard(animationName, callback) {
  const node = document.querySelector("#teneo-chat-widget-container");
  node.classList.remove("animated", leopardAnimations.out);
  node.classList.remove("animated", leopardAnimations.in);

  node.classList.add("animated", animationName);

  function handleAnimationEnd() {
    node.classList.remove("animated", leopardAnimations.out);
    node.classList.remove("animated", leopardAnimations.in);
    node.removeEventListener("animationend", handleAnimationEnd);
    if (typeof callback === "function") callback();
  }

  node.addEventListener("animationend", handleAnimationEnd);
}

window.addEventListener("message", receiveLeopardMessage, false);
// window.addEventListener("resize", sendLeopardFrameHeight);

// setTimeout(function() {
//   sendLeopardFrameHeight();
// }, 3000);
