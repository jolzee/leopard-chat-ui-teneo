<template>
  <v-container fluid grid-list-s id="chat-area" ref="chatContainer" v-bind:class="{ 'dark-scroll': dark, 'light-scroll': !dark,  'chat-container': true}">
    <v-layout v-if="noHistory && isHistoryPage">
      <v-flex xs12>
        <v-card>
          <v-card-media :src="noHistoryImage" height="280px" class="elevation-4">
          </v-card-media>
          <v-card-title primary-title>
            <v-card-text>
              <div class="text-xs-center">
                <h3 class="headline mb-2 text-xs-center">{{ $t('no.chat.history.title') }}</h3>
                <div class="text-xs-center">{{ $t('no.chat.history.body') }}</div>
              </div>
            </v-card-text>
          </v-card-title>
          <v-layout justify-center class="pb-3">
            <v-card-actions>
              <v-btn dark color="primary" :to="{name: 'chat'}">{{ $t('menu.chat') }}</v-btn>
              <v-btn dark color="primary" :to="{name: 'help'}">{{ $t('menu.help') }}</v-btn>
              <v-btn dark color="primary" :to="{name: 'about'}">{{ $t('menu.about') }}</v-btn>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- show the listening modal when recognizing audio input -->
    <teneo-listening v-bind:value="listening" :message="$t('listening')"></teneo-listening>

    <!-- show the initial loding ball animation when first loading the chat window -->
    <div class="text-xs-center mt-3" v-if="showChatLoading">
      <v-layout row justify-center>
        <v-container fill-height class="centered-dialog">
          <v-layout column justify-center align-center>
            <ball-scale-ripple-multiple-loader color="#C2C2C2" size="80px"></ball-scale-ripple-multiple-loader>
          </v-layout>
        </v-container>
      </v-layout>
    </div>

    <v-layout column>
      <v-expansion-panel focusable>
        <transition-group name="chat-line-transition" enter-active-class="animated zoomIn">
          <v-expansion-panel-content class="teneo-dialog" v-for="(item,i) in dialog" :key="i" :hide-actions="(item && !hasCollection(item)) || (i <= dialog.length)" :value="item && hasCollection(item)">

            <div slot="header">
              <v-container grid-list-xs fluid>
                <!-- Live Chat Queue -->
                <div v-if="item.type === 'liveChatQueue'">
                  <v-alert :value="true" color="info" icon="fa-clock">
                    {{item.text}}
                  </v-alert>
                </div>
                <!-- Live Chat Status -->
                <div v-if="item.type === 'liveChatStatus'">
                  <v-alert :value="true" color="info" icon="fa-thumbs-up">
                    {{item.text}}
                  </v-alert>
                </div>
                <div v-if="item.type === 'liveChatEnded'">
                  <v-alert :value="true" color="info" icon="fa-hand-paper">
                    {{item.text}}
                  </v-alert>
                </div>
                <!-- Live Chat Response -->
                <v-layout row v-if="item.type === 'liveChatResponse'">
                  <v-flex xs2 class="text-xs-left mr-2">
                    <v-avatar size="40px" color="grey lighten-4 elevation-6 mx-2">
                      <img :src="item.agentAvatar" :alt="item.agentName">
                    </v-avatar>
                  </v-flex>
                  <v-flex>
                    <v-card class="chat-card text-xs-left px-2" :dark="dark">
                      <v-container grid-list-s>
                        <v-layout row>
                          <v-flex>
                            <div>
                              <span v-html="item.text" class="teneo-reply"></span>
                            </div>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card>
                  </v-flex>
                </v-layout>
                <!-- Reply -->
                <div v-if="item.type === 'reply'">
                  <v-layout row>
                    <v-flex xs2 class="text-xs-left mr-2">
                      <v-btn color="secondary" fab small>
                        <v-icon class="white--text">{{responseIcon}}</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex>
                      <v-card class="chat-card text-xs-left px-2" :dark="dark">
                        <span v-html="item.text" class="teneo-reply"></span>
                      </v-card>
                    </v-flex>
                  </v-layout>
                  <!-- more info & calendar picker -->
                  <v-layout row>
                    <v-flex xs12 class="text-xs-right" v-if="item.hasExtraData && !hasCollection(item) && notLiveChatTranscript(item)">
                      <v-btn class="mr-0" color="success" @click="showModal(item)">{{ $t('more.button') }}
                        <v-icon right small color="white">fa-angle-double-up</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex class="text-xs-right" xs12 v-if="mustShowDate(item) && (i === dialog.length - 1)">
                      <v-btn small fab="" color="info" @click="showDate = !showDate">
                        <v-icon>fa-calendar-alt</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </div>

                <!-- user question -->
                <v-layout row v-if="item.type === 'userInput'">
                  <v-flex xs11>
                    <v-card color="primary white--text" class="chat-card text-xs-right">
                      <v-container fluid grid-list-s>
                        <v-layout row>
                          <v-flex>
                            <div class="pr-2">{{item.text}}
                            </div>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-card>
                  </v-flex>
                  <v-flex class="text-xs-right">
                    <v-btn fab small color="primary white--text" @click="updateInputBox(item.text)">
                      <v-icon color="white">{{userIcon}}</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>

              </v-container>
              <!-- live chat typing -->
            </div>

            <!-- show any options in the response: for example Yes, No Maybe -->
            <v-card v-if="hasCollection(item) && (i === dialog.length - 1)" class="text-xs-center">
              <v-card-text>
                <h2 v-text="getOptions(item).title"></h2>
                <v-btn color="success" v-for="(option,i) in getOptions(item).items" :key="i" @click="optionClicked(option.name)">{{option.name}}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>

        </transition-group>

        <!--<div class="text-xs-center mt-3" v-if="liveChatMessage">{{ liveChatMessage }}</div>-->
        <div class="text-xs-center my-3" v-if="showLiveChatProcessing">
          <ball-pulse-sync-loader color="#C2C2C2" size="10px"></ball-pulse-sync-loader>
        </div>

      </v-expansion-panel>
    </v-layout>

    <!-- Date picker dialog -->
    <v-flex xs12 key="datePicker">
      <v-dialog ref="dialogDate" v-model="showDate" :return-value.sync="date" lazy width="290px">
        <v-date-picker v-model="date" scrollable :min="moment().format('YYYY-MM-DD')">
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="showDate = false">Cancel</v-btn>
          <v-btn flat color="primary" @click="sendUserInput">OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-flex>
    <!-- text & audio input area -->
    <v-footer fixed app height="65" class="teneo-footer" inset>
      <v-container fluid grid-list-sm>
        <v-layout row>
          <v-flex xs12 pl-3>
            <v-divider></v-divider>
            <v-text-field v-shortkey="['ctrl', 'alt', '/']" @shortkey.native="swapInputButton" clearable auto-grow solo name="userInput" ref="userInput" @keyup.enter="sendUserInput" v-model.trim="userInput" :label="$t('input.box.label')" single-line></v-text-field>
          </v-flex>
          <v-flex>
            <v-btn fab v-if="!showAudioInput" small color="primary" class="white--text" @click="sendUserInput">
              <v-icon>fa-angle-double-right</v-icon>
            </v-btn>
            <v-btn fab small v-if="showAudioInput" v-shortkey="['ctrl', 'alt', '.']" @shortkey.native="captureAudio" :color="audioButtonColor" :class="audioButtonClasses" @click="captureAudio">
              <v-icon>mic</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-footer>
    <div id="scroll-end" ref="pageBottom"></div>
    <v-snackbar v-model="snackbar" bottom :timeout="snackbarTimeout" auto-height>
      {{ $t('empty.user.input') }} 😉
    </v-snackbar>
  </v-container>

</template>

<script>
import moment from "moment";

if (window.Element && !Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    let matches = (this.document || this.ownerDocument).querySelectorAll(s),
      i,
      el = this;
    do {
      i = matches.length;
      while (--i >= 0 && matches.item(i) !== el) {}
    } while (i < 0 && (el = el.parentElement));
    return el;
  };
}

export default {
  data() {
    return {
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "success",
      snackbar: false,
      snackbarTimeout: 1500,
      showDate: false,
      date: ""
    };
  },
  computed: {
    isHistoryPage() {
      return this.$route.name === "history";
    },
    noHistory() {
      let history = this.$store.getters.getChatHistorySessionStorage;
      return history.length === 0;
    },
    noHistoryImage() {
      return require("../assets/history.png");
    },
    showChatLoading() {
      return this.$store.getters.showChatLoading;
    },
    showLiveChatProcessing() {
      return this.$store.getters.showLiveChatProcessing;
    },
    liveChatMessage() {
      return this.$store.getters.liveChatMessage;
    },
    responseIcon() {
      return this.$store.state.responseIcon;
    },
    userIcon() {
      return this.$store.state.userIcon;
    },
    dark() {
      return this.$store.getters.dark;
    },
    dialog() {
      if (this.$route.name === "chat") {
        return this.$store.getters.getChatHistory;
      } else {
        // history in session storage
        return this.$store.getters.getChatHistorySessionStorage;
      }
    },
    listening() {
      return this.$store.state.listening;
    },
    userInput: {
      get: function() {
        if (this.date !== "") {
          this.updateInputBox(moment(this.date).format("Do MMMM YYYY"));
        }
        if (this.$store.state.userInputReadyForSending) {
          this.$store.state.userInputReadyForSending = false;
          this.sendUserInput();
          this.audioButtonColor = "success";
        }
        return this.$store.getters.getUserInput;
      },
      set: function(userInput) {
        this.$store.commit("setUserInput", userInput);
      }
    }
  },
  updated: function() {
    try {
      this.$SmoothScroll(
        this.$refs.pageBottom,
        2000,
        null,
        this.$refs.chatContainer
      );
      this.$refs.userInput.focus();
    } catch (e) {
      // do nothing
    }
    // setTimeout(this.hideProgressBar, 2700);
  },
  mounted() {
    this.$el.addEventListener("click", this.onHtmlClick);
    this.$refs.userInput.focus();
  },
  methods: {
    onHtmlClick(event) {
      // Find the closest anchor to the target.
      const anchor = event.target.closest("a");
      if (!anchor) return;

      // Check to make sure this is from our v-html because
      // we don't want to handle clicks from other things in
      // the Vue
      if (!anchor.classList.contains("sendInput")) return;

      event.stopPropagation();
      event.preventDefault();
      this.updateInputBox(anchor.innerText);
      this.sendUserInput();
    },
    updateInputBox(userInput) {
      this.$store.commit("setUserInput", userInput);
      this.$refs.userInput.focus();
    },
    hideProgressBar() {
      this.$store.commit("hideProgressBar");
    },
    mustShowDate(item) {
      if (
        decodeURIComponent(item.teneoResponse.extraData.datePicker) !==
        "undefined"
      ) {
        return true;
      }
      return false;
    },
    hasCollection(item) {
      if (item.hasExtraData && item.type === "reply") {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name === "displayCollection") {
            return true;
          }
        }
      }
      return false;
    },
    notLiveChatTranscript(item) {
      let transcript = decodeURIComponent(
        item.teneoResponse.extraData.liveChat
      );
      return transcript === "undefined";
    },
    getOptions(item) {
      if (item.hasExtraData) {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name === "displayCollection") {
            return action.parameters.content;
          }
        }
      }
      return {};
    },
    sendUserInput() {
      if (this.$store.getters.getUserInput) {
        this.$store.commit("showProgressBar");
        this.showDate = false;
        this.date = "";
        this.$store
          .dispatch("sendUserInput")
          .then(this.$refs.userInput.focus());
      } else {
        this.snackbar = true;
      }
      this.$refs.userInput.focus();
    },
    optionClicked(optionValue) {
      this.$store.commit("showProgressBar");
      this.$store.commit("setUserInput", optionValue);
      this.$store
        .dispatch("sendUserInput", optionValue)
        .then(this.$refs.userInput.focus());
    },
    showModal(item) {
      this.$store.commit("showModal", item);
    },
    captureAudio() {
      if (
        window.hasOwnProperty("webkitSpeechRecognition") &&
        window.hasOwnProperty("speechSynthesis")
      ) {
        this.$store.commit("hideModal");
        this.audioButtonColor = "error";
        this.audioButtonClasses = "white--text";
        this.$store.commit("showListening");
        this.$store.dispatch("captureAudio");
      }
    },
    swapInputButton() {
      console.log("Entering listening mode...");
      this.showAudioInput = !this.showAudioInput;
      this.$store.commit("speakBackResponses", this.showAudioInput);
    }
  }
};
</script>

<style>
span.teneo-reply ul {
  padding-left: 17px !important;
}

.teneo-footer {
  padding-top: 8px;
}

.teneo-dialog {
  width: 360px;
  padding: 0px;
}
</style>
<style scoped>
#chat-area {
  overflow-x: hidden !important;
}

.light-scroll::-webkit-scrollbar {
  height: 14px;
  width: 14px;
  background: #ffffff;
}

.dark-scroll::-webkit-scrollbar {
  height: 14px;
  width: 14px;
  background: #424242;
}

::-webkit-scrollbar-thumb {
  background: #2196f3;
  -webkit-border-radius: 2ex;
  -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
}

::-webkit-scrollbar-corner {
  background: black;
}

.chat-card {
  font-size: 16px !important;
  font-weight: 500;
  padding: 5px;
  margin-top: 6px;
}

.v-snack {
  width: 360px;
  text-align: center;
  left: auto !important;
}

.v-footer {
  width: 360px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  left: auto !important;
}

.chat-container {
  overflow-y: auto;
  height: calc(100vh - 130px);
  width: 360px;
}

.container {
  padding: 0 !important;
  display: block;
}
</style>