<template>
  <!-- Reply -->
  <span v-if="item.type === 'reply'">
    <v-row
      v-if="itemText !== '<p>'"
      class="my-1"
      no-gutters
      justify="start"
    >
      <v-col
        cols="2"
        class="text-center"
        v-if="showChatIcons"
      >
        <v-btn
          v-long-press="1000"
          @long-press-start="swapInputButton"
          color="secondary"
          class="teneo-response-icon elevation-2"
          fab
          light
          small
        >
          <v-icon>{{responseIcon}}</v-icon>
        </v-btn>
      </v-col>
      <v-col class="text-left">
        <v-card
          :color="$vuetify.theme.dark ? '#333333' : '#FAFAFA'"
          class="chat-card chat-card-left text-left"
        >
          <span
            v-html="itemText"
            class="teneo-reply"
          ></span>
        </v-card>
      </v-col>

    </v-row>
    <!-- Show Inline Components -->
    <v-row
      v-for="(extension, index) in itemExtensions(item)"
      :key="index + 'inlines' + uuid"
      no-gutters
    >
      <v-col cols="12">
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
        <Map
          v-if="hasInlineType(extension,'map')"
          :address="mapInfo(extension).address"
          class="mt-2"
        ></Map>
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
      </v-col>
    </v-row>
    <!-- Additional Response Chunks -->
    <div v-if="responseHasChunks">
      <v-row
        v-for="(chunkText, responseChunkIndex) in getChunks"
        :key="responseChunkIndex + uuid"
        no-gutters
        class="mb-2"
      >
        <v-col
          cols="2"
          class="text-center"
          v-if="showChatIcons"
        >
          <v-btn
            v-long-press="1000"
            @long-press-start="swapInputButton"
            color="secondary"
            class="teneo-response-icon elevation-2"
            fab
            small
          >
            <v-icon class="white--text">{{responseIcon}}</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-card
            class="chat-card chat-card-left text-left"
            :color="$vuetify.theme.dark ? '#333333' : '#FAFAFA'"
          >
            <span
              v-html="chunkText"
              class="teneo-reply"
            ></span>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <DelayedResponse v-if="showDelayedResponse && (itemIndexInDialog === dialog.length - 1)"></DelayedResponse>
    <!-- show any options in the response: for example Yes, No Maybe -->
    <v-card
      text
      v-if="hasCollection && ((itemIndexInDialog === dialog.length - 1) || hasPermanentOptions)"
      class="mb-3 elevation-0 text-center"
      width="320px"
    >
      <!-- Button Options -->
      <v-card-text
        class="teneo-button-options"
        v-if="!hasLongOptions"
      >
        <h3 v-text="getOptions.title"></h3>
        <div
          v-if="getOptions.html"
          class="elevation-2 mt-2"
          v-html="getOptions.items"
        >
        </div>
        <span
          v-else
          v-for="(option, optionIndex) in getOptions.items"
          :key="optionIndex + uuid"
        >
          <v-btn
            class="option-btn mr-2 mt-2"
            small
            color="success"
            @click="optionClicked(option)"
          >{{option.name}}
          </v-btn>
        </span>
      </v-card-text>
      <!-- Line based List Options -->

      <v-list v-else>
        <v-list-item-group color="primary">
          <template v-for="(option, altOptionIndex) in getOptions.items">
            <v-list-item
              :key="altOptionIndex + 'tile' + uuid"
              @click="optionClicked(option)"
              class="text-left pl-2 pr-0"
              style="height: 40px"
              dense
            >
              <v-list-item-icon class="mr-4">
                <v-icon>{{ getLongListIcon(altOptionIndex)}}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="text-left">
                <!-- <v-list-item-title v-html="option.name"></v-list-item-title> -->
                <v-list-item-subtitle v-html="option.name"></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>

    </v-card>
    <!-- more info for modals & calendar picker button -->
    <v-row no-gutters>
      <v-col
        cols="12"
        class="text-right mb-2"
        v-if="(item.hasExtraData && hasModal(item) && notLiveChatTranscript) || itemHasLongResponse(item)"
      >
        <v-btn
          color="success"
          class="mt-2"
          small
          @click="showModal"
        >{{ modalButtonText }}
          <v-icon
            right
            small
            color="white"
          >{{ modalButtonIcon }}</v-icon>
        </v-btn>
      </v-col>
      <!-- Date Picker -->
      <v-col
        class="text-right"
        cols="12"
        v-if="mustShowDate && (itemIndexInDialog === dialog.length - 1)"
      >
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2 mb-2"
          color="success"
          @click="toggleDate()"
        >
          <v-icon>date_range</v-icon>
        </v-btn>
      </v-col>
      <!-- Time Picker -->
      <v-col
        class="text-right"
        cols="12"
        v-if="mustShowTime && (itemIndexInDialog === dialog.length - 1)"
      >
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2 mb-2"
          color="success"
          @click="toggleTime()"
        >
          <v-icon>access_time</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </span>
</template>

<script>
import LongPress from "vue-directive-long-press";
import Audio from "./Audio";
import Carousel from "./Carousel";
import ImageAnimation from "./ImageAnimation";
import DelayedResponse from "./DelayedResponse";
import Video from "./Video";
import Map from "./Map";
import Vimeo from "./Vimeo";
import YouTube from "./YouTube";
import { mapGetters } from "vuex";
export default {
  name: "ChatTeneoResponse",
  directives: {
    "long-press": LongPress
  },
  components: {
    Audio,
    Carousel,
    ImageAnimation,
    DelayedResponse,
    Map,
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
      "dialogs",
      "getLatestDialogHistory",
      "hasModal",
      "lastItemHasLongResponse",
      "itemHasLongResponse",
      "showDelayedResponse",
      "vimeoId",
      "audioInfo",
      "videoInfo",
      "mapInfo",
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
      let iconName = "keyboard_arrow_up";
      extensions.forEach(extension => {
        if (!extension.inline || this.item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }

        if (extension.name.startsWith("displayVideo")) {
          iconName = "ondemand_video";
        } else if (extension.name.startsWith("displayImage")) {
          iconName = "image";
        } else if (extension.name.startsWith("displayTable")) {
          iconName = "table_chart";
        }

        if (this.item.teneoResponse.link.href !== "") {
          iconName = "link";
        }
      });

      if (countOfNonInlines > 1) {
        return "keyboard_arrow_up";
      }

      return iconName;
    },
    itemText() {
      let itemText = this.item.text;
      if (itemText.includes("||")) {
        let firstAnswer = itemText.split("||")[0].trim();
        itemText = firstAnswer;
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
      chunks.shift(); // get everything but the first one
      return chunks;
    },
    dialog() {
      if (this.$route.name === "chat") {
        return this.dialogs;
      } else {
        return this.getLatestDialogHistory;
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
    getLongListIcon(altOptionIndex) {
      let iconName = "filter_none";
      if (altOptionIndex + 1 <= 9) {
        iconName = "filter_" + (altOptionIndex + 1);
      }
      return iconName;
    },
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
      let optionClickParam = "&isClick=true";
      this.$store
        .dispatch(
          "sendUserInput",
          option.params
            ? "&" + option.params + optionClickParam
            : optionClickParam
        )
        .then(() => {
          this.$emit("handleFocus");
        });
    }
  }
};
</script>

<style scoped>
.teneo-button-options {
  padding: 0;
  margin-top: 10px;
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
