<template>
  <v-container
    fluid
    grid-list-s
    id="chat-area"
    class="chat-container"
  >
    <v-layout v-if="noHistory && isHistoryPage">
      <v-flex xs12>
        <v-card>
          <v-img
            :src="noHistoryImage"
            class="elevation-4"
          ></v-img>
          <v-card-title primary-title>
            <v-card-text>
              <div class="text-xs-center">
                <h3 class="headline mb-2 text-xs-center">{{ $t('no.chat.history.title') }}</h3>
                <div class="text-xs-center">{{ $t('no.chat.history.body') }}</div>
              </div>
            </v-card-text>
          </v-card-title>
          <v-layout
            justify-center
            class="pb-3"
          >
            <v-card-actions>
              <v-btn
                dark
                color="primary"
                :to="{name: 'chat'}"
              >{{ $t('menu.chat') }}</v-btn>
              <v-btn
                dark
                color="primary"
                :to="{name: 'help'}"
              >{{ $t('menu.help') }}</v-btn>
              <v-btn
                dark
                color="primary"
                :to="{name: 'about'}"
              >{{ $t('menu.about') }}</v-btn>
            </v-card-actions>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- show the listening modal when recognizing audio input -->
    <!-- start -->
    <teneo-listening
      v-bind:value="listening"
      :message="$t('listening')"
    ></teneo-listening>

    <v-layout
      align-space-between
      justify-space-between
      column
      fill-height
    >
      <v-flex
        xs12
        :class="{'dark-scroll': dark, 'light-scroll': !dark, 'chat-responses-float': this.$store.getters.float, 'chat-responses': !this.$store.getters.float}"
        ref="chatContainer"
      >
        <!-- show the initial loding ball animation when first loading the chat window -->

        <v-layout
          row
          wrap
          justify-center
          align-center
          class="loading-ball text-xs-center mt-3"
          v-if="showChatLoading"
        >
          <v-flex xs12>
            <line-scale-loader
              color="#C2C2C2"
              size="60px"
            ></line-scale-loader>
          </v-flex>
        </v-layout>
        <v-expansion-panel
          :value="getOpenedItem"
          class="chat-container-inner"
        >
          <transition-group
            name="chat-line-transition"
            enter-active-class="animated zoomIn"
          >
            <!-- item && hasCollection(item) -->
            <v-expansion-panel-content
              class="teneo-dialog"
              v-for="(item,i) in dialog"
              :key="i + 'itemsIter'"
              :hide-actions="true"
            >

              <div slot="header">
                <v-container
                  grid-list-xs
                  fluid
                >
                  <!-- Live Chat Queue -->
                  <div v-if="item.type === 'liveChatQueue'">
                    <v-alert
                      :value="true"
                      color="info"
                      icon="fa-clock"
                    >
                      {{item.text}}
                    </v-alert>
                  </div>
                  <!-- Live Chat Status -->
                  <div v-if="item.type === 'liveChatStatus'">
                    <v-alert
                      :value="true"
                      color="info"
                      icon="fa-thumbs-up"
                    >
                      {{item.text}}
                    </v-alert>
                  </div>
                  <div v-if="item.type === 'liveChatEnded'">
                    <v-alert
                      :value="true"
                      color="info"
                      icon="fa-hand-paper"
                    >
                      {{item.text}}
                    </v-alert>
                  </div>
                  <!-- Live Chat Response -->
                  <v-layout
                    row
                    v-if="item.type === 'liveChatResponse'"
                  >
                    <v-flex
                      xs2
                      class="text-xs-left mr-2"
                    >
                      <v-avatar
                        size="40px"
                        color="grey lighten-4 elevation-6 mx-2"
                      >
                        <img
                          :src="item.agentAvatar"
                          :alt="item.agentName"
                        >
                      </v-avatar>
                    </v-flex>
                    <v-flex>
                      <v-card
                        class="chat-card text-xs-left px-2"
                        :dark="dark"
                      >
                        <v-container grid-list-s>
                          <v-layout row>
                            <v-flex>
                              <div>
                                <span
                                  v-html="item.text"
                                  class="teneo-reply"
                                ></span>
                              </div>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card>
                    </v-flex>
                  </v-layout>
                  <!-- end live chat reply -->
                  <!-- Reply -->
                  <template v-if="item.type === 'reply'">
                    <v-layout
                      align-start
                      justify-start
                      row
                      fill-height
                    >
                      <v-flex
                        xs2
                        class="text-xs-left mr-2"
                      >
                        <v-btn
                          v-long-press="swapInputButton"
                          color="secondary"
                          fab
                          small
                        >
                          <v-icon class="white--text">{{responseIcon}}</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex shrink>
                        <v-card
                          class="chat-card text-xs-left px-2"
                          :dark="dark"
                        >
                          <span
                            v-html="itemText(item)"
                            class="teneo-reply"
                          ></span>
                        </v-card>
                      </v-flex>
                    </v-layout>
                    <!-- show any options in the response: for example Yes, No Maybe -->
                    <v-card
                      flat
                      v-if="hasCollection(item) && ((i === dialog.length - 1) || hasPermanentOptions(item))"
                      class="text-xs-center"
                      width="320px"
                    >
                      <v-card-text v-if="!hasLongOptions(item)">
                        <h2 v-text="getOptions(item).title"></h2>
                        <div
                          v-if="getOptions(item).html"
                          class="elevation-5 mt-2"
                          v-html="getOptions(item).items"
                        >
                        </div>
                        <span
                          v-else
                          v-for="(option,i) in getOptions(item).items"
                          :key="i"
                        >
                          <v-btn
                            class="option-btn"
                            small
                            color="success"
                            @click="optionClicked(option)"
                          >{{option.name}}
                          </v-btn>
                        </span>
                      </v-card-text>

                      <v-list
                        three-line
                        dense
                        subheader
                        v-else
                        class="pt-1"
                      >
                        <template v-for="(option,i) in getOptions(item).items">
                          <v-divider :key="i"></v-divider>
                          <v-list-tile
                            :key="i"
                            ripple
                            @click="optionClicked(option)"
                            class="options-list"
                          >
                            <v-list-tile-content>
                              <v-list-tile-sub-title class="options-list-subtile">{{option.name}}</v-list-tile-sub-title>
                            </v-list-tile-content>
                          </v-list-tile>
                        </template>
                      </v-list>
                    </v-card>
                    <!-- more info & calendar picker -->
                    <v-layout row>
                      <v-flex
                        xs12
                        class="text-xs-right"
                        v-if="item.hasExtraData && !hasCollection(item) && notLiveChatTranscript(item)"
                      >
                        <v-btn
                          class="mr-0"
                          color="success"
                          @click="showModal(item)"
                        >{{ modalButtonText(item) }}
                          <v-icon
                            right
                            small
                            color="white"
                          >{{ modalButtonIcon(item) }}</v-icon>
                        </v-btn>
                      </v-flex>
                      <!-- Date Picker -->
                      <v-flex
                        class="text-xs-right"
                        xs12
                        v-if="mustShowDate(item) && (i === dialog.length - 1)"
                      >
                        <v-btn
                          small
                          fab=""
                          color="info"
                          @click="showDate = !showDate"
                        >
                          <v-icon>fa-calendar-alt</v-icon>
                        </v-btn>
                      </v-flex>
                      <!-- Time Picker -->
                      <v-flex
                        class="text-xs-right"
                        xs12
                        v-if="mustShowTime(item) && (i === dialog.length - 1)"
                      >
                        <v-btn
                          small
                          fab=""
                          color="info"
                          @click="showTime = !showTime"
                        >
                          <v-icon>fa-clock</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </template>
                  <!-- Additional Response Chunks -->
                  <div v-if="responseHasChunks(item)">

                    <v-layout
                      row
                      v-for="(chunkText, index) in getChunks(item)"
                      :key="index"
                    >
                      <v-flex
                        xs2
                        class="text-xs-left mr-2"
                      >
                        <v-btn
                          v-long-press="swapInputButton"
                          color="secondary"
                          fab
                          small
                        >
                          <v-icon class="white--text">{{responseIcon}}</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-card
                          class="chat-card text-xs-left px-2"
                          :dark="dark"
                        >
                          <span
                            v-html="chunkText"
                            class="teneo-reply"
                          ></span>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </div>

                  <!-- user question -->
                  <v-layout
                    align-start
                    justify-end
                    row
                    fill-height
                    v-if="item.type === 'userInput'"
                  >

                    <v-flex shrink>
                      <v-card
                        color="primary white--text"
                        class="chat-card text-xs-right"
                      >
                        <v-container
                          fluid
                          grid-list-s
                        >
                          <v-layout row>
                            <v-flex shrink>
                              <div class="pr-2">{{item.text}}
                              </div>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card>
                    </v-flex>
                    <v-flex
                      shrink
                      class="text-xs-right"
                    >
                      <v-btn
                        v-long-press="swapInputButton"
                        fab
                        small
                        color="primary white--text"
                        @click="updateInputBox(item.text)"
                      >
                        <v-icon color="white">{{userIcon}}</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>

                </v-container>
                <!-- live chat typing -->
              </div>

            </v-expansion-panel-content>

          </transition-group>

          <!--<div class="text-xs-center mt-3" v-if="liveChatMessage">{{ liveChatMessage }}</div>-->
          <div
            class="text-xs-center my-3"
            v-if="showLiveChatProcessing"
          >
            <ball-pulse-sync-loader
              color="#C2C2C2"
              size="10px"
            ></ball-pulse-sync-loader>
          </div>
          <span
            id="scroll-end"
            ref="pageBottom"
          ></span>
        </v-expansion-panel>

      </v-flex>
      <v-flex
        xs12
        class="teneo-footer"
      >
        <v-progress-linear
          :indeterminate="true"
          :active="progressBar"
          class="loading"
          height="3"
        ></v-progress-linear>

        <v-container
          fluid
          grid-list-sm
        >
          <v-layout row>
            <v-flex
              xs12
              pl-3
            >
              <v-divider></v-divider>
              <v-text-field
                :disabled="progressBar"
                hide-details
                v-shortkey="{toggle1: ['ctrl', 'alt', '/'], toggle2: ['ctrl', 'alt', 'arrowdown']}"
                @shortkey.native="swapInputButton"
                clearable
                auto-grow
                solo
                name="userInput"
                ref="userInput"
                browser-autocomplete="off"
                @keyup.enter.native="sendUserInput"
                v-model.trim="userInput"
                :label="$t('input.box.label')"
                single-line
              ></v-text-field>
            </v-flex>
            <v-flex>
              <v-btn
                fab
                v-long-press="swapInputButton"
                v-if="!showAudioInput"
                small
                color="primary"
                class="white--text"
                @click.native="sendUserInput"
              >
                <v-icon>fa-angle-double-right</v-icon>
              </v-btn>
              <span
                v-shortkey="['esc']"
                @shortkey="stopAudioCapture"
              ></span>
              <v-btn
                fab
                v-long-press="swapInputButton"
                small
                v-if="showAudioInput"
                v-shortkey="{recordAudioOne: ['ctrl', 'alt', '.'], recordAudioTwo: ['ctrl', 'alt', '`'], recordAudioThree: ['ctrl', 'alt', 'arrowup']}"
                @shortkey.native="captureAudio"
                :color="audioButtonColor"
                :class="audioButtonClasses"
                @click.native="captureAudio"
              >
                <v-icon medium>fa-microphone-alt</v-icon>
              </v-btn>
              <!-- text & audio input area -->

              <v-snackbar
                v-model="snackbar"
                bottom
                :timeout="snackbarTimeout"
                auto-height
              >
                {{ $t('empty.user.input') }} 😉
              </v-snackbar>
            </v-flex>
          </v-layout>
        </v-container>

      </v-flex>

    </v-layout>
    <!-- end -->
    <!-- Date picker dialog -->
    <v-flex
      xs12
      key="datePicker"
    >
      <v-dialog
        ref="dialogDate"
        v-model="showDate"
        :return-value.sync="date"
        lazy
        width="290px"
      >
        <v-date-picker
          v-model="date"
          scrollable
          :min="this.$dayjs().format('YYYY-MM-DD')"
        >
          <v-spacer></v-spacer>
          <v-btn
            flat
            color="primary"
            @click="showDate = false"
          >Cancel</v-btn>
          <v-btn
            flat
            color="primary"
            @click="sendUserInput"
          >OK</v-btn>
        </v-date-picker>
      </v-dialog>
    </v-flex>

    <!-- Time picker dialog -->
    <v-flex
      xs12
      key="timePicker"
    >
      <v-dialog
        ref="dialogTime"
        v-model="showTime"
        :return-value.sync="date"
        lazy
        width="290px"
      >

        <v-time-picker
          v-model="time"
          format="24hr"
        >
          <v-spacer></v-spacer>
          <v-btn
            flat
            color="primary"
            @click="showTime = false"
          >Cancel</v-btn>
          <v-btn
            flat
            color="primary"
            @click="sendUserInput"
          >OK</v-btn>
        </v-time-picker>
      </v-dialog>
    </v-flex>

  </v-container>

</template>

<script>
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
  components: {},
  data() {
    return {
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "success",
      snackbar: false,
      snackbarTimeout: 1500,
      showDate: false,
      showTime: false,
      date: "",
      time: ""
    };
  },
  computed: {
    dark() {
      return this.$store.getters.dark;
    },
    progressBar() {
      return this.$store.getters.progressBar;
    },
    userInput: {
      get: function() {
        if (this.date !== "") {
          this.updateInputBox(this.$dayjs(this.date).format("D MMMM YYYY"));
        }
        if (this.time !== "") {
          this.updateInputBox(this.time);
        }
        if (this.$store.state.userInputReadyForSending) {
          this.$store.commit("hideModal"); // hide all modals
          this.sendUserInput();
        }
        return this.$store.getters.getUserInput;
      },
      set: function(userInput) {
        this.$store.commit("setUserInput", userInput);
      }
    },
    getOpenedItem() {
      return this.dialog.length - 1;
    },
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
      console.log(e);
      // do nothing
    }
    // setTimeout(this.hideProgressBar, 2700);
  },
  mounted() {
    this.$el.addEventListener("click", this.onHtmlClick);
    this.$refs.userInput.focus();
    console.log("In mounted");

    // if being shown in webview then show the microphone button by default

    // if (
    //   "Android" in window ||
    //   "webkit" in window
    //   // "webkitSpeechRecognition" in window ||
    //   // "SpeechRecognition" in window
    // ) {
    //   // this.swapInputButton();
    //   this.showAudioInput = true;
    //   this.$store.commit("speakBackResponses", this.showAudioInput);
    // }
  },
  methods: {
    responseHasChunks(item) {
      return item.type === "reply" && item.text.includes("||");
    },
    getChunks(item) {
      let chunks = item.text.split("||");
      chunks.shift();
      return chunks;
    },
    itemText(item) {
      let itemText = item.text;
      if (itemText.includes("||")) {
        return itemText.split("||")[0];
      }
      return itemText;
    },
    stopAudioCapture() {
      this.$store.commit("hideListening");
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
    mustShowTime(item) {
      if (
        decodeURIComponent(item.teneoResponse.extraData.timePicker) !==
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
          if (action.name.startsWith("displayCollection")) {
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
    hasPermanentOptions(item) {
      if (item.hasExtraData) {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name.startsWith("displayCollection")) {
            if (action.permanent !== "undefined") {
              return action.permanent;
            }
          }
        }
      }
      return false;
    },
    hasLongOptions(item) {
      if (item.hasExtraData) {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name.startsWith("displayCollection")) {
            if (action.hasLongOptions !== "undefined") {
              return action.hasLongOptions;
            }
          }
        }
      }
      return false;
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
          } else if (action.name.startsWith("displayCollectionBasic")) {
            // console.log(action);
            action.parameters.html = true;
            action.parameters.items = action.parameters.items.replace(
              /left/g,
              ""
            );
            return action.parameters;
          }
        }
      }
      return {};
    },
    sendUserInput() {
      this.audioButtonColor = "success";
      if (this.$store.getters.getUserInput) {
        this.$store.commit("showProgressBar");
        this.showDate = false;
        this.showTime = false;
        this.date = "";
        this.time = "";
        this.$store
          .dispatch("sendUserInput")
          .then(this.$refs.userInput.focus())
          .catch(err => {
            this.inUserInput = err;
          });
      } else {
        this.snackbar = true;
      }
      this.$refs.userInput.focus();
    },
    optionClicked(option) {
      this.$store.commit("showProgressBar");
      this.$store.commit("setUserInput", option.name);
      this.$store
        .dispatch("sendUserInput", option.params ? "&" + option.params : "")
        .then(this.$refs.userInput.focus());
    },
    modalButtonText(item) {
      if (item.hasExtraData && item.type === "reply") {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name.startsWith("displayVideo")) {
            return "Video";
          } else if (action.name.startsWith("displayImage")) {
            return "Image";
          } else if (action.name.startsWith("displayTable")) {
            return "Results Table";
          }
        }
      }
      if (item.teneoResponse.link.href !== "") {
        return "Page";
      }

      return "More";
    },
    modalButtonIcon(item) {
      if (item.hasExtraData && item.type === "reply") {
        let extensionsRAW = decodeURIComponent(
          item.teneoResponse.extraData.extensions
        );
        if (extensionsRAW !== "undefined") {
          let action = JSON.parse(extensionsRAW);
          if (action.name.startsWith("displayVideo")) {
            return "fa-film";
          } else if (action.name.startsWith("displayImage")) {
            return "fa-image";
          } else if (action.name.startsWith("displayTable")) {
            return "fa-table";
          }
        }
      }
      if (item.teneoResponse.link.href !== "") {
        return "fa-link";
      }
      return "fa-angle-double-up";
    },
    showModal(item) {
      this.$store.commit("hideModal"); // hide all modals first
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
      this.showAudioInput = !this.showAudioInput;
      this.$store.commit("speakBackResponses", this.showAudioInput);
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

.loading {
  position: relative;
  bottom: 8px;
  margin: 0 !important;
  margin-bottom: -3px !important;
}

.v-snack {
  position: absolute;
  bottom: 0px;
}

.option-btn {
  font-size: 13px;
  text-transform: unset;
  white-space: normal;
}

.options-list {
  height: 50px !important;
}

.options-list-subtile {
  color: unset !important;
}
</style>
<style>
.v-expansion-panel__header {
  padding-left: 15px !important;
  padding-right: 15px !important;
  padding-top: 0px !important;
  padding-bottom: 10px !important;
}

.v-toolbar__title:not(:first-child) {
  margin-left: 12px !important;
}

.v-toolbar__title {
  font-size: 17px !important;
  white-space: unset !important;
}

.v-toolbar__content,
.v-toolbar__extension {
  padding: 0 12px;
}

.chat-card {
  font-size: 16px !important;
  font-weight: 500;
  padding: 5px;
  padding-left: 10px;
  margin-top: 10px;
}

div.options-list a.v-list__tile--link {
  cursor: pointer;
  height: inherit !important;
}

.chat-responses-float {
  min-height: calc(80vh - 130px);
  height: calc(80vh - 130px);
  height: calc(var(--vh, 1vh) * 80 - 130px);
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-responses {
  max-height: calc(100vh - 130px);
  max-height: calc(var(--vh, 1vh) * 100 - 130px);
  height: calc(100vh - 130px);
  height: calc(var(--vh, 1vh) * 100 - 130px);
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-container {
  overflow-x: hide !important;
  width: 360px;
}

.chat-container-inner {
  overflow-x: hide !important;
}

span.teneo-reply ul {
  padding-left: 17px !important;
}

.teneo-footer {
  padding-top: 8px;
  -webkit-box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.1);
  position: inherit;
  bottom: 0px;
  width: 100%;
  height: 60px;
}

@media only screen and (max-width: 480px) {
  .v-snack,
  .v-footer,
  .chat-container,
  .teneo-dialog,
  .loading-ball {
    width: 100vw !important;
  }

  .chat-responses,
  .chat-responses-float {
    min-height: calc(100vh - 125px);
    min-height: calc(var(--vh, 1vh) * 100 - 125px);
  }
}
</style>