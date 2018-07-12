# chat-teneo-vue

> A Teneo Chat Client based on Vue and Vuetify
>
> This chat application **should not be used in production**. It primary use is to quickly expose a Teneo CAI Chat client over an IFRAME of another site. The client allows you to define any number of configurations that are all stored in localstorage.

![](https://i.imgur.com/OFWvc4h.gif)

## Build Setup

```bash
# clone
git clone https://github.com/jolzee/chat-teneo-vue.git

# move into cloned project
cd chat-teneo-vue

# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification - copy and deploy files in dist. Clear dist before new builds
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

---

:heavy_check_mark: Responsive<br/>
:heavy_check_mark: ASR and TTS on Google Chrome - long press on send icon to toggle<br/>
:heavy_check_mark: Localized for English, French, German and Dutch<br/>
:heavy_check_mark: Configurable to serve multiple solutions<br/>
:heavy_check_mark: Media Players for YouTube, Vimeo, mp4, mp3<br/>
:heavy_check_mark: Date time picker for dialogs requiring date input<br/>
:heavy_check_mark: Live chat handover integration<br/>

---

For details on the Material Design component framework used, check out https://vuetifyjs.com/en/

If you want to get the live chat integration working then sign up for an account at https://www.livechatinc.com/ Remember to update the licence key in \_store.js\*

```javascript
const liveChatIncLicense = <license>;
```
