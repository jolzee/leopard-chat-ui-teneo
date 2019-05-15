var tieUrl = "http://127.0.0.1:8080/";

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
  -webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); opacity: 1; visibility: visible; z-index: 2147483639; position: fixed; bottom:100px; right: 3%; margin-top: auto; margin-bottom: auto; width: 360px; height: calc(100vh - 130px); max-width: 100%; max-height: calc(100% - 0px); min-height: 0px; min-width: 0px; background-color: transparent; border: 0px; transition: none 0s ease 0s !important; border-radius: 13px; -moz-border-radius: 13px; -webkit-border-radius: 13px;
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
    top: 100px; -webkit-box-shadow: unset; box-shadow: unset; width: 100vw; height: 100vh; max-width: 100%; max-height: 100vh; right: 0; border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px;
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
    src="[tieUrl]?button"
    allowtransparency="true"
    id="teneo-chat-button"
    name="teneo-chat-button"
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
  id="teneo-chat-widget-container" style="display:none;" class="animated rotateInUpRight delay-1s"
>
  <iframe
    src="[tieUrl]?embed[teneoCtxParams]"
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

var tieUrlRegex = /\[tieUrl\]/g;
var teneoCtxParamsRegex = /\[teneoCtxParams\]/g;

leopardButtonTemplate = leopardButtonTemplate.replace(tieUrlRegex, tieUrl);
leopardChatTemplate = leopardChatTemplate.replace(tieUrlRegex, tieUrl);
if (window.TENEOCTX) {
  leopardChatTemplate = leopardChatTemplate.replace(
    teneoCtxParamsRegex,
    "&teneoCtx=" + encodeURIComponent(JSON.stringify(window.TENEOCTX))
  );
} else {
  leopardChatTemplate = leopardChatTemplate.replace(teneoCtxParamsRegex, "");
}

document.body.innerHTML += leopardButtonTemplate;

window.setInterval(checkButtonFocus, 600);

function checkButtonFocus() {
  if (document.activeElement == document.getElementById("teneo-chat-button")) {
    var element = document.getElementById("teneo-chat-widget-container");
    if (!element) {
      document.body.innerHTML += leopardChatTemplate;

      setTimeout(function() {
        element = document.getElementById("teneo-chat-widget-container");
        element.style.display = "block";
      }, 500);
    } else {
      if (element.style.display === "none") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
    window.focus();
  }
}
