<template>
  <!-- Reply -->
  <span v-if="item.type === 'reply'">
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
            v-html="itemText"
            class="teneo-reply"
          ></span>
        </v-card>
      </v-flex>
    </v-layout>
    <!-- Show Inline Components -->
    <v-layout
      v-for="(extension, index) in itemExtensions(item)"
      :key="index + 'inlines' + uuid"
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
    <!-- Additional Response Chunks -->
    <div v-if="responseHasChunks">
      <v-layout
        row
        v-for="(chunkText, responseChunkIndex) in getChunks"
        :key="responseChunkIndex + uuid"
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
            :color="dark ? '#333333' : '#FAFAFA'"
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
    <!-- show any options in the response: for example Yes, No Maybe -->
    <v-card
      flat
      v-if="hasCollection && ((itemIndexInDialog === dialog.length - 1) || hasPermanentOptions)"
      class="text-xs-center"
      width="320px"
    >
      <!-- Button Options -->
      <v-card-text v-if="!hasLongOptions">
        <h2 v-text="getOptions.title"></h2>
        <div
          v-if="getOptions.html"
          class="elevation-5 mt-2"
          v-html="getOptions.items"
        >
        </div>
        <span
          v-else
          v-for="(option, optionIndex) in getOptions.items"
          :key="optionIndex + uuid"
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
        <template v-for="(option, altOptionIndex) in getOptions.items">
          <v-divider :key="altOptionIndex + uuid"></v-divider>
          <v-list-tile
            :key="altOptionIndex + 'tile' + uuid"
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
      <v-flex
        xs12
        class="text-xs-right"
        v-if="(item.hasExtraData && hasModal(item) && notLiveChatTranscript) || itemHasLongResponse(item)"
      >
        <v-btn
          class="mr-0"
          color="success"
          @click="showModal"
        >{{ modalButtonText }}
          <v-icon
            right
            small
            color="white"
          >{{ modalButtonIcon }}</v-icon>
        </v-btn>
      </v-flex>
      <!-- Date Picker -->
      <v-flex
        class="text-xs-right"
        xs12
        v-if="mustShowDate && (itemIndexInDialog === dialog.length - 1)"
      >
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2"
          color="info"
          @click="toggleDate()"
        >
          <v-icon>fa-calendar-alt</v-icon>
        </v-btn>
      </v-flex>
      <!-- Time Picker -->
      <v-flex
        class="text-xs-right"
        xs12
        v-if="mustShowTime && (itemIndexInDialog === dialog.length - 1)"
      >
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2"
          color="info"
          @click="toggleTime()"
        >
          <v-icon>fa-clock</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </span>
</template>

<script>
import Audio from "./Audio";
import Carousel from "./Carousel";
import ImageAnimation from "./ImageAnimation";
import Video from "./Video";
import Vimeo from "./Vimeo";
import YouTube from "./YouTube";
import { mapGetters } from "vuex";
export default {
  name: "ChatTeneoResponse",
  components: {
    Audio,
    Carousel,
    ImageAnimation,
    Video,
    Vimeo,
    YouTube
  },
  props: ["item", "itemIndexInDialog"],
  computed: {
    ...mapGetters([
      "dark",
      "itemAnswerTextCropped",
      "showChatIcons",
      "itemExtensions",
      "imageUrl",
      "carouselImageArray",
      "responseIcon",
      "uuid",
      "hasInline",
      "hasInlineType",
      "chatHistory",
      "chatHistorySessionStorage",
      "hasModal",
      "lastItemHasLongResponse",
      "itemHasLongResponse",
      "vimeoId",
      "audioInfo",
      "youTubeVideoId"
    ]),
    modalButtonText() {
      if (this.itemHasLongResponse(this.item)) {
        return this.$t("button.more");
      }
      let extensions = this.itemExtensions(this.item);
      let countOfNonInlines = 0;
      let buttonLabel = this.$t("button.more");
      extensions.forEach(extension => {
        if (!extension.inline || this.item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }
        if (extension.name.startsWith("displayVideo")) {
          buttonLabel = this.$t("button.video");
        } else if (extension.name.startsWith("displayImage")) {
          buttonLabel = this.$t("button.image");
        } else if (extension.name.startsWith("displayTable")) {
          buttonLabel = this.$t("button.table");
        }
        if (this.item.teneoResponse.link.href !== "") {
          buttonLabel = this.$t("button.page");
        }
      });
      if (countOfNonInlines > 1) {
        return this.$t("button.more");
      }
      return buttonLabel;
    },
    modalButtonIcon() {
      let extensions = this.itemExtensions(this.item);
      let countOfNonInlines = 0;
      let iconName = "fa-angle-double-up";
      extensions.forEach(extension => {
        if (!extension.inline || this.item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }

        if (extension.name.startsWith("displayVideo")) {
          iconName = "fa-film";
        } else if (extension.name.startsWith("displayImage")) {
          iconName = "fa-image";
        } else if (extension.name.startsWith("displayTable")) {
          iconName = "fa-table";
        }

        if (this.item.teneoResponse.link.href !== "") {
          iconName = "fa-link";
        }
      });

      if (countOfNonInlines > 1) {
        return "fa-angle-double-up";
      }

      return iconName;
    },
    itemText() {
      let itemText = this.item.text;
      if (itemText.includes("||")) {
        return itemText.split("||")[0];
      } else {
        itemText = this.itemAnswerTextCropped(this.item);
      }
      return itemText;
    },
    hasCollection() {
      let extensions = this.itemExtensions(this.item);
      let hasOptions = false;

      extensions.forEach(extension => {
        if (extension.name.startsWith("displayCollection")) {
          hasOptions = true;
        }
      });

      return hasOptions;
    },
    responseHasChunks() {
      return this.item.type === "reply" && this.item.text.includes("||");
    },
    getChunks() {
      let chunks = this.item.text.split("||");
      chunks.shift();
      return chunks;
    },
    dialog() {
      if (this.$route.name === "chat") {
        return this.chatHistory;
      } else {
        // history in session storage
        return this.chatHistorySessionStorage;
      }
    },
    hasPermanentOptions() {
      let extensions = this.itemExtensions(this.item);
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
    hasLongOptions() {
      let extensions = this.itemExtensions(this.item);
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
    getOptions() {
      let extensions = this.itemExtensions(this.item);
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
    mustShowDate() {
      if (
        decodeURIComponent(this.item.teneoResponse.extraData.datePicker) !==
        "undefined"
      ) {
        return true;
      }
      return false;
    },
    notLiveChatTranscript() {
      let transcript = decodeURIComponent(
        this.item.teneoResponse.extraData.liveChat
      );
      return transcript === "undefined";
    },
    mustShowTime() {
      if (
        decodeURIComponent(this.item.teneoResponse.extraData.timePicker) !==
        "undefined"
      ) {
        return true;
      }
      return false;
    }
  },
  methods: {
    showModal() {
      this.$store.commit("HIDE_CHAT_MODAL"); // hide all modals first
      this.$store.commit("SHOW_CHAT_MODAL", this.item);
    },
    toggleDate() {
      this.$emit("toggleDate");
    },
    toggleTime() {
      this.$emit("toggleTime");
    },
    swapInputButton() {
      this.$emit("swapInputButton");
    },
    optionClicked(option) {
      this.$store.commit("SHOW_PROGRESS_BAR");
      this.$store.commit("SET_USER_INPUT", option.name);
      this.$store
        .dispatch("sendUserInput", option.params ? "&" + option.params : "")
        .then(() => {
          this.$emit("handleFocus");
        });
    }
  }
};
</script>

<style scoped>
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
