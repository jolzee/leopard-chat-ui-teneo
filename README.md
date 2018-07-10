# chat-teneo-vue

> A Teneo Chat Client based on Vue and Vuetify
>
> This chat application **should not be used in production**. It primary use is to quickly expose a Teneo CAI Chat client over an IFRAME of another site. The client allows you to define any number of configurations that are all stored in localstorage.

## Build Setup

``` bash
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

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

For details on the component library used, check out https://vuetifyjs.com/en/

If you want to get the live chat integration working then sign up for an account at https://www.livechatinc.com/ Remember to update the licence key in ++*store.js*++

``` javascript
const liveChatIncLicense = <license>;

```
