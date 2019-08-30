<template>
  <v-container
    fluid
    id="chat-area"
    class="chat-container"
  >

    <ChatNoHistory v-if="noHistory && isHistoryPage"></ChatNoHistory>

    <!-- show the listening modal when recognizing audio input -->
    <teneo-listening
      v-bind:value="listening"
      :message="$t('listening')"
    ></teneo-listening>

    <v-row
      class="mx-0"
      no-gutters
    >
      <v-col
        cols="12"
        class="pa-0"
        id="teneo-chat-scroll"
        :class="{'dark-scroll': $vuetify.theme.dark, 'light-scroll': !$vuetify.theme.dark, 'chat-responses-float': float, 'chat-responses': !float}"
        ref="chatContainer"
      >
        <!-- show the initial loding ball animation when first loading the chat window -->
        <ChatLoading v-if="showChatLoading"></ChatLoading>
        <v-expansion-panels
          readonly
          :value="getCurrentItem"
          class="chat-container-inner"
        >
          <transition-group
            name="chat-line-transition"
            enter-active-class="animated fadeIn"
          >
            <!-- item && hasCollection(item) -->
            <v-expansion-panel
              class="teneo-dialog pa-0"
              v-for="(item,i) in dialog"
              :key="i + 'itemsIter' + uuid"
              :class="{'mt-0 pb-0': (i === dialog.length - 1), 'pt-0': (i === 0)}"
            >
              <v-expansion-panel-header
                :hide-actions="true"
                class="px-4 pt-1 pb-1"
              >
                <v-container fluid>
                  <ChatBroadcastMessage :item="item"></ChatBroadcastMessage>

                  <LiveChatResponse :item="item"></LiveChatResponse>

                  <ChatTeneoResponse
                    :item="item"
                    :itemIndexInDialog="i"
                    @swapInputButton="swapInputButton"
                    @handleFocus="handleFocus"
                    @toggleDate="showDate = !showDate"
                    @toggleTime="showTime = !showTime"
                  ></ChatTeneoResponse>

                  <ChatUserQuestion
                    :item="item"
                    @clicked="updateInputBox"
                    @swapInputButton="swapInputButton"
                  ></ChatUserQuestion>
                </v-container>
              </v-expansion-panel-header>

            </v-expansion-panel>
          </transition-group>

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
            >Agent is typing a message..
              <ball-pulse-sync-loader
                color="#C2C2C2"
                size="10px"
              ></ball-pulse-sync-loader>
            </v-alert>

          </div>

        </v-expansion-panels>

      </v-col>
      <!-- Chat Footer - Input Field and Buttons -->
      <v-progress-linear
        :indeterminate="true"
        :active="progressBar"
        class="teneo-input-loading"
        color="accent"
        height="4"
      ></v-progress-linear>
    </v-row>
    <!-- // progressBar -->

    <v-row
      class="teneo-footer"
      :class="{'footer-float': float}"
      no-gutters
    >
      <v-col class="pt-2">
        <v-form
          v-model="valid"
          v-on:submit.prevent
          ref="userInputForm"
          style="height: 50px;"
        >
          <v-row no-gutters>
            <v-col
              cols="10"
              class="px-2"
            >
              <v-text-field
                id="teneo-input-field"
                v-show="!showUploadButton && !showUploadProgress"
                :disabled="progressBar"
                :append-icon="showAudioInput ? 'fa-angle-double-right' : ''"
                @click:append="sendUserInput"
                v-shortkey="{toggle1: ['ctrl', 'alt', '/'], toggle2: ['ctrl', 'alt', 'arrowdown']}"
                @shortkey.native="swapInputButton"
                :prepend-inner-icon="askingForPassword ? showPassword ? 'visibility' : 'visibility_off' : ''"
                :type="askingForPassword ? showPassword ? 'text' : 'password' : 'text'"
                @click:prepend-inner="showPassword = !showPassword"
                :rules="askingForEmail ? [rules.email(userInput)] : []"
                clearable
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
                :label="inputHelpText ? inputHelpText : askingForPassword ? $t('input.box.label.password') : askingForEmail ? $t('input.box.label.email') : $t('input.box.label')"
                single-line
                data-lpignore="true"
              ></v-text-field>
              <span
                v-shortkey="['esc']"
                @shortkey="stopAudioCapture"
              ></span>
            </v-col>
            <v-col cols="2">
              <upload-btn
                icon
                v-if="showUploadButton"
                :fileChangedCallback="fileChanged"
                large
                hover
                class="elevation-2 v-btn v-btn--contained v-btn--fab v-btn--round v-size--small primary white--text"
              >
                <template slot="icon">
                  <v-icon
                    dark
                    class="py-2"
                  >mdi-paperclip</v-icon>
                </template>
              </upload-btn>
              <v-progress-circular
                v-if="showUploadProgress"
                :rotate="360"
                :size="40"
                :width="10"
                :value="progressValue"
                color="accent"
                class=""
              >
              </v-progress-circular>
              <template v-if="!showUploadButton && !showUploadProgress">
                <v-btn
                  fab
                  :disabled="progressBar"
                  :loading="progressBar"
                  v-long-press="1000"
                  @long-press-start="swapInputButton"
                  v-if="!showAudioInput"
                  small
                  color="primary"
                  class="white--text elevation-2 mt-1"
                  @click.native="sendUserInput"
                >
                  <v-icon>fa-angle-double-right</v-icon>
                </v-btn>

                <v-btn
                  fab
                  :disabled="progressBar"
                  :loading="progressBar"
                  v-long-press="1000"
                  @long-press-start="swapInputButton"
                  small
                  v-if="showAudioInput"
                  v-shortkey="{recordAudioOne: ['ctrl', 'alt', '.'], recordAudioTwo: ['ctrl', 'alt', '`'], recordAudioThree: ['ctrl', 'alt', 'arrowup']}"
                  @shortkey.native="captureAudio"
                  :color="audioButtonColor"
                  :class="audioButtonClasses"
                  class="elevation-2 mt-1"
                  @click.native="captureAudio"
                >
                  <v-icon medium>fa-microphone-alt</v-icon>
                </v-btn>
              </template>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>

    <!-- end -->
    <!-- Date picker dialog -->
    <v-col
      cols="12"
      :key="'datePicker' + uuid"
    >
      <v-dialog
        ref="dialogDate"
        v-model="showDate"
        :return-value.sync="date"
        width="290px"
      >
        <v-date-picker
          v-model="date"
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn
            text
            color="primary"
            @click="showDate = false"
          >Cancel</v-btn>
          <v-btn
            text
            color="primary"
            @click="sendUserInput"
          >OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-col>

    <!-- Time picker dialog -->
    <v-col
      cols="12"
      :key="'timePicker' + uuid"
    >
      <v-dialog
        ref="dialogTime"
        v-model="showTime"
        width="290px"
      >
        <v-time-picker
          v-model="userInput"
          format="24hr"
        ></v-time-picker>
        <v-card>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="error"
              @click="showTime = false"
            >Cancel</v-btn>
            <v-btn
              color="success"
              @click="sendUserInput"
            >OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>

  </v-container>

</template>

<script>
import dayjs from "dayjs";
import LongPress from "vue-directive-long-press";
import ChatBroadcastMessage from "../components/ChatBroadcastMessage";
import ChatLoading from "../components/ChatLoading";
import ChatNoHistory from "../components/ChatNoHistory";
import ChatTeneoResponse from "../components/ChatTeneoResponse";
import ChatUserQuestion from "../components/ChatUserQuestion";
import LiveChatResponse from "../components/LiveChatResponse";
import UploadButton from "vuetify-upload-button";
import axios from "axios";
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
    ChatBroadcastMessage,
    ChatLoading,
    ChatNoHistory,
    ChatUserQuestion,
    ChatTeneoResponse,
    LiveChatResponse,
    "upload-btn": UploadButton
  },
  directives: {
    "long-press": LongPress
  },
  data() {
    return {
      interval: {},
      mustScroll: true,
      oldDialogLength: 0,
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "success",
      showDate: false,
      showPassword: false,
      showTime: false,
      showUploadProgress: false,
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
  computed: {
    ...mapGetters([
      "askingForPassword",
      "askingForEmail",
      "dialogs",
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
      "userInputReadyForSending",
      "responseIcon",
      "userIcon",
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
        return this.dialogs;
      } else {
        // history in session storage
        return this.getLatestDialogHistory;
      }
    }
  },
  updated: function() {
    try {
      if (this.mustScroll) {
        // oh man - Had to add a delay to reliably scroll to the bottom on dom update
        this.mustScroll = false;
        this.$nextTick(() => {
          this.srcollToBottom();
          setTimeout(this.srcollToBottom, 200);
          setTimeout(this.srcollToBottom, 200);
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
      console.log(e);
      // do nothing
    }
  },
  mounted() {
    this.$el.addEventListener("click", this.onHtmlClick);
    if (!this.isMobileDevice) {
      this.$refs.userInput.focus();
    } else {
      document.activeElement.blur();
    }
    this.srcollToBottom();
  },
  beforeDestroy() {},
  methods: {
    srcollToBottom() {
      let theChatScrollElement = document.getElementById("teneo-chat-scroll");
      theChatScrollElement.scrollBy({
        top: theChatScrollElement.scrollHeight,
        left: 0,
        behavior: "smooth"
      });
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

        axios({
          method: "post",
          url: config.postUrl,
          data: formData,
          config: { headers: { "Content-Type": "multipart/form-data" } }
        })
          .then(function(response) {
            //handle success
            console.log(response);
            if (config.reqUserInputSuccess) {
              self.$store.commit("SET_USER_INPUT", config.reqUserInputSuccess);
            }
            self.$store.dispatch(
              "sendUserInput",
              config.teneoSuccessQuery ? config.teneoSuccessQuery : ""
            );
          })
          .catch(function(response) {
            //handle error
            if (config.reqUserInputFailure) {
              self.$store.commit("SET_USER_INPUT", config.reqUserInputFailure);
            }
            self.$store.dispatch(
              "sendUserInput",
              config.teneoFailureQuery ? config.teneoFailureQuery : ""
            );
            console.log(response);
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
              console.log("Upload flag sent to Teneo");
            });

            // var reader = new FileReader();

            // reader.onload = function(e) {
            //   console.log(e.target.result);
            // };

            // reader.readAsDataURL(file);
          }
          return (this.progressValue = 0);
        }
        this.progressValue += 10;
      }, 300);
      // console.log(file);
    },

    stopAudioCapture() {
      this.$store.commit("HIDE_LISTENING_OVERLAY");
      this.$store.dispatch("stopAudioCapture");
      this.audioButtonColor = "success";
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
        this.audioButtonColor = "success";
        if (this.userInput.trim()) {
          this.$store.commit("SHOW_PROGRESS_BAR");
          this.showDate = false;
          this.showTime = false;
          this.date = "";
          this.srcollToBottom();
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
              this.userInput = err;
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
        window.hasOwnProperty("webkitSpeechRecognition") &&
        window.hasOwnProperty("speechSynthesis")
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
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function() {
          that.showAudioInput = !that.showAudioInput;
          that.$store.commit("TTS_ENABLE", that.showAudioInput);
        })
        .catch(function(err) {
          console.log(err);
          that.$store.commit(
            "SHOW_MESSAGE_IN_CHAT",
            "ASR input is not allowed. This could be because you're not loading this website over HTTPS or you have explicity denied microphone access in your browser. ASR and TTS is supported in Chrome."
          );
        });
    }
  }
};
</script>
<style scoped>
.loading-ball {
  width: 360px;
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
div#chat-area p {
  margin-bottom: 5px;
}

div.teneo-footer .v-input__control {
  height: 65px !important;
}

div.teneo-footer .v-input__slot {
  -webkit-box-shadow: unset !important;
  box-shadow: unset !important;
  background: transparent !important;
  /* padding-left: 5px !important; */
}

div.teneo-footer .v-text-field__details {
  position: absolute;
  margin-top: 35px;
}

div.chat-container .v-expansion-panel-header {
  cursor: unset !important;
  user-select: text;
}

button.v-expansion-panel-header:focus {
  background: unset;
  -webkit-box-shadow: unset !important;
  box-shadow: unset !important;
  color: transparent;
}

v-expansion-panel-header
  div.chat-container
  .v-expansion-panel:not(:first-child)::after {
  border-top: unset !important;
}

.v-expansion-panel:not(:first-child)::after {
  border-top: unset !important;
}

div.chat-container .v-expansion-panel-header--mousedown {
  -webkit-box-shadow: unset !important;
  box-shadow: unset !important;
}

div.chat-container .v-expansion-panel::before {
  -webkit-box-shadow: unset !important;
  box-shadow: unset !important;
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
  .chat-card {
    font-size: 1.1em;
    font-weight: 500;
    padding: 8px;
    margin-top: 4px;
    width: 260px;
    line-height: 1.2em;
  }
}

.chat-card {
  font-size: 1.1em;
  font-weight: 500;
  padding: 8px;
  margin-top: 4px;
  line-height: 1.2em;
  width: fit-content;
}

.chat-card-left {
  border-radius: 3px 13px 13px 13px;
  -moz-border-radius: 3px 13px 13px 13px;
  -webkit-border-radius: 3px 13px 13px 13px;
}

.chat-card-right {
  border-radius: 13px 3px 13px 13px;
  -moz-border-radius: 13px 3px 13px 13px;
  -webkit-border-radius: 13px 3px 13px 13px;
  margin-left: auto;
}

div.options-list a.v-list__tile--link {
  cursor: pointer;
  height: inherit !important;
}

.teneo-response-icon {
  margin-left: 0px;
  margin-right: 5px;
}

.teneo-userinput-icon {
  margin-right: 0px;
  margin-left: 5px;
}

.teneo-dialog {
  width: 360px;
  max-width: none;
  border-top: unset !important;
  padding-left: 10px;
  padding-right: 10px;
}

.chat-responses-float {
  min-height: calc(80vh - 130px);
  max-height: calc(80vh - 130px);
  height: calc(80vh - 130px);
  /* height: calc(var(--vh, 1vh) * 80 - 130px); */
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-responses {
  min-height: calc(100vh - 130px);
  /* min-height: calc(var(--vh, 1vh) * 100 - 130px); */
  max-height: calc(100vh - 130px);
  /* max-height: calc(var(--vh, 1vh) * 100 - 130px); */
  height: calc(100vh - 130px);
  /* height: calc(var(--vh, 1vh) * 100 - 130px); */
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
  height: 65px;
  z-index: 5;
}

@media only screen and (max-width: 480px) {
  .v-footer,
  .chat-container,
  .teneo-dialog,
  .loading-ball {
    width: 100vw !important;
  }

  .chat-responses,
  .chat-responses-float {
    min-height: calc(100vh - 125px);
    /* min-height: calc(var(--vh, 1vh) * 100 - 125px); */
  }
}
</style>