<h1>Leopard Chat Client for Teneo 🐆</h1>

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/jolzee/chat-teneo-vue?style=plastic)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/jolzee/chat-teneo-vue?style=plastic)
![GitHub](https://img.shields.io/github/license/jolzee/chat-teneo-vue?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/jolzee/chat-teneo-vue?style=plastic)
<a href="https://jolzee.gitbook.io/leopard/">
<img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg?style=plastic" target="_blank" />
</a>
[![Build Status](https://travis-ci.org/jolzee/chat-teneo-vue.svg?branch=master)](https://travis-ci.org/jolzee/chat-teneo-vue)
<a href="https://twitter.com/jolzee">
<img alt="Twitter: jolzee" src="https://img.shields.io/twitter/follow/jolzee.svg?style=plastic" target="_blank" />
</a>

> An [Artificial Solutions](https://www.artificial-solutions.com/) chat client based on Vue and Vuetify.

<a href="https://youtu.be/cidZ9WxSMVY"  target="_blank"><img src="https://user-images.githubusercontent.com/36912049/58361444-b10f7680-7e43-11e9-83f7-cad45a5a4ae7.jpg" alt="Leopard Chat UI" style="width:300px;"/></a>

### 🎛 Features

- **Performant**
  - Based on Vue.js and Vuetify
- **UI is mostly localized in**
  - English, French, German, Danish, Dutch, Norwegian, Spanish, Swedish, Russian and Japanese
- **ASR and TTS**
  - Fully supported in Chrome Male/Female US/UK voices for English
  - Coverage for English (Male/Female US/UK voices), French, German, Danish, Dutch, Norwegian, Spanish, Swedish, Russian and Japanese
  - configured against your language selection
  - Configurable in that you can define known ASR corrections and they will be fixed before getting to Teneo:
    - Pizza » Peter
    - This » That
- **Configurable Integrations** to:
  - Firebase for user registration and authentication
  - Social Authentication
    - Facebook, Google and GitHub using Firebase Auth.
  - LiveChat.inc for seamless live chat handover
  - Geo-Location
- **Theme able**
- **Loading images for expected but expensive Teneo operations**
- **Language auto switch**
  - user begins speaking Spanish to an English solution - Leopard can switch communication to a Spanish TIE end point. Also the UI can switch its localization on the fly too + ASR & TTS
- **Field Types**
  - passwords, emails, file upload, date pickers, time pickers
- **Field Masks**
  - instruct Leopard to accept a custom input format - SSN, phone number, credit-card etc.
- **Markdown support**
  - Write a mixture of HTML and Markdown in answer text
- **Video and audio players**
  - YouTube, Vimeo, mp3, mp4
- **Rich responses (inline in the chat or in a modal pop out)**
  - Images & Carousels, Google Maps, videos, buttons (with custom request params when needed), tables (paginated, searchable and sortable), custom modals containing a mix of images, html, maps, etc. (size & position configurable)
  - Deep links to different solutions
    - useful when using in a Sales Engineering capacity and a single install of Leopard
- **Desktop and Mobile views**
- **Embeddable in production**
  - support for IE11 , Edge, Firefox, Opera, Chrome and Safari
  - Variables from the target page can be passed to Leopard and inturn to Teneo - useful for understanding context
- **Comprehensive web based configuration area with the ability to import and backup configurations**

### 🏡 [Teneo AI](https://www.teneo.ai/)

### 📖 [Leopard Documentation](https://jolzee.gitbook.io/leopard/)

## Install

```sh
npm install
```

## Compiles and hot-reloads for development

```sh
npm run serve
```

## Compiles and minifies for production

```sh
npm run build
```

## 🧑🏻 Author

**Peter Joles**

- Twitter: [@jolzee](https://twitter.com/jolzee)
- Github: [@jolzee](https://github.com/jolzee)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/jolzee/chat-teneo-vue/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Peter Joles](https://github.com/jolzee).<br />
This project is [Apache License 2.0](https://github.com/jolzee/chat-teneo-vue/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
