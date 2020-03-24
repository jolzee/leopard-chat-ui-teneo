"use strict";

/* eslint-disable */
var leopardUrl;
var leopardEmbedSrc = null;

function isLeopard(scriptElem) {
    var srcValue = scriptElem.getAttribute("src");
    return srcValue && srcValue.indexOf("embed-leopard.js") !== -1;
}

var leopardPageScripts = document.getElementsByTagName("script");

for (var i = 0; i < leopardPageScripts.length; i += 1) {
    if (isLeopard(leopardPageScripts[i])) {
        leopardEmbedSrc = leopardPageScripts[i].getAttribute("src");
    }
} // console.log(leopardEmbedSrc);

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

function getLeopardTemplate(f) {
    return f
        .toString()
        .replace(/^[^/]+\/\*!?/, "")
        .replace(/\*\/[^/]+$/, "");
}

function leopardDebounce(func, wait, immediate) {
    var timeout;
    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function runLater() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

var leopardChatTemplate = getLeopardTemplate(function hmltInAFunction() {
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
        height: calc(var(--leopardvh, 1vh) * 85);
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
        min-height: calc(var(--leopardvh, 1vh) * 20);
        height: calc(var(--leopardvh, 1vh) * 100);
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
       allow="microphone; geolocation"
       allowfullscreen="allowfullscreen"
       id="teneo-chat-widget"
       name="teneochatwidget"
       title="Chatbot"
       scrolling="no"
       role="application"
       aria-label="Chat Bot"
       style="height: 100%; width: 100%; border-width: 0px; border-style: none; border-color: transparent; border-image: unset; background: none transparent !important; background-color: transparent !important;"
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
        "&teneoCtx=".concat(encodeURIComponent(JSON.stringify(window.TENEOCTX)))
    );
} else {
    leopardChatTemplate = leopardChatTemplate.replace(teneoCtxParamsRegex, "");
}

var leopardViewHeight = window.innerHeight * 0.01;
document.documentElement.style.setProperty(
    "--leopardvh",
    "".concat(leopardViewHeight, "px")
);

function leopardFocusIframe(iframeEl) {
    if (iframeEl.contentWindow) {
        iframeEl.contentWindow.focus();
    } else if (iframeEl.contentDocument && iframeEl.contentDocument.documentElement) {
        // For old versions of Safari
        iframeEl.contentDocument.documentElement.focus();
    }
}

function loadLeopard() {
    var leopardTargetElement = document.getElementById("leopardChatWindow");
    if (leopardTargetElement) {
        leopardTargetElement.innerHTML = leopardChatTemplate;
    } else {
        document.body.insertAdjacentHTML("afterbegin", leopardChatTemplate);
    }
}

document.addEventListener('DOMContentLoaded', loadLeopard);

function checkLeopardButtonFocus() {
    // class teneo-chat-button-widget
    var teneoFrame = document.getElementById("teneo-chat-widget");
    if (teneoFrame && document.activeElement === teneoFrame) {
        var teneoContainer = document.getElementById("teneo-chat-widget-container");
        if (teneoContainer && teneoContainer.className === "teneo-chat-button-widget") {
            var leopardFrameInnerButtonEl = teneoFrame.contentDocument.getElementById('leopard-embed-open-close-button');
            if (leopardFrameInnerButtonEl) {
                leopardFocusIframe(teneoFrame);
                leopardFrameInnerButtonEl.focus();
            }
        }
    }
}

window.setInterval(checkLeopardButtonFocus, 500);

var leopardAnimations = { in: "flipInY",
    out: "zoomOutDown"
};
var shouldShowLeopard = false;
var isLeopardAnimating = false; // eslint-disable-next-line no-unused-vars

function getLeopardElementHeight() {
    var el = document.getElementById("teneo-chat-widget-container");
    var elStyle = window.getComputedStyle(el, "");
    var elDisplay = elStyle.display;
    var elPosition = elStyle.position;
    var elVisibility = elStyle.visibility;
    var elMaxHeight = elStyle.maxHeight.replace("px", "").replace("%", "");
    var wantedHeight = 0;

    if (elDisplay !== "none" && elMaxHeight !== "0") {
        return el.offsetHeight;
    }

    el.style.position = "absolute";
    el.style.visibility = "hidden";
    el.style.display = "block";
    wantedHeight = el.offsetHeight;
    el.style.display = elDisplay;
    el.style.position = elPosition;
    el.style.visibility = elVisibility;
    return wantedHeight;
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
            setTimeout(function () {
                var teneoFrame = document.getElementById("teneo-chat-widget");
                if (teneoFrame) {
                    var teneoInputBox = teneoFrame.contentDocument.getElementById('teneo-input-field');
                    if (teneoInputBox) {
                        leopardFocusIframe(teneoFrame);
                        teneoInputBox.focus();
                        teneoInputBox.click();
                    }
                }
            }, 800);
            callback();
        }
    }
}

function postMessageToLeopard(objPayload) {
    var teneoFrameWindow = window.frames.teneochatwidget;

    if (teneoFrameWindow && objPayload) {
        teneoFrameWindow.postMessage(JSON.stringify(objPayload), "*");
    }
}

function receiveLeopardMessage(event) {
    /* if (event.origin !== "http://example.org:8080") return; */
    try {
        if (event.data === "shiftTabLeopard") {
            var teneoContainer = document.getElementById("leopardChatWindow");
            if (!teneoContainer) {
                teneoContainer = document.getElementById("teneo-chat-widget-container");
            }
            if (teneoContainer) {
                teneoContainer.previousElementSibling.focus();
            }
        }
        if (event.data === "tabLeopard") {
            var teneoContainer = document.getElementById("leopardChatWindow");
            if (!teneoContainer) {
                teneoContainer = document.getElementById("teneo-chat-widget-container");
            }
            if (teneoContainer) {
                teneoContainer.nextElementSibling.focus();
            }
        }
        if (event.data === "showLeopard" && !shouldShowLeopard) {

            var leopardButtonElement = document.getElementsByClassName(
                "teneo-chat-button-widget"
            );

            if (leopardButtonElement.length > 0) {
                leopardButtonElement[0].style.display = "none";
                leopardButtonElement[0].className = "";
            } // console.log("👁 Leopard");

            var leopardContainer = document.getElementById(
                "teneo-chat-widget-container"
            );

            leopardContainer.className = "teneo-chat-widget";
            leopardContainer.style.display = "block";
            shouldShowLeopard = true;
            animateLeopard(leopardAnimations.in);

        } else if (event.data === "hideLeopard" && shouldShowLeopard) {
            // console.log("Hide 👁 Leopard");
            isLeopardAnimating = true;
            animateLeopard(leopardAnimations.out, function runWhenFinished() {
                shouldShowLeopard = false;
                var node = document.getElementById("teneo-chat-widget-container");
                node.style.display = "none";
                postMessageToLeopard({
                    leopardState: "closed"
                });
                setTimeout(function showLeopardButton() {
                    node = document.getElementById("teneo-chat-widget-container");
                    node.className = "teneo-chat-button-widget";
                    node.style.display = "block";
                    isLeopardAnimating = false;
                    setTimeout(function addFocusToButton() {
                        var leopardFrame;
                        do {
                            leopardFrame = document.getElementById('teneo-chat-widget');
                            if (leopardFrame) {
                                var leopardFrameInnerButton = leopardFrame.contentDocument.getElementById('leopard-embed-open-close-button');
                                if (leopardFrameInnerButton) {
                                    leopardFocusIframe(leopardFrame);
                                    leopardFrameInnerButton.focus();
                                }
                            }
                        }
                        while (!leopardFrame);
                    }, 800);
                }, 800);
            });
        } else if (event.data === "hideLeopard" && !isLeopardAnimating) {
            var leopardContainer = document.getElementById(
                "teneo-chat-widget-container"
            );

            if (leopardContainer.className !== "teneo-chat-button-widget") {
                leopardContainer.className = "teneo-chat-button-widget";
                leopardContainer.style.display = "block";
            }
        } else if (event.data.startsWith("runLeopardScript")) {
            var results = event.data.split("|");
            eval(results[1]);
        }
    } catch (err) {
        /* ignore as it's most likely another message from another source */
    }
}

function updateLeopardVariables() {
    var leopardVHeight = window.innerHeight;
    var leoaprdViewWidth = window.innerWidth;
    document.documentElement.style.setProperty(
        "--leopardvh",
        "".concat(leopardVHeight * 0.01, "px")
    );
    var teneoFrameWindow = window.frames.teneochatwidget;

    if (teneoFrameWindow) {
        var leoapardPayload = {
            width: leoaprdViewWidth,
            height: leopardVHeight
        };
        teneoFrameWindow.postMessage(JSON.stringify(leoapardPayload), "*");
    }
}

window.addEventListener("message", receiveLeopardMessage, false);
window.addEventListener(
    "resize",
    leopardDebounce(updateLeopardVariables, 200, false),
    false
);

if (document.readyState === "ready" || document.readyState === "complete") {
    var leopardTargetElement = document.getElementById("leopardChatWindow");
    if (!leopardTargetElement) {
        loadLeopard();
    }
}