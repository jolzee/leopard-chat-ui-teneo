<template>
  <v-row class="teneo-footer" :class="{ 'footer-float': float }" no-gutters>
    <v-col>
      <v-form ref="userInputForm" v-model="valid" @submit.prevent>
        <v-container class="fill-height py-0">
          <v-row no-gutters align="center" justify="center">
            <v-col class="text-center">
              <v-text-field
                v-show="textFieldShowCondition"
                id="teneo-input-field"
                ref="userInput"
                v-model.lazy="userInput"
                v-shortkey="{
                  toggle1: ['ctrl', 'alt', '/'],
                  toggle2: ['ctrl', 'alt', 'arrowdown']
                }"
                v-mask="determineMask"
                aria-label="Chat bot send message"
                :disabled="textFieldDisabledCondition"
                :prepend-inner-icon="innerIconCondition"
                :type="determineFieldType"
                :rules="inputRules"
                :clearable="!isUserInputEmpty"
                clear-icon="mdi-comment-remove-outline"
                auto-grow
                color="sendButton"
                required
                solo
                tabindex="0"
                return-masked-value
                name="userInput"
                autocomplete="off"
                :label="determineLabelText"
                single-line
                data-lpignore="true"
                @shortkey.native="swapInputButton"
                @click:prepend-inner="toggleShowPassword()"
                @keydown.enter.prevent="sendUserInput()"
              >
                <template v-if="showAudioInput" v-slot:append>
                  <v-btn
                    :disabled="isUserInputEmpty"
                    aria-label="Send Question to Chat Bot"
                    large
                    tabindex="0"
                    text
                    icon
                    ripple
                    @click="sendUserInput"
                  >
                    <v-icon color="sendButton">mdi-send</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
              <span v-shortkey="['esc']" @shortkey="stopAudioCapture"></span>
            </v-col>
            <v-col cols="3" sm="2" class="text-center">
              <upload-btn
                v-if="showUploadButton"
                icon
                tabindex="0"
                aria-label="Select File for Upload"
                large
                hover
                color="sendButton"
                class="elevation-2 v-btn v-btn--fab v-btn--round v-size--small sendButton white--text mt-3"
                @file-update="fileChanged"
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
              <template v-if="notUploadingCondition">
                <v-btn
                  v-if="!showAudioInput"
                  v-long-press="1000"
                  text
                  icon
                  tabindex="0"
                  :disabled="isUserInputEmpty"
                  :loading="progressBar"
                  aria-label="Send"
                  large
                  @long-press-start="swapInputButton"
                  @click.native="sendUserInput"
                >
                  <v-icon color="sendButton">mdi-send</v-icon>
                </v-btn>

                <v-btn
                  v-if="showAudioInput"
                  v-long-press="1000"
                  v-shortkey="{
                    recordAudioOne: ['ctrl', 'alt', '.'],
                    recordAudioTwo: ['ctrl', 'alt', '`'],
                    recordAudioThree: ['ctrl', 'alt', 'arrowup']
                  }"
                  tabindex="0"
                  aria-label="Send"
                  :disabled="progressBar"
                  :loading="progressBar"
                  ripple
                  :color="audioButtonColor"
                  :class="!$vuetify.theme.dark ? 'white--text' : 'black--text'"
                  small
                  fab
                  @long-press-start="swapInputButton"
                  @shortkey.native="captureAudio"
                  @click.native="captureAudio"
                >
                  <v-icon>{{ listening ? "mdi-ear-hearing" : "mdi-voice" }}</v-icon>
                </v-btn>
              </template>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";
import UploadButton from "vuetify-upload-button";
import LongPress from "vue-directive-long-press";
import { mask } from "vue-the-mask";

const logger = require("@/utils/logging").getLogger("ChatInput.vue");
const mobile = require("is-mobile");
const superagent = require("superagent");

export default {
  name: "ChatInput",
  directives: {
    "long-press": LongPress,
    mask
  },
  components: {
    "upload-btn": UploadButton
  },
  props: {
    passUserInput: {
      type: String,
      required: true
    },
    toggleButton: {
      type: Boolean,
      required: true
    },
    handleInputFocus: {
      type: Boolean,
      required: true
    },
    sendParams: {
      type: Boolean,
      required: true
    },
    mustSend: {
      type: Boolean,
      required: true
    },
    drawer: {
      type: Boolean,
      required: true
    }
  },
  data: () => ({
    nomask: {
      mask: "*".repeat(333),
      tokens: {
        "*": { pattern: /./ }
      }
    },
    userInput: "",
    interval: {},
    showAudioInput: false,
    audioButtonColor: "sendButton",
    showUploadProgress: false,
    audioInFocus: false,
    progressValue: 0,
    showPassword: false,
    rules: {
      required: value => !!value || "Required.",
      counter: value => value.length <= 20 || "Max 20 characters",
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid e-mail.";
      }
    },
    valid: false
  }),
  computed: {
    ...mapGetters([
      "askingForPassword",
      "askingForEmail",
      "getLatestDialogHistory",
      "dialogs",
      "dark",
      "float",
      { userInput: "storeUserInput" },
      "inputHelpText",
      "isMobileDevice",
      "itemInputMask",
      "progressBar",
      "showUploadButton",
      "userInputReadyForSending",
      "uuid",
      "listening",
      "uploadConfig"
    ]),
    determineFieldType() {
      return this.askingForPassword ? (this.showPassword ? "text" : "password") : "text";
    },
    determineLabelText() {
      return this.inputHelpText
        ? this.inputHelpText
        : this.askingForPassword
        ? this.$t("input.box.label.password")
        : this.askingForEmail
        ? this.$t("input.box.label.email")
        : this.$t("input.box.label");
    },
    innerIconCondition() {
      return this.askingForPassword ? (this.showPassword ? "mdi-eye" : "mdi-eye-off") : "";
    },
    determineMask() {
      return this.itemInputMask || this.nomask;
    },
    notUploadingCondition() {
      return !this.showUploadButton && !this.showUploadProgress;
    },
    textFieldShowCondition() {
      return !this.showUploadButton && !this.showUploadProgress;
    },
    textFieldDisabledCondition() {
      return this.progressBar || this.drawer;
    },
    shouldDisableSend() {
      return this.progressBar || this.userInput === "" || this.userInput === null;
    },
    inputRules() {
      return this.askingForEmail ? [this.rules.email(this.userInput)] : [];
    },
    isUserInputEmpty() {
      return this.userInput === null || this.userInput.trim() === "";
    },
    storeUserInput() {
      return this.$store.getters.userInput;
    }
  },
  watch: {
    storeUserInput(storeInput) {
      if (this.userInput !== storeInput) {
        this.userInput = storeInput;
      }
    },
    drawer(newDrawer) {
      if (!newDrawer) {
        this.handleFocus();
      }
    },
    dialogs() {
      this.handleFocus();
    },
    mustSend(mustSend) {
      if (mustSend) {
        this.valid = true;
        this.sendUserInput();
      }
    },
    handleInputFocus(shouldFocus) {
      if (shouldFocus) {
        this.handleFocus();
      }
    },
    toggleButton() {
      this.swapInputButton();
    },
    passUserInput(newInput) {
      if (newInput) {
        this.userInput = newInput;
      }
    },
    userInputReadyForSending(readyForSend) {
      if (readyForSend) {
        this.valid = true;
        this.sendUserInput();
      }
    }
  },
  mounted() {
    this.handClearIconClick();
    const element = this.$el.querySelector("#teneo-input-field");

    if (!this.isMobileDevice) {
      if (element) {
        this.$nextTick(() => {
          // this.$refs.userInput.focus(); // possibly duplicated below
          element.addEventListener("focusin", e => e.stopPropagation()); // to stop flickering
          element.focus();
        });
      }
    } else {
      element.addEventListener("focusin", e => e.stopPropagation()); // to stop flickering
      document.activeElement.blur();
    }
  },
  created() {
    logger.info(`Chat Input Created`);
    this.handleFocus();
  },

  methods: {
    handClearIconClick() {
      const clearElements = document.getElementsByClassName("v-icon--link");
      clearElements.forEach(clearElement => {
        const parentEl = clearElement.parentElement;
        if (parentEl.classList.contains("v-input__icon--clear")) {
          clearElement.tabIndex = 0;
          clearElement.setAttribute("aria-label", "Clear Chat");
          clearElement.addEventListener("keyup", event => {
            event.preventDefault();
            if (event.keyCode === 13) {
              clearElement.click();
            }
          });
        }
      });
    },
    hideProgressBar() {
      this.$store.commit("HIDE_PROGRESS_BAR");
    },
    sendUserInput() {
      if (this.valid) {
        logger.debug("Input Box is Valid");
        this.$store.commit("HIDE_CHAT_MODAL"); // hide all modals
        this.$store.commit("SET_USER_INPUT", this.userInput);
        this.audioButtonColor = "sendButton";
        if (this.userInput && this.userInput.trim()) {
          this.$store.commit("SHOW_PROGRESS_BAR");
          this.$store
            .dispatch("sendUserInput", this.sendParams)
            .then(() => {
              // this.hideProgressBar();
              // this.userInput = "";
              // this.$refs.userInputForm.resetValidation();
              // this.handleFocus();
              this.$emit("reset");
              // this.$emit("changeKey");
            })
            .catch(err => {
              logger.error("Error Sending User Input", err);
            });
        }
      }
    },
    handleFocus() {
      setTimeout(() => {
        const theInputElement = document.getElementById("teneo-input-field");
        if (theInputElement && !this.isMobileDevice) {
          // this.$refs.userInput.focus();
          theInputElement.focus();
          logger.debug(`Handling focus`);
        } else if (
          theInputElement &&
          this.isMobileDevice &&
          document.activeElement === theInputElement
        ) {
          document.activeElement.blur();
        }
      }, 300);
    },
    toggleShowPassword() {
      logger.debug("Toggeling Password");
      this.showPassword = !this.showPassword;
    },
    captureAudio() {
      if (
        Object.prototype.hasOwnProperty.call(window, "webkitSpeechRecognition") &&
        Object.prototype.hasOwnProperty.call(window, "speechSynthesis")
      ) {
        this.$store.commit("HIDE_CHAT_MODAL");
        this.audioButtonColor = "error";
        this.$store.commit("SHOW_LISTING_OVERLAY");
        this.$store.dispatch("captureAudio");
        logger.debug("Triggering ASR capture");
      }
    },
    swapInputButton() {
      logger.debug(`Toggeling Input Button/Mic`);
      // check if we have access to the mic
      const that = this;

      if (navigator && navigator.mediaDevices && !mobile()) {
        const isChrome =
          /Chrome/.test(navigator.userAgent) &&
          !/ OPR/.test(navigator.userAgent) &&
          /Google Inc/.test(navigator.vendor);
        if (isChrome) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => {
              that.showAudioInput = !that.showAudioInput;
              that.$store.commit("TTS_ENABLE", that.showAudioInput);
            })
            .catch(err => {
              logger.debug("ASR input is not allowed", err);
              that.$store.commit(
                "SHOW_MESSAGE_IN_CHAT",
                "ASR input is not allowed. Possible reasons: website not running over HTTPS, you have denied microphone access or the chat UI has been loaded form a different domain that the website."
              );
            });
        }
      }
    },
    updateInputBox(userInput) {
      logger.debug(`Updating Input Box`);
      this.userInput = userInput;
      if (!this.isMobileDevice) {
        this.$refs.userInput.focus();
      } else {
        document.activeElement.blur();
      }
    },
    stopAudioCapture() {
      logger.debug(`Stopping audio capture`);
      this.$store.commit("HIDE_LISTENING_OVERLAY");
      this.$store.dispatch("stopAudioCapture");
      this.audioButtonColor = "sendButton";
    },
    fileChanged(file) {
      logger.debug(`File Changed`);
      this.$store.commit("HIDE_UPLOAD_BUTTON");
      this.showUploadProgress = true;
      let successfullUpload = true;
      let performedActualUpload = false;
      let uploadProgress = 0;
      if (this.uploadConfig && Object.keys(this.uploadConfig).length) {
        performedActualUpload = true;
        const config = this.uploadConfig.parameters;
        const formData = new FormData();

        formData.append(config.postFileNameParam, file);
        if (config.postParams) {
          Object.entries(config.postParams).forEach(entry => {
            formData.append(entry[0], entry[1]);
          });
        }

        const self = this;
        let postResultQueryParam = "";
        superagent
          .post(config.postUrl)
          .send(formData)
          .then(res => {
            logger.debug(`Upload response code: ${res.status}`);
            uploadProgress = 100;
            // logger.debug(res);
            postResultQueryParam = `&uploadResponse=${btoa(res.text)}`;
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
          .catch(theErr => {
            uploadProgress = 100;
            successfullUpload = false;
            // handle error
            if (config.reqUserInputFailure) {
              self.$store.commit("SET_USER_INPUT", config.reqUserInputFailure);
            }
            self.$store.dispatch(
              "sendUserInput",
              config.teneoFailureQuery
                ? config.teneoFailureQuery + postResultQueryParam
                : postResultQueryParam
            );
            logger.error(`Could not upload file`, theErr);
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
        if (this.progressValue === 100 || uploadProgress === 100) {
          clearInterval(this.interval);
          this.showUploadProgress = false;
          if (!performedActualUpload) {
            if (!this.config) {
              if (successfullUpload) {
                this.$store.commit(
                  "SHOW_MESSAGE_IN_CHAT",
                  `Thanks we have successfully received your file: ${file.name}`
                );
                this.$store.dispatch("sendUserInput").then(() => {
                  logger.debug("Upload flag sent to Teneo");
                });
              } else {
                this.$store.commit(
                  "SHOW_MESSAGE_IN_CHAT",
                  `There was a problem uploading your file: ${file.name}`
                );
              }
            }
          }
          this.progressValue = 0;
          return;
        }
        this.progressValue += 10;
      }, 300);
      logger.debug(file);
    }
  }
};
</script>
<style></style>
