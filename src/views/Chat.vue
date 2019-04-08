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
        :class="{'dark-scroll': dark, 'light-scroll': !dark, 'chat-responses-float': float, 'chat-responses': !float}"
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
          :value="getCurrentItem"
          class="chat-container-inner"
        >
          <transition-group
            name="chat-line-transition"
            enter-active-class="animated fadeIn"
          >
            <!-- item && hasCollection(item) -->
            <v-expansion-panel-content
              class="teneo-dialog"
              v-for="(item,i) in dialog"
              :key="i + 'itemsIter'"
              :hide-actions="true"
              :class="{'pb-2': (i === dialog.length - 1), 'pt-2': (i === 0)}"
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
                  <!-- Misc Message -->
                  <div v-if="item.type === 'miscMessage'">
                    <v-alert
                      :value="true"
                      color="info"
                      icon="fa-broadcast-tower"
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
                      shrink
                      class="text-xs-left"
                    >
                      <v-avatar
                        size="40px"
                        class="teneo-response-icon elevation-2 mt-2"
                      >
                        <img
                          :src="item.agentAvatar"
                          :alt="item.agentName"
                        >
                      </v-avatar>
                    </v-flex>
                    <v-flex shrink>
                      <v-card
                        class="chat-card chat-card-left text-xs-left px-2"
                        :dark="dark"
                        :color="dark ? '#333333' : '#FAFAFA'"
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
                        shrink
                        class="text-xs-left"
                        v-if="showChatIcons"
                      >
                        <v-btn
                          v-long-press="swapInputButton"
                          color="secondary"
                          class="teneo-response-icon elevation-2"
                          fab
                          small
                        >
                          <v-icon class="white--text">{{responseIcon}}</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex shrink>
                        <v-card
                          :color="dark ? '#333333' : '#FAFAFA'"
                          class="chat-card chat-card-left text-xs-left"
                          :dark="dark"
                        >
                          <span
                            v-html="itemText(item)"
                            class="teneo-reply"
                          ></span>
                        </v-card>
                      </v-flex>
                    </v-layout>
                    <!-- Show Inline Components -->
                    <v-layout
                      v-for="(extension, index) in itemExtensions(item)"
                      :key="index + 'inlines'"
                      row
                    >
                      <v-flex xs12>
                        <YouTube
                          v-if="hasInlineType(extension,'youTube')"
                          :videoId="youTubeVideoId(extension)"
                          class="mt-2"
                        ></YouTube>
                        <Audio
                          v-if="hasInlineType(extension,'audio')"
                          :url="audioInfo(extension).audioUrl"
                          class="mt-2"
                        ></Audio>
                        <Vimeo
                          v-if="hasInlineType(extension,'vimeo')"
                          :videoId="vimeoId(extension)"
                          class="mt-2"
                        ></Vimeo>
                        <Video
                          v-if="hasInlineType(extension,'video')"
                          :url="videoInfo(extension).videoUrl"
                          :type="videoInfo(extension).videoType"
                          class="mt-2"
                        ></Video>
                        <ImageAnimation
                          v-if="hasInlineType(extension,'image')"
                          :url="imageUrl(extension)"
                          class="mt-2"
                        ></ImageAnimation>
                        <Carousel
                          v-if="hasInlineType(extension,'carousel')"
                          :imageItems="carouselImageArray(extension)"
                          class="mt-2"
                        ></Carousel>
                      </v-flex>
                    </v-layout>
                    <!-- show any options in the response: for example Yes, No Maybe -->
                    <v-card
                      flat
                      v-if="hasCollection(item) && ((i === dialog.length - 1) || hasPermanentOptions(item))"
                      class="text-xs-center"
                      width="320px"
                    >
                      <!-- Button Options -->
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
                      <!-- Line based List Options -->
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
                    <!-- more info for modals & calendar picker button -->
                    <v-layout row>
                      <!-- <v-flex
                        xs12
                        class="text-xs-right"
                        v-if="item.hasExtraData && hasModal(item) && !hasCollection(item) && notLiveChatTranscript(item)"
                      > -->

                      <v-flex
                        xs12
                        class="text-xs-right"
                        v-if="(item.hasExtraData && hasModal(item) && notLiveChatTranscript(item)) || itemHasLongResponse(item)"
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
                          fab
                          class="teneo-userinput-icon elevation-2"
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
                          fab
                          class="teneo-userinput-icon elevation-2"
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
                        class="text-xs-left"
                        v-if="showChatIcons"
                      >
                        <v-btn
                          v-long-press="swapInputButton"
                          color="secondary"
                          class="teneo-response-icon elevation-2"
                          fab
                          small
                        >
                          <v-icon class="white--text">{{responseIcon}}</v-icon>
                        </v-btn>
                      </v-flex>
                      <v-flex>
                        <v-card
                          class="chat-card chat-card-left text-xs-left"
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
                        class="chat-card chat-card-right text-xs-right"
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
                      v-if="showChatIcons"
                    >
                      <v-btn
                        v-long-press="swapInputButton"
                        class="teneo-userinput-icon elevation-2"
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
          <v-form
            v-model="valid"
            v-on:submit.prevent
          >
            <v-layout row>

              <v-flex
                xs12
                pl-3
              >
                <v-divider></v-divider>

                <v-text-field
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
                  autofocus
                  required
                  return-masked-value
                  :mask="itemInputMask"
                  solo
                  name="userInput"
                  ref="userInput"
                  browser-autocomplete="off"
                  @keyup.enter.native="sendUserInput"
                  v-model.trim="userInput"
                  :label="inputHelpText ? inputHelpText : askingForPassword ? $t('input.box.label.password') : askingForEmail ? $t('input.box.label.email') : $t('input.box.label')"
                  single-line
                ></v-text-field>
              </v-flex>
              <v-flex>
                <v-btn
                  fab
                  :disabled="progressBar"
                  :loading="progressBar"
                  v-long-press="swapInputButton"
                  v-if="!showAudioInput"
                  small
                  color="primary"
                  class="white--text elevation-2"
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
                  :disabled="progressBar"
                  :loading="progressBar"
                  v-long-press="swapInputButton"
                  small
                  v-if="showAudioInput"
                  v-shortkey="{recordAudioOne: ['ctrl', 'alt', '.'], recordAudioTwo: ['ctrl', 'alt', '`'], recordAudioThree: ['ctrl', 'alt', 'arrowup']}"
                  @shortkey.native="captureAudio"
                  :color="audioButtonColor"
                  :class="audioButtonClasses"
                  class="elevation-2"
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
          </v-form>
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
import { mapGetters } from "vuex";
import Audio from "../components/Audio";
import Carousel from "../components/Carousel";
import ImageAnimation from "../components/ImageAnimation";
import Video from "../components/Video";
import Vimeo from "../components/Vimeo";
import YouTube from "../components/YouTube";

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
    Audio,
    Carousel,
    ImageAnimation,
    Video,
    Vimeo,
    YouTube
  },
  data() {
    return {
      showAudioInput: false,
      audioButtonClasses: "white--text",
      audioButtonColor: "success",
      snackbar: false,
      snackbarTimeout: 1500,
      showDate: false,
      showPassword: false,
      showTime: false,
      date: "",
      time: "",
      rules: {
        required: value => !!value || "Required.",
        counter: value => value.length <= 20 || "Max 20 characters",
        email: value => {
          console.log(value);
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid e-mail.";
        }
      },
      valid: false
    };
  },
  computed: {
    ...mapGetters([
      "askingForPassword",
      "askingForEmail",
      "carouselImageArray",
      "chatHistory",
      "chatHistorySessionStorage",
      "dark",
      "float",
      "imageUrl",
      "inputHelpText",
      "itemExtensions",
      "itemInputMask",
      "hasInline",
      "hasInlineType",
      "hasModal",
      "liveChatMessage",
      "progressBar",
      "showChatIcons",
      "showChatLoading",
      "showLiveChatProcessing",
      "vimeoId",
      "audioInfo",
      "youTubeVideoId",
      "userInputReadyForSending",
      "responseIcon",
      "userIcon",
      "listening",
      "settingLongResponsesInModal",
      "lastItemAnswerTextCropped",
      "itemAnswerTextCropped",
      "lastItemHasLongResponse",
      "itemHasLongResponse"
    ]),
    userInput: {
      get: function() {
        if (this.date !== "") {
          this.updateInputBox(this.$dayjs(this.date).format("D MMMM YYYY"));
        }
        if (this.time !== "") {
          this.updateInputBox(this.time);
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
      let history = this.chatHistorySessionStorage;
      return history.length === 0;
    },
    noHistoryImage() {
      return require("../assets/history.png");
    },
    dialog() {
      if (this.$route.name === "chat") {
        return this.chatHistory;
      } else {
        // history in session storage
        return this.chatHistorySessionStorage;
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
      console.log(e);
      // do nothing
    }
  },
  mounted() {
    this.$el.addEventListener("click", this.onHtmlClick);
    this.$refs.userInput.focus();
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
      } else {
        itemText = this.itemAnswerTextCropped(item);
        console.log(itemText);
      }
      return itemText;
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
      if (!anchor.classList.contains("sendInput")) return;

      event.stopPropagation();
      event.preventDefault();
      this.updateInputBox(anchor.innerText);
      this.sendUserInput();
    },
    updateInputBox(userInput) {
      this.$store.commit("SET_USER_INPUT", userInput);
      this.$refs.userInput.focus();
    },
    hideProgressBar() {
      this.$store.commit("HIDE_PROGRESS_BAR");
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
      let extensions = this.itemExtensions(item);
      let hasOptions = false;

      extensions.forEach(extension => {
        if (extension.name.startsWith("displayCollection")) {
          hasOptions = true;
        }
      });

      return hasOptions;
    },
    notLiveChatTranscript(item) {
      let transcript = decodeURIComponent(
        item.teneoResponse.extraData.liveChat
      );
      return transcript === "undefined";
    },
    hasPermanentOptions(item) {
      let extensions = this.itemExtensions(item);
      let hasPermanentOptions = false;
      extensions.forEach(extension => {
        if (extension.name.startsWith("displayCollection")) {
          if (extension.permanent !== "undefined") {
            hasPermanentOptions = extension.permanent;
          }
        }
      });
      return hasPermanentOptions;
    },
    hasLongOptions(item) {
      let extensions = this.itemExtensions(item);
      let hasLongOptions = false;
      extensions.forEach(extension => {
        if (extension.name.startsWith("displayCollection")) {
          if (extension.hasLongOptions !== "undefined") {
            hasLongOptions = extension.hasLongOptions;
          }
        }
      });
      return hasLongOptions;
    },
    getOptions(item) {
      let extensions = this.itemExtensions(item);
      // only get the first set of options.
      let options = {};
      extensions.forEach(extension => {
        if (extension.name === "displayCollection") {
          options = extension.parameters.content;
        } else if (extension.name.startsWith("displayCollectionBasic")) {
          extension.parameters.html = true;
          extension.parameters.items = extension.parameters.items.replace(
            /left/g,
            ""
          );
          options = extension.parameters;
        }
      });
      return options;
    },
    sendUserInput() {
      if (this.valid) {
        this.audioButtonColor = "success";
        if (this.userInput) {
          this.$store.commit("SHOW_PROGRESS_BAR");
          this.showDate = false;
          this.showTime = false;
          this.date = "";
          this.time = "";
          this.$store
            .dispatch("sendUserInput")
            .then(this.$refs.userInput.focus())
            .catch(err => {
              this.userInput = err;
            });
        } else {
          // this.snackbar = true;
        }
        this.$refs.userInput.focus();
      }
    },
    optionClicked(option) {
      this.$store.commit("SHOW_PROGRESS_BAR");
      this.$store.commit("SET_USER_INPUT", option.name);
      this.$store
        .dispatch("sendUserInput", option.params ? "&" + option.params : "")
        .then(this.$refs.userInput.focus());
    },
    modalButtonText(item) {
      if (this.itemHasLongResponse(item)) {
        return this.$t("button.more");
      }
      let extensions = this.itemExtensions(item);
      let countOfNonInlines = 0;
      let buttonLabel = this.$t("button.more");
      extensions.forEach(extension => {
        if (!extension.inline || item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }
        if (extension.name.startsWith("displayVideo")) {
          buttonLabel = this.$t("button.video");
        } else if (extension.name.startsWith("displayImage")) {
          buttonLabel = this.$t("button.image");
        } else if (extension.name.startsWith("displayTable")) {
          buttonLabel = this.$t("button.table");
        }
        if (item.teneoResponse.link.href !== "") {
          buttonLabel = this.$t("button.page");
        }
      });
      if (countOfNonInlines > 1) {
        return this.$t("button.more");
      }
      return buttonLabel;
    },
    modalButtonIcon(item) {
      let extensions = this.itemExtensions(item);
      let countOfNonInlines = 0;
      let iconName = "fa-angle-double-up";
      extensions.forEach(extension => {
        if (!extension.inline || item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }

        if (extension.name.startsWith("displayVideo")) {
          iconName = "fa-film";
        } else if (extension.name.startsWith("displayImage")) {
          iconName = "fa-image";
        } else if (extension.name.startsWith("displayTable")) {
          iconName = "fa-table";
        }

        if (item.teneoResponse.link.href !== "") {
          iconName = "fa-link";
        }
      });

      if (countOfNonInlines > 1) {
        return "fa-angle-double-up";
      }

      return iconName;
    },
    showModal(item) {
      this.$store.commit("HIDE_CHAT_MODAL"); // hide all modals first
      this.$store.commit("SHOW_CHAT_MODAL", item);
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

.loading {
  position: relative;
  margin: 0 !important;
  bottom: 3px;
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
div.teneo-footer .v-text-field__details {
  position: relative !important;
  bottom: 20px !important;
}

div.chat-container .v-expansion-panel__header {
  padding-left: 8px !important;
  padding-right: 10px !important;
  padding-top: 0px !important;
  padding-bottom: 5px !important;
  cursor: unset;
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

.chat-card-left {
  border-radius: 3px 13px 13px 13px;
  -moz-border-radius: 3px 13px 13px 13px;
  -webkit-border-radius: 3px 13px 13px 13px;
}

.chat-card-right {
  border-radius: 13px 3px 13px 13px;
  -moz-border-radius: 13px 3px 13px 13px;
  -webkit-border-radius: 13px 3px 13px 13px;
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
  height: calc(var(--vh, 1vh) * 80 - 130px);
  overflow-y: auto;
  overflow-x: hidden;
}

.chat-responses {
  min-height: calc(100vh - 130px);
  min-height: calc(var(--vh, 1vh) * 100 - 130px);
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
  -webkit-box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px -1px 1px 0px rgba(0, 0, 0, 0.1);
  position: inherit;
  bottom: 0px !important;
  width: 100%;
  height: 60px;
  z-index: 1;
  padding-top: 2px;
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