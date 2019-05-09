function getLeopardTemplate(f) {
  return f
    .toString()
    .replace(/^[^\/]+\/\*!?/, "")
    .replace(/\*\/[^\/]+$/, "");
}

var leopardTemplate = getLeopardTemplate(function() {
  /*!
<div
  id="chat-widget-container"
  style="opacity: 1; visibility: visible; z-index: 2147483639; position: fixed; top:0; bottom: 0; right: 3%; margin-top: auto; margin-bottom: auto; width: 320px; height: calc(100% - 100px); max-width: 100%; max-height: calc(100% - 0px); min-height: 0px; min-width: 0px; background-color: transparent; border: 0px; transition: none 0s ease 0s !important;"
>
  <iframe
    src="https://wi.presales.artificial-solutions.com/leopard-chat/#/"
    allowtransparency="true"
    allow="autoplay"
    id="teneo-chat-widget"
    name="teneo-chat-widget"
    scrolling="no"
    role="application"
    aria-label="Teneo chat widget"
    style="width: 100%; height: 100%; min-height: 0px; min-width: 0px; margin: 0px; padding: 0px; background-image: none; background-position: 0% 0%; background-size: initial; background-attachment: scroll; background-origin: initial; background-clip: initial; background-color: rgba(0, 0, 0, 0); border-width: 0px; float: none; transition: none 0s ease 0s !important;"
  />
</div>
*/
});

document.body.innerHTML += leopardTemplate;
