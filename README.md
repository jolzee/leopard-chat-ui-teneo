<h1 align="center">
  <a href="https://github.com/ArmynC/ArminC-AutoExec/archive/master.zip"><img src="https://github.com/jolzee/assets/raw/master/leopard/leopard-logo.png" alt="Leopard Chat"></a>
</h1>

<h4 align="center">A Feature Rich Chat Client for Teneo</h4>

<div align="center">
<a href="https://github.com/jolzee/leopard-chat-ui-teneo/releases">
<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/jolzee/leopard-chat-ui-teneo"></a>
<a href="https://github.com/jolzee/leopard-chat-ui-teneo/commits/master">
<img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/y/jolzee/leopard-chat-ui-teneo"></a>
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/jolzee/leopard-chat-ui-teneo">
<img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/jolzee/leopard-chat-ui-teneo">
<img alt="Vue" src="https://img.shields.io/github/package-json/dependency-version/jolzee/leopard-chat-ui-teneo/vue">
<img alt="Vuetify" src="https://img.shields.io/github/package-json/dependency-version/jolzee/leopard-chat-ui-teneo/vuetify">
<a href="https://jolzee.gitbook.io/leopard/" target="_blank">
<img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
</a>
<img alt="GitHub" src="https://img.shields.io/github/license/jolzee/leopard-chat-ui-teneo">
<a href="https://twitter.com/jolzee">
<img alt="Twitter: jolzee" src="https://img.shields.io/twitter/follow/jolzee.svg" target="_blank" />
</a>
</div>

<p align="center">
  <a href="#about">About</a> •
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="#documentation">Documentation</a> •
  <a href="https://jolzee.github.io/leopard-chat-ui-teneo/" target="_blank">Demo</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#author">Author</a> •
  <a href="#support">Support</a> •
  <a href="#license">License</a>
</p>

---

## About

<table>
<tr>
<td>

**Leopard Chat UI** is a **feature rich** chat client for <a href="https://www.teneo.ai/" target="_blank">Teneo</a>. Teneo is capable of returning rich data along with each response and Leopard leverages these responses to present an interactive chat experience.

Leopard can be used in both production and in a Sales Engineering mode. The Sales Engineering mode allows for numerous conversational demonstrations to be easily configured, deep linked to or shared.

An administration interface is provided where you can tweak the look and feel of the chat UI per conversational solution.

<a href="http://lychee.joles.xyz/#15895788995003" target="_blank"><img src="https://github.com/jolzee/assets/raw/master/leopard/screenshots.png" alt="Leopard Chat"></a>

### Built with

- [Vue.js](https://vuejs.org/)
- [Vuetify](https://vuetifyjs.com/en/)
</td>
</tr>
</table>

## Installation

##### Windows Users

If you're developing on windows you will most likely have to install `node-gyp` before you attempt to run `npm install`. You will need to compile some native node modules. To enable this on Windows you can run this one liner. It's going to take a while to complete but it only has to be run once. Start **PowerShell as Administrator** and run:

```sh
npm install --global windows-build-tools
```

#### Downloading and installing steps:

```sh
git clone https://github.com/jolzee/leopard-chat-ui-teneo
cd leopard-chat-ui-teneo
npm install
```

#### Configuration

Leopard is configured using [`.env`](https://jolzee.gitbook.io/leopard/installation#leopard-environment-variables) files and through the [`.env.solution.json`](https://jolzee.gitbook.io/leopard/configuration/leopard-config-page#default-configuration) file in the root of the project. If you want to make some changes prior to running/building Leopard then do so now.

#### Run Locally in Development Mode

```sh
npm run serve
```

#### Build for production

The build process runs the source code through Webpack and produces the final build into the `/dist` folder.

```sh
npm run build
```

#### Deployment

Copy all the files within `/dist` to any web server - For example `https://mydomain.com/leopard/`.

The Chat UI can then be used in Sales Engineering mode by visiting `https://mydomain.com/leopard/`

#### Embed in Production

You can inject Leopard Chat UI into a specific element on a page. This might be beneficial if you want to place it in a specific tab order. To enable this add a `<div id="leopardChatWindow"></div>` anywhere on the page. This is not required though and if absent the UI will automatically be injected at the beginning of the body.

```html
<script type="text/javascript">
  window.TENEOCTX || (TENEOCTX = {});
  TENEOCTX = {
    pageTitle: document.title,
    pageUrl: window.location.href,
    pageTopic: "Help",
    message: "This was sent from the customer's web site"
  };
</script>

<div id="leopardChatWindow"></div>

<script src="https://mydomain.com/leopard/static/embed-leopard.js"></script>
```

## Features

|                                                                                                                                                  | Supported |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | :-------: |
| [ASR & TTS](https://jolzee.gitbook.io/leopard/configuration/asr-and-tts)                                                                         |    ✔️     |
| [Alerts](https://jolzee.gitbook.io/leopard/configuration/components/modals/alerts)                                                               |    ✔️     |
| [All modern browsers & IE 11](https://jolzee.gitbook.io/leopard/#browser-compatibility)                                                          |    ✔️     |
| [Answer Text Formatting](https://jolzee.gitbook.io/leopard/configuration/response-options/answer-text-formatting) - HTML and Markdown            |    ✔️     |
| [Audio Player](https://jolzee.gitbook.io/leopard/configuration/components/modals/audio)                                                          |    ✔️     |
| [Auto Switch Solutions](https://jolzee.gitbook.io/leopard/configuration/language-auto-switch)                                                    |    ✔️     |
| [Buttons](https://jolzee.gitbook.io/leopard/configuration/response-options/buttons-and-lists)                                                    |    ✔️     |
| [Cards](https://jolzee.gitbook.io/leopard/configuration/response-options/card)                                                                   |    ✔️     |
| [Custom Forms](https://jolzee.gitbook.io/leopard/configuration/components/modals/forms)                                                          |    ✔️     |
| [Custom HTML Modals](https://jolzee.gitbook.io/leopard/configuration/components/modals/custom)                                                   |    ✔️     |
| [Custom Response Icons](https://jolzee.gitbook.io/leopard/configuration/response-options/custom-response-icons)                                  |    ✔️     |
| Dark Mode                                                                                                                                        |    ✔️     |
| [Date and Time Pickers](https://jolzee.gitbook.io/leopard/configuration/components/date-and-time-pickers)                                        |    ✔️     |
| [Deep Link to Question](https://jolzee.gitbook.io/leopard/configuration/deep-linked-question)                                                    |    ✔️     |
| [Dynamic Theme Changes](https://jolzee.gitbook.io/leopard/configuration/response-options/dynamic-theme-change)                                   |    ✔️     |
| [Emergency Button](https://jolzee.gitbook.io/leopard/configuration/response-options/emergency-button)                                            |    ✔️     |
| [Expensive Operations](https://jolzee.gitbook.io/leopard/configuration/response-options/expensive-operations)                                    |    ✔️     |
| [Extension Helper (Groovy)](https://jolzee.gitbook.io/leopard/installation#extensionhelper)                                                      |    ✔️     |
| [Feedback Forms](https://jolzee.gitbook.io/leopard/configuration/response-options/feedback-form)                                                 |    ✔️     |
| [Field Masks](https://jolzee.gitbook.io/leopard/configuration/response-options/field-masks)                                                      |    ✔️     |
| [Field Types](https://jolzee.gitbook.io/leopard/configuration/response-options/field-types) - [email / password / location / upload]             |    ✔️     |
| [Firebase Social Authentication](https://jolzee.gitbook.io/leopard/configuration/integrations/social-authentication#firebase-and-leopard-config) |    ✔️     |
| [Geo Context Capture](https://jolzee.gitbook.io/leopard/context-parameters)                                                                      |    ✔️     |
| [Hyperlinks that send input back to Teneo](https://jolzee.gitbook.io/leopard/configuration/response-options/hyperlinks)                          |    ✔️     |
| [Image Carousels](https://jolzee.gitbook.io/leopard/configuration/components/modals/image-carousel)                                              |    ✔️     |
| [Images](https://jolzee.gitbook.io/leopard/configuration/components/modals/image)                                                                |    ✔️     |
| [Input Field Help Text](https://jolzee.gitbook.io/leopard/configuration/response-options/input-field-help-text)                                  |    ✔️     |
| [LiveChatInc.com](https://jolzee.gitbook.io/leopard/configuration/integrations/live-chat)                                                        |    ✔️     |
| [Maps](https://jolzee.gitbook.io/leopard/configuration/components/modals/maps)                                                                   |    ✔️     |
| [Proactive Dialogs](https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling)                                                      |    ✔️     |
| [Responsive](https://jolzee.gitbook.io/leopard/configuration/views/mobile)                                                                       |    ✔️     |
| [Sentry and LogRocket](https://jolzee.gitbook.io/leopard/logging-reporting) - Logging and Reporting                                              |    ✔️     |
| [Split Answers](https://jolzee.gitbook.io/leopard/configuration/response-options/splitting-a-response)                                           |    ✔️     |
| [Tables](https://jolzee.gitbook.io/leopard/configuration/components/modals/table)                                                                |    ✔️     |
| Themable                                                                                                                                         |    ✔️     |
| [Toasts](https://jolzee.gitbook.io/leopard/configuration/response-options/toasts)                                                                |    ✔️     |
| [Video Player](https://jolzee.gitbook.io/leopard/configuration/components/modals/video) (YouTube, Vimeo, mp4)                                    |    ✔️     |
| [i18n](https://jolzee.gitbook.io/leopard/configuration/asr-and-tts#supported-languages)                                                          |    ✔️     |

## Screenshots

<a href="http://lychee.joles.xyz/#15895788995003" target="_blank"><img src="https://github.com/jolzee/assets/raw/master/leopard/screenshots2.png" alt="Leopard Chat"></a>

## Documentation

Do you **need some help**? Check the [_complete documentation_](https://jolzee.gitbook.io/leopard/).

## Contributing

Got **something interesting** you'd like to **share**? Learn about [contributing](https://github.com/jolzee/leopard-chat-ui-teneo/blob/master/.github/CONTRIBUTING.md).

## Author

| [![Peter Joles](https://github.com/jolzee/assets/raw/master/peter.png)](https://www.linkedin.com/in/peterjoles/) |
| :--------------------------------------------------------------------------------------------------------------: |
|                                                 **Peter Joles**                                                  |

## Support

Reach out to me at one of the following places:

- [peter.joles.xyz](http://peter.joles.xyz/)
- **peter.joles@artificial-solutions.com**

## License

Distributed under the Apache License 2.0. See [**LICENSE**](https://github.com/jolzee/leopard-chat-ui-teneo/blob/master/LICENSE) for more information.

## Attributions

Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
