<template>
  <v-container fluid id="chat-area" class="chat-container">
    <v-row no-gutters class="mx-0 px-0">
      <ChatNoHistory v-if="noHistory && isHistoryPage"></ChatNoHistory>

      <!-- show the listening modal when recognizing audio input -->
      <teneo-listening v-bind:value="listening" :message="$t('listening')"></teneo-listening>

      <v-col
        cols="12"
        class="pa-0"
        id="teneo-chat-scroll"
        :class="{
          'grey darken-4 dark-scroll': $vuetify.theme.dark,
          'light-scroll grey lighten-4': !$vuetify.theme.dark,
          'chat-responses-float': float,
          'chat-responses': !float,
          'chat-responses-float-mobile': isMobileDevice
        }"
        ref="chatContainer"
      >
        <!-- show the initial loding ball animation when first loading the chat window -->
        <ChatLoading v-if="showChatLoading"></ChatLoading>
        <Feedback
          v-if="showFeedback"
          :feedbackConfig="getFeedbackFormConfig"
          @showFeedback="showFeedback = true"
          @hideFeedback="showFeedback = false"
        />
        <v-container class="chat-container-inner">
          <transition-group
            name="chat-line-transition"
            enter-active-class="animated no-animation-today"
          >
            <v-container
              v-for="(item, i) in dialog"
              :key="i + 'itemsIter' + uuid"
              :class="{ 'mt-0 pb-0': i === dialog.length - 1, 'pt-0': i === 0 }"
              class="px-0 mx-0"
            >
              <ChatBroadcastMessage :item="item" class="pb-1"></ChatBroadcastMessage>

              <LiveChatResponse :itemIndexInDialog="i" :item="item" class="mt-1 pb-1"></LiveChatResponse>

              <ChatTeneoResponse
                :item="item"
                :itemIndexInDialog="i"
                @swapInputButton="swapInputButton"
                @handleFocus="handleFocus"
                @toggleDate="showDate = !showDate"
                @toggleTime="showTime = !showTime"
                @showFeedback="showFeedback = true"
              ></ChatTeneoResponse>

              <ChatUserQuestion
                :item="item"
                :itemIndexInDialog="i"
                @clicked="updateInputBox"
                @swapInputButton="swapInputButton"
              ></ChatUserQuestion>
            </v-container>
          </transition-group>
        </v-container>

        <!-- live chat typing -->
        <div
          v-if="showLiveChatProcessing"
          class="text-left ma-2"
          style="background-color: transparent; align-items: left;"
        >
          <v-alert
            min-width="100%"
            color="info"
            border="left"
            elevation="2"
            colored-border
            icon="mdi-keyboard-settings"
          >
            Agent is typing a message..
            <vue-loaders-ball-pulse-sync color="#C2C2C2" scale="0.5"></vue-loaders-ball-pulse-sync>
          </v-alert>
        </div>
        <span ref="endChat">
          <!-- scroll to the end -->
        </span>
      </v-col>
      <!-- // progressBar -->
      <!-- Chat Footer - Input Field and Buttons -->
      <v-progress-linear
        :indeterminate="true"
        :active="progressBar"
        class="teneo-input-loading"
        color="accent"
        height="4"
      ></v-progress-linear>
    </v-row>
    <v-row class="teneo-footer" :class="{ 'footer-float': float }" no-gutters>
      <v-col>
        <v-form v-model="valid" v-on:submit.prevent ref="userInputForm">
          <v-container class="fill-height">
            <v-row no-gutters align="center" justify="center">
              <v-col class="text-center">
                <v-text-field
                  id="teneo-input-field"
                  aria-label="Enter your question for assistance here"
                  v-show="!showUploadButton && !showUploadProgress"
                  :disabled="progressBar"
                  v-shortkey="{
                    toggle1: ['ctrl', 'alt', '/'],
                    toggle2: ['ctrl', 'alt', 'arrowdown']
                  }"
                  @shortkey.native="swapInputButton"
                  :prepend-inner-icon="
                    askingForPassword
                      ? showPassword
                        ? 'mdi-eye'
                        : 'mdi-eye-off'
                      : ''
                  "
                  :type="
                    askingForPassword
                      ? showPassword
                        ? 'text'
                        : 'password'
                      : 'text'
                  "
                  @click:prepend-inner="showPassword = !showPassword"
                  :rules="askingForEmail ? [rules.email(userInput)] : []"
                  clearable
                  clear-icon="mdi-comment-remove-outline"
                  auto-grow
                  required
                  solo
                  return-masked-value
                  :mask="itemInputMask"
                  name="userInput"
                  ref="userInput"
                  autocomplete="off"
                  @keyup.enter.native="sendUserInput"
                  v-model="userInput"
                  :label="
                    inputHelpText
                      ? inputHelpText
                      : askingForPassword
                      ? $t('input.box.label.password')
                      : askingForEmail
                      ? $t('input.box.label.email')
                      : $t('input.box.label')
                  "
                  single-line
                  data-lpignore="true"
                >
                  <template v-if="showAudioInput" v-slot:append>
                    <v-btn
                      :disabled="userInput === ''"
                      @click="sendUserInput"
                      aria-label="Send your question to the virtual assistant"
                      large
                      text
                      icon
                      ripple
                      color="primary"
                    >
                      <v-icon>mdi-send</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
                <span v-shortkey="['esc']" @shortkey="stopAudioCapture"></span>
              </v-col>
              <v-col cols="3" sm="2" class="text-center">
                <upload-btn
                  icon
                  aria-label="Select file for upload"
                  v-if="showUploadButton"
                  @file-update="fileChanged"
                  large
                  hover
                  class="elevation-2 v-btn v-btn--fab v-btn--round v-size--small primary white--text mt-3"
                >
                  <template slot="icon">
                    <v-icon dark class="py-2">mdi-paperclip</v-icon>
                  </template>
                </upload-btn>
                <v-progress-circular
                  v-if="showUploadProgress"
                  :rotate="360"
                  :size="40"
                  :width="10"
                  :value="progressValue"
                  color="accent"
                  class="mt-3"
                ></v-progress-circular>
                <template v-if="!showUploadButton && !showUploadProgress">
                  <v-btn
                    text
                    icon
                    :disabled="progressBar || userInput === ''"
                    :loading="progressBar"
                    v-long-press="1000"
                    @long-press-start="swapInputButton"
                    aria-label="Send your question to the assistant"
                    v-if="!showAudioInput"
                    large
                    color="primary"
                    @click.native="sendUserInput"
                  >
                    <v-icon>mdi-send</v-icon>
                  </v-btn>

                  <v-btn
                    fab
                    aria-label="Send your question to the assistant."
                    :disabled="progressBar"
                    :loading="progressBar"
                    v-long-press="1000"
                    @long-press-start="swapInputButton"
                    small
                    v-if="showAudioInput"
                    v-shortkey="{
                      recordAudioOne: ['ctrl', 'alt', '.'],
                      recordAudioTwo: ['ctrl', 'alt', '`'],
                      recordAudioThree: ['ctrl', 'alt', 'arrowup']
                    }"
                    @shortkey.native="captureAudio"
                    :color="audioButtonColor"
                    :class="audioButtonClasses"
                    class="elevation-2 white--text"
                    @click.native="captureAudio"
                  >
                    <v-icon medium>mdi-microphone</v-icon>
                  </v-btn>
                </template>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-col>
    </v-row>

    <!-- end -->
    <!-- Date picker dialog -->
    <v-col cols="12" v-if="showDate" :key="'datePicker' + uuid">
      <v-dialog ref="dialogDate" v-model="showDate" :return-value.sync="date" width="290px">
        <v-date-picker v-model="date" scrollable>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="showDate = false">Cancel</v-btn>
          <v-btn text color="primary" @click="sendUserInput">OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-col>

    <Dialog
      @close="showLeopardDialog = false"
      :show="showLeopardDialog"
      title="Hi there this is the title"
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita id
        doloremque eius, et at dicta sapiente ullam eum sequi dolorum incidunt
        veritatis ipsam laudantium? Consequatur tenetur voluptas facere
        provident magnam!
      </p>
    </Dialog>

    <!-- Time picker dialog -->
    <v-col cols="12" v-if="showTime" :key="'timePicker' + uuid">
      <v-dialog ref="dialogTime" v-model="showTime" width="290px">
        <v-card>
          <v-time-picker v-model="userInput" format="24hr"></v-time-picker>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="error" @click="showTime = false">Cancel</v-btn>
            <v-btn small color="success" @click="sendUserInput">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-container>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Chat.vue");
var mobile = require("is-mobile");
import dayjs from "dayjs";
import LongPress from "vue-directive-long-press";
// import ChatBroadcastMessage from "../components/ChatBroadcastMessage";
import ChatLoading from "../components/ChatLoading";
// import ChatNoHistory from "../components/ChatNoHistory";
import ChatTeneoResponse from "../components/ChatTeneoResponse";
import ChatUserQuestion from "../components/ChatUserQuestion";
import Dialog from "../components/Dialog";

// import LiveChatResponse from "../components/LiveChatResponse";
import UploadButton from "vuetify-upload-button";
const superagent = require("superagent");
import { mapGetters } from "vuex";

if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let matches = (this.document || this.ownerDocument).querySelectorAll(s),
      i,
      el = this;
    do {
      i = matches.length;
      while (--i >= 0 && matches.item(i) !== el) {
        // find some stuff
      }
    } while (i < 0 && (el = el.parentElement));
    return el;
  };
}

export default {
  components: {
    ChatBroadcastMessage: () => import("../components/ChatBroadcastMessage"),
    ChatLoading,
    Dialog,
    ChatNoHistory: () => import("../components/ChatNoHistory"),
    ChatUserQuestion,
    ChatTeneoResponse,
    Feedback: () => import("../components/Feedback"),
    LiveChatResponse: () => import("../components/LiveChatResponse"),
    "upload-btn": UploadButton
  },
  directives: {
    "long-press": LongPress
  },
  data() {
    return {
      showLeopardDialog: false,
      interval: {},
      mustScroll: true,
      oldDialogLength: 0,
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "primary",
      showDate: false,
      showPassword: false,
      showTime: false,
      showUploadProgress: false,
      showFeedback: false,
      progressValue: 0,
      date: "",
      rules: {
        required: value => !!value || "Required.",
        counter: value => value.length <= 20 || "Max 20 characters",
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        }
      },
      valid: false
    };
  },
  watch: {
    dialog: function(newDialog) {
      if (newDialog.length !== this.oldDialogLength) {
        this.mustScroll = true;
        this.oldDialogLength = newDialog.length;
      }
    },
    showLiveChatProcessing: function(isLiveChatPersonTyping) {
      if (isLiveChatPersonTyping) {
        this.mustScroll = true;
      }
    }
  },
  beforeRouteLeave(from, to, next) {
    this.$emit("closeMenu");
    next();
  },
  computed: {
    ...mapGetters([
      "isLiveAgentAssist",
      "askingForPassword",
      "askingForEmail",
      "dialogs",
      "embed",
      "overlayChat",
      "getLatestDialogHistory",
      "dark",
      "float",
      "inputHelpText",
      "isMobileDevice",
      "itemInputMask",
      "progressBar",
      "showChatLoading",
      "showUploadButton",
      "showLiveChatProcessing",
      "showFeedbackForm",
      "getFeedbackFormConfig",
      "userInputReadyForSending",
      "userProfileImage",
      "uuid",
      "displayName",
      "listening",
      "settingLongResponsesInModal",
      "uploadConfig",
      "lastItemAnswerTextCropped",
      "itemAnswerTextCropped",
      "lastItemHasLongResponse",
      "itemHasLongResponse"
    ]),
    getNarrowMobile() {
      if (window.innerWidth <= 480) {
        return "min-height: calc(var(--vh, 1vh) * 80 - 130px);";
      } else {
        return "";
      }
    },
    userInput: {
      get: function() {
        if (this.date !== "") {
          this.updateInputBox(dayjs(this.date).format("D MMMM YYYY"));
        }
        if (this.userInputReadyForSending) {
          this.$store.commit("HIDE_CHAT_MODAL"); // hide all modals
          this.sendUserInput();
        }
        return this.$store.getters.userInput;
      },
      set: function(userInput) {
        this.$store.commit("SET_USER_INPUT", userInput);
      }
    },
    getCurrentItem() {
      return this.dialog.length - 1;
    },
    isHistoryPage() {
      return this.$route.name === "history";
    },
    noHistory() {
      let history = this.getLatestDialogHistory;
      return history.length === 0;
    },
    dialog() {
      if (this.$route.name === "chat") {
        return this.dialogs ? this.dialogs : [];
      } else {
        // history in session storage
        return this.getLatestDialogHistory ? this.getLatestDialogHistory : [];
      }
    }
  },
  updated: function() {
    try {
      if (this.mustScroll) {
        this.mustScroll = false;

        this.$nextTick(() => {
          this.scrollToBottom();
          // setTimeout(this.scrollToBottom, 2001);
        });
      }

      if (!this.isMobileDevice) {
        const element = this.$el.querySelector("#teneo-input-field");
        if (element) {
          this.$nextTick(() => {
            element.addEventListener("focusin", e => e.stopPropagation());
            element.focus();
          });
        }
      }
    } catch (e) {
      logger.debug(e);
      // do nothing
    }
  },
  mounted() {
    let siteFrame = document.getElementById("site-frame");

    if (!this.embed && !this.overlayChat && siteFrame) {
      setTimeout(() => {
        siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
      }, 1200);
    }

    this.$el.addEventListener("click", this.onHtmlClick);
    if (!this.isMobileDevice) {
      this.$refs.userInput.focus();
    } else {
      document.activeElement.blur();
    }
    this.scrollToBottom();
  },
  beforeDestroy() {},
  methods: {
    scrollToBottom() {
      logger.debug("Scroll to bottom");
      const endChatTarget = this.$refs.endChat;
      const options = {
        duration: 1200,
        offset: -50,
        easing: "easeInQuad",
        container: "#teneo-chat-scroll"
      };
      this.$vuetify.goTo(endChatTarget, options);
      let that = this;
      setTimeout(function() {
        that.$vuetify.goTo(endChatTarget, {
          duration: 500,
          offset: 0,
          easing: "easeInQuad",
          container: "#teneo-chat-scroll"
        });
      }, 1500);
    },
    handleFocus() {
      if (!this.isMobileDevice) {
        this.$refs.userInput.focus();
      } else {
        document.activeElement.blur();
      }
    },
    hideKeyboard() {
      document.activeElement.blur();
    },
    fileChanged(file) {
      this.$store.commit("HIDE_UPLOAD_BUTTON");
      this.showUploadProgress = true;
      if (this.uploadConfig && Object.keys(this.uploadConfig).length) {
        let config = this.uploadConfig.parameters;
        var formData = new FormData();

        formData.append(config.postFileNameParam, file);
        if (config.postParams) {
          for (const [key, value] of Object.entries(config.postParams)) {
            formData.append(key, value);
          }
        }

        let self = this;

        superagent
          .post(config.postUrl)
          .send(formData)
          .then(res => {
            // logger.debug(res);
            const postResultQueryParam = "&uploadResponse=" + btoa(res.text);
            if (config.reqUserInputSuccess) {
              self.$store.commit("SET_USER_INPUT", config.reqUserInputSuccess);
            }
            self.$store.dispatch(
              "sendUserInput",
              config.teneoSuccessQuery
                ? config.teneoSuccessQuery + postResultQueryParam
                : postResultQueryParam
            );
          })
          .catch(function(response) {
            //handle error
            if (config.reqUserInputFailure) {
              self.$store.commit("SET_USER_INPUT", config.reqUserInputFailure);
            }
            self.$store.dispatch(
              "sendUserInput",
              config.teneoFailureQuery
                ? config.teneoFailureQuery + postResultQueryParam
                : postResultQueryParam
            );
            logger.error(response);
          });

        // {
        //   "name": "uploadConfig",
        //   "parameters": {
        //     postUrl: "http://url-to-post-file-to.com/some-context",
        //     postFileNameParam: "file",
        //     postParams: {
        //       "my_key": "my_value"
        //     },
        //     teneoSuccessQuery: "&uploadResult=success",
        //     teneoFailureQuery: "&uploadResult=error",
        //     reqUserInputSuccess: "I have uploaded my file",
        //     reqUserInputFailure: "I tried uploading but it didn't work"
        //   }
        // }
      }
      // If multiple prop is true, it will return an object array of files.
      this.interval = setInterval(() => {
        if (this.progressValue === 100) {
          clearInterval(this.interval);
          this.showUploadProgress = false;
          if (!this.uploadConfig || !Object.keys(this.uploadConfig).length) {
            this.$store.commit(
              "SHOW_MESSAGE_IN_CHAT",
              `Thanks we have successfully received your file: ${file.name}`
            );
            this.$store.dispatch("sendUserInput").then(() => {
              logger.debug("Upload flag sent to Teneo");
            });

            // var reader = new FileReader();

            // reader.onload = function(e) {
            //   logger.debug(e.target.result);
            // };

            // reader.readAsDataURL(file);
          }
          return (this.progressValue = 0);
        }
        this.progressValue += 10;
      }, 300);
      logger.debug(file);
    },

    stopAudioCapture() {
      this.$store.commit("HIDE_LISTENING_OVERLAY");
      this.$store.dispatch("stopAudioCapture");
      this.audioButtonColor = "primary";
    },
    onHtmlClick(event) {
      // Find the closest anchor to the target.
      const anchor = event.target.closest("a");
      if (!anchor) return;

      // Check to make sure this is from our v-html because
      // we don't want to handle clicks from other things in
      // the Vue
      if (
        !anchor.classList.contains("sendInput") &&
        !anchor.classList.contains("openInIframe")
      ) {
        return; // basically treat like a normal link
      } else if (anchor.classList.contains("openInIframe")) {
        // open in iframe
        event.stopPropagation();
        event.preventDefault();
        this.$store.commit("UPDATE_FRAME_URL", anchor.getAttribute("href"));
      } else {
        // send input
        event.stopPropagation();
        event.preventDefault();
        if (anchor.getAttribute("data-input")) {
          this.updateInputBox(anchor.getAttribute("data-input"));
        } else {
          this.updateInputBox(anchor.innerText);
        }
        this.sendUserInput("&isClick=true");
      }
    },
    updateInputBox(userInput) {
      this.$store.commit("SET_USER_INPUT", userInput);
      if (!this.isMobileDevice) {
        this.$refs.userInput.focus();
      } else {
        document.activeElement.blur();
      }
    },
    hideProgressBar() {
      this.$store.commit("HIDE_PROGRESS_BAR");
    },
    sendUserInput(params = "") {
      if (this.valid) {
        this.$refs.userInputForm.resetValidation();
        this.audioButtonColor = "primary";
        if (this.userInput.trim()) {
          this.$store.commit("SHOW_PROGRESS_BAR");
          this.showDate = false;
          this.showTime = false;
          this.date = "";
          this.scrollToBottom();
          this.$store
            .dispatch("sendUserInput", params)
            .then(() => {
              if (!this.isMobileDevice) {
                this.$refs.userInput.focus();
              } else {
                document.activeElement.blur();
              }
            })
            .catch(err => {
              logger.error("Error Sending User Input", err);
            });
        }
        if (!this.isMobileDevice) {
          this.$refs.userInput.focus();
        } else {
          document.activeElement.blur();
        }
      }
    },

    captureAudio() {
      if (
        Object.prototype.hasOwnProperty.call(
          window,
          "webkitSpeechRecognition"
        ) &&
        Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
      ) {
        this.$store.commit("HIDE_CHAT_MODAL");
        this.audioButtonColor = "error";
        this.audioButtonClasses = "white--text";
        this.$store.commit("SHOW_LISTING_OVERLAY");
        this.$store.dispatch("captureAudio");
      }
    },
    swapInputButton() {
      // check if we have access to the mic
      let that = this;

      if (navigator && navigator.mediaDevices && !mobile()) {
        var isChrome =
          /Chrome/.test(navigator.userAgent) &&
          !/ OPR/.test(navigator.userAgent) &&
          /Google Inc/.test(navigator.vendor);
        if (isChrome) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function() {
              that.showAudioInput = !that.showAudioInput;
              that.$store.commit("TTS_ENABLE", that.showAudioInput);
            })
            .catch(function(err) {
              logger.debug("ASR input is not allowed", err);
              that.$store.commit(
                "SHOW_MESSAGE_IN_CHAT",
                "ASR input is not allowed. Possible reasons: website not running over HTTPS, you have denied microphone access or the chat UI has been loaded form a different domain that the website."
              );
            });
        }
      }
    }
  }
};
</script>
<style scoped>
.loading-ball {
  width: 360px;
}

#teneo-chat-scroll {
  -ms-overflow-style: -ms-autohiding-scrollbar;
}

.container {
  padding: 0 !important;
}

.teneo-input-loading {
  position: relative;
  top: -4px;
  margin-bottom: -4px;
  z-index: 1;
}
</style>
<style>
div.upload-btn {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

label.upload-btn {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

button.v-expansion-panel-header:active {
  border-style: none !important;
}

button.v-expansion-panel-header:focus {
  background: unset;
  -webkit-box-shadow: none !important;
  -moz-box-shadow: none !important;
  box-shadow: none !important;
  /* color: transparent; */
}

div#chat-area p {
  margin-bottom: 5px;
}

div.teneo-footer .v-input__slot {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding-right: 0px !important;
  margin-top: 8px !important;
  /* padding-left: 5px !important; */
}

div.teneo-footer .v-text-field__details {
  position: absolute;
  margin-top: 45px;
}

div.chat-container .v-expansion-panel-header {
  cursor: unset !important;
  user-select: text !important;
}

v-expansion-panel-header
  div.chat-container
  .v-expansion-panel:not(:first-child)::after {
  border-top: none !important;
}

.v-expansion-panel:not(:first-child)::after {
  border-top: none !important;
}

div.chat-container .v-expansion-panel-header--mousedown {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}

div.chat-container .v-expansion-panel::before {
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}

.v-toolbar__title:not(:first-child) {
  margin-left: 12px !important;
}

.v-toolbar__title {
  font-size: 17px !important;
  white-space: unset !important;
}

/* .v-toolbar__content,
.v-toolbar__extension {
  padding: 0 12px;
} */

@media screen and (-ms-high-contrast: active),
  screen and (-ms-high-contrast: none) {
  /* IE10+ specific styles go here */
  /* .chat-card {
    font-size: 1.1em;
    font-weight: 400;
    padding: 8px;
    margin-top: 4px;
    width: 260px;
    line-height: 1.2em;
    display: table;
  } */
}

.chat-card {
  /* font-size: 1.1em; */
  font-weight: 400;
  padding: 8px !important;
  margin-top: 4px;
  line-height: 1.4em;
  width: fit-content;
  display: table;
}

.chat-card-left {
  border-radius: 3px 13px 13px 13px !important;
  -moz-border-radius: 3px 13px 13px 13px !important;
  -webkit-border-radius: 3px 13px 13px 13px !important;
  padding-bottom: 3px !important;
}

.chat-card-right {
  border-radius: 13px 3px 13px 13px !important;
  -moz-border-radius: 13px 3px 13px 13px !important;
  -webkit-border-radius: 13px 3px 13px 13px !important;
  margin-left: auto !important;
}

div.options-list a.v-list__tile--link {
  cursor: pointer;
  height: inherit !important;
}

.teneo-response-icon {
  margin-left: 0px;
  margin-right: 0px;
}

.teneo-userinput-icon {
  margin-right: 0px;
  margin-left: 0px;
}

.teneo-dialog {
  width: 360px;
  max-width: none;
  border-top: unset !important;
  padding-left: 10px;
  padding-right: 10px;
  animation-duration: 2s;
  animation-delay: 1s;
}

.chat-responses-float {
  min-height: calc(80vh - 130px);
  max-height: calc(80vh - 130px);
  height: calc(80vh - 130px);
  /* height: calc(var(--vh, 1vh) * 80 - 130px); */
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-responses-float-mobile {
  height: calc(var(--vh, 1vh) * 80 - 130px) !important;
}

.chat-responses {
  min-height: calc(100vh - 130px);
  max-height: calc(100vh - 130px);
  height: calc(100vh - 130px);
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-container {
  overflow-x: hide !important;
  width: 360px;
}

.chat-container-inner {
  overflow-x: hide !important;
  -webkit-box-shadow: 0 2px 20px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 20px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

span.teneo-reply ul {
  padding-left: 17px !important;
}

.teneo-footer {
  -webkit-box-shadow: 0px -1px 0px 0px rgba(0, 0, 0, 0.12),
    0px -2px 0px 0 rgba(0, 0, 0, 0.08), 0px -3px 0px 0px rgba(0, 0, 0, 0.04);
  box-shadow: 0px -1px 0px 0px rgba(0, 0, 0, 0.12),
    0px -2px 0px 0 rgba(0, 0, 0, 0.08), 0px -3px 0px 0px rgba(0, 0, 0, 0.04);

  position: relative;
  bottom: 0px !important;
  width: 100%;
  /* height: 65px; */
  z-index: 5;
}

@media only screen and (max-height: 480px) {
  .chat-responses,
  .chat-responses-float {
    min-height: calc(100vh - 130px);
  }

  .chat-responses-float-mobile {
    min-height: calc(var(--vh, 1vh) * 100 - 130px);
    height: calc(var(--vh, 1vh) * 100 - 130px);
  }
}

@media only screen and (max-width: 480px) {
  .v-footer,
  .chat-container,
  .teneo-dialog,
  .loading-ball {
    width: 100vw !important;
  }

  .teneo-footer {
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }

  .chat-responses,
  .chat-responses-float {
    min-height: calc(100vh - 130px);
  }

  .chat-responses-float-mobile {
    min-height: calc(var(--vh, 1vh) * 100 - 130px);
    height: calc(var(--vh, 1vh) * 100 - 130px);
  }
}
</style>
