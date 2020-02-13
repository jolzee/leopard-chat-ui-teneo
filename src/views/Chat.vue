<template>
  <v-container fluid id="chat-area" class="chat-container">
    <v-row no-gutters class="mx-0 px-0">
      <!-- <ChatNoHistory v-if="noHistory && isHistoryPage"></ChatNoHistory> -->

      <!-- show the listening modal when recognizing audio input -->
      <teneo-listening v-bind:value="listening" :message="$t('listening')"></teneo-listening>

      <v-col
        cols="12"
        class="pa-0"
        tabindex="0"
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
          <div aria-live="polite">
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
                  @handleFocus="handleFocus = true"
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
          </div>
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

    <ChatInput
      :toggleButton="showAudioInput"
      :passUserInput="userInput"
      :handleInputFocus="handleFocus"
      :sendParams="sendParams"
      :mustSend="mustSend"
      @reset="resetChatInputDirections"
      @scroll="scrollToBottom"
    ></ChatInput>

    <!-- end -->
    <!-- Date picker dialog -->
    <v-col cols="12" v-if="showDate" :key="'datePicker' + uuid">
      <v-dialog ref="dialogDate" v-model="showDate" :return-value.sync="date" width="290px">
        <v-date-picker header-color="primary" color="secondary" v-model="date" scrollable>
          <v-spacer></v-spacer>
          <v-btn small color="secondary" @click="showDate = false">Cancel</v-btn>
          <v-btn small color="success" @click="triggerSend">OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-col>

    <!-- <Dialog
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
    </Dialog>-->

    <!-- Time picker dialog -->
    <v-col cols="12" v-if="showTime" :key="'timePicker' + uuid">
      <v-dialog ref="dialogTime" v-model="showTime" width="290px">
        <v-card>
          <v-time-picker
            header-color="primary"
            color="secondary"
            v-model.lazy="userInput"
            format="24hr"
          ></v-time-picker>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="secondary" @click="showTime = false">Cancel</v-btn>
            <v-btn small color="success" @click="triggerSend">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-container>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Chat.vue");
import dayjs from "dayjs";
import { debounce } from "../utils/utils.js";
// import ChatBroadcastMessage from "../components/ChatBroadcastMessage";
// import ChatLoading from "../components/ChatLoading";
// import ChatNoHistory from "../components/ChatNoHistory";
// import Dialog from "../components/Dialog";
// import LiveChatResponse from "../components/LiveChatResponse";
import ChatTeneoResponse from "../components/ChatTeneoResponse";
import ChatUserQuestion from "../components/ChatUserQuestion";
import ChatInput from "../components/ChatInput";

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
  props: ["drawer"],
  components: {
    ChatBroadcastMessage: () => import("../components/ChatBroadcastMessage"),
    ChatLoading: () => import("../components/ChatLoading"),
    // Dialog: () => import("../components/Dialog"),
    // ChatNoHistory: () => import("../components/ChatNoHistory"),
    ChatUserQuestion,
    ChatTeneoResponse,
    ChatInput,
    Feedback: () => import("../components/Feedback"),
    LiveChatResponse: () => import("../components/LiveChatResponse")
  },

  data() {
    return {
      showAudioInput: false,
      userInput: "",
      handleFocus: false,
      sendParams: "",
      mustSend: false,
      showLeopardDialog: false,
      interval: {},
      mustScroll: true,
      oldDialogLength: 0,
      showDate: false,
      showTime: false,
      showFeedback: false,
      audioInFocus: false,
      date: ""
    };
  },
  watch: {
    date: function(newDate) {
      if (newDate !== "") {
        this.updateInputBox(dayjs(newDate).format("D MMMM YYYY"));
      }
    },
    storeUserInput: debounce(function(userInputStore) {
      console.log("User input in store has changed to:", userInputStore);
      if (this.userInput !== userInputStore) {
        this.userInput = userInputStore;
      }
    }, 500),
    dialog: function(newDialog) {
      if (newDialog.length !== this.oldDialogLength) {
        this.mustScroll = true;
        this.oldDialogLength = newDialog.length;
      }
    },
    showLiveChatProcessing: debounce(function(isLiveChatPersonTyping) {
      if (isLiveChatPersonTyping) {
        this.mustScroll = true;
      }
    }, 300)
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
  updated: debounce(function() {
    try {
      if (this.mustScroll) {
        this.mustScroll = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    } catch (e) {
      logger.debug(e);
      // do nothing
    }
  }, 200),
  mounted() {
    let siteFrame = document.getElementById("site-frame");
    if (!this.embed && !this.overlayChat && siteFrame) {
      setTimeout(() => {
        siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
      }, 1200);
    }
    this.$el.addEventListener("click", this.onHtmlClick);
    this.scrollToBottom();
  },
  beforeDestroy() {},
  methods: {
    resetChatInputDirections() {
      this.userInput = "";
      this.mustSend = false;
      this.sendParams = "";
      this.showDate = false;
      this.showTime = false;
      this.date = "";
    },
    updateInputBox(userInput) {
      logger.debug(`Updating Input Box`);
      this.userInput = userInput;
    },
    triggerSend(delay = 0) {
      setTimeout(() => {
        logger.debug(`Triggering send to Teneo`);
        this.mustSend = true;
      }, delay);
    },
    swapInputButton() {
      this.showAudioInput = !this.showAudioInput;
    },
    scrollToBottom() {
      logger.debug("Scroll to bottom");
      const endChatTarget = this.$refs.endChat;
      if (endChatTarget) {
        let scrollToElement = document.getElementById("teneo-chat-scroll");
        const options = {
          duration: 1200,
          offset: -50,
          easing: "easeInQuad",
          container: "#teneo-chat-scroll"
        };
        try {
          if (scrollToElement) {
            this.$vuetify.goTo(endChatTarget, options);
            let that = this;
            setTimeout(function() {
              scrollToElement = document.getElementById("teneo-chat-scroll");
              if (scrollToElement) {
                that.$vuetify.goTo(endChatTarget, {
                  duration: 500,
                  offset: 0,
                  easing: "easeInQuad",
                  container: "#teneo-chat-scroll"
                });
              }
            }, 1500);
          }
        } catch {}
      }
    },

    // hideKeyboard() {
    //   logger.debug(`Hiding virtual keyboard`);
    //   document.activeElement.blur();
    // },

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
        logger.debug(`Open Link in IFRAME`);
        // open in iframe
        event.stopPropagation();
        event.preventDefault();
        this.$store.commit("UPDATE_FRAME_URL", anchor.getAttribute("href"));
      } else {
        // send input
        event.stopPropagation();
        event.preventDefault();
        if (anchor.getAttribute("data-input")) {
          logger.debug(`Update input box with data-input attribute of link`);
          this.userInput = anchor.getAttribute("data-input");
        } else {
          logger.debug(`Update input box with text of link`);
          this.userInput = anchor.innerText;
        }
        this.sendParams = "&isClick=true";
        this.triggerSend(200);
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
  outline: 0;
}

#teneo-chat-scroll:focus {
  box-shadow: inset 0 0 0 1px rgba(17, 18, 25, 0.2) !important;
  outline: 0;
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
  margin-bottom: 2px;
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
  height: 67px !important;
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
