function getLeopardTemplate(f) {
  return f
    .toString()
    .replace(/^[^/]+\/\*!?/, "")
    .replace(/\*\/[^/]+$/, "");
}

var leopardTemplate = getLeopardTemplate(function() {
  /*!
<style>
.teneo-open {
  -webkit-box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); box-shadow: 0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12); opacity: 1; visibility: visible; z-index: 2147483639; position: fixed; top:0; bottom: 0; right: 3%; margin-top: auto; margin-bottom: auto; width: 320px; height: 85%; max-width: 100%; max-height: calc(100% - 0px); min-height: 0px; min-width: 0px; background-color: transparent; border: 0px; transition: none 0s ease 0s !important; border-radius: 13px; -moz-border-radius: 13px; -webkit-border-radius: 13px;
}

@media only screen and (max-width: 480px) {
  .teneo-open {
     -webkit-box-shadow: unset; box-shadow: unset; width: 100vw; height: 100vh; max-width: 100%; max-height: 100vh; right: 0; border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px;
  }
}
</style>

<div
  id="teneo-chat-widget-container"
  class="teneo-open"
>
  <iframe
    src="http://127.0.0.1:8080/?embed"
    allowtransparency="true"
    allow="autoplay"
    id="teneo-chat-widget"
    name="teneo-chat-widget"
    scrolling="no"
    role="application"
    aria-label="Teneo chat widget"
    style="height: 100%; width: 100%"
  />
</div>


*/
});

document.body.innerHTML += leopardTemplate;
