<template>
  <!-- Reply -->
  <div v-if="item.type === 'reply'" :class="itemIndexInDialog === dialog.length - 1 ? 'pb-3'  : ''">
    <v-row v-if="itemText !== '<p>'" justify="start" no-gutters class="pr-3 pl-1 pt-2">
      <v-col
        cols="2"
        class="text-center d-none d-sm-block"
        v-if="showChatIcons && !this.$vuetify.breakpoint.xs"
      >
        <v-menu v-if="isLiveAgentAssist" close-on-click close-on-content-click offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              v-long-press="1000"
              aria-label="Chat icon representing the virtual assitant"
              @long-press-start="swapInputButton"
              color="secondary"
              class="teneo-response-icon elevation-2"
              text
              tile
              icon
              large
            >
              <v-icon large>{{ getResponseIcon }}</v-icon>
            </v-btn>
          </template>

          <v-list class="liveAgentAssitMenu">
            <v-hover
              v-slot:default="{ hover }"
              v-for="menuItem in dynamicAgentAssistMenu"
              :key="menuItem.title"
            >
              <v-list-item @click="menuItem.method" :class="hover ? 'primary' : ''">
                <v-list-item-title :class="hover ? 'white--text' : ''">
                  <v-icon :color="hover ? 'secondary' : ''" class="mr-2">
                    {{
                    menuItem.icon
                    }}
                  </v-icon>
                  {{ menuItem.title }}
                </v-list-item-title>
              </v-list-item>
            </v-hover>
          </v-list>
        </v-menu>
        <v-btn
          v-else
          v-long-press="1000"
          aria-label="Chat icon representing the virtual assitant"
          @long-press-start="swapInputButton"
          color="secondary"
          class="teneo-response-icon"
          text
          tile
          icon
          large
        >
          <v-icon large>{{ getResponseIcon }}</v-icon>
        </v-btn>
      </v-col>
      <v-col class="text-left">
        <v-card
          :color="$vuetify.theme.dark ? '#333333' : '#FFFFFF'"
          class="chat-card chat-card-left text-left"
        >
          <span v-html="itemText" class="teneo-reply"></span>
        </v-card>
      </v-col>
    </v-row>

    <Card
      v-if="hasCard(item) && itemIndexInDialog === dialog.length - 1"
      :item="item"
      class="mb-2"
    />
    <!-- Show Inline Components -->
    <span v-for="(extension, index) in itemExtensions(item)" :key="index + 'inlines' + uuid">
      <v-row v-if="hasInlineType(extension, 'youTube')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <YouTube :videoId="youTubeVideoId(extension)" class="mt-2"></YouTube>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'audio')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <Audio :url="audioInfo(extension).audioUrl" class="mt-2"></Audio>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'vimeo')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <Vimeo :videoId="vimeoId(extension)" class="mt-2"></Vimeo>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'video')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <Video
            :url="videoInfo(extension).videoUrl"
            :type="videoInfo(extension).videoType"
            class="mt-2"
          ></Video>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'map')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <Map :address="mapInfo(extension).address" class="mt-2"></Map>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'image')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <ImageAnimation :url="imageUrl(extension)" class="mt-2"></ImageAnimation>
        </v-col>
      </v-row>
      <v-row v-if="hasInlineType(extension, 'carousel')" no-gutters class="px-3 pt-2">
        <v-col cols="12">
          <Carousel :imageItems="carouselImageArray(extension)" class="mt-2"></Carousel>
        </v-col>
      </v-row>
    </span>
    <!-- Additional Response Chunks -->
    <div v-if="responseHasChunks">
      <v-row
        v-for="(chunkText, responseChunkIndex) in getChunks"
        :key="responseChunkIndex + uuid"
        no-gutters
        class="pr-3 pl-1 pt-1"
      >
        <v-col cols="2" class="text-center" v-if="showChatIcons">
          <v-btn
            v-long-press="1000"
            @long-press-start="swapInputButton"
            style="opacity: 0"
            color="secondary"
            class="teneo-response-icon elevation-2"
            text
            tile
            icon
            large
          >
            <v-icon large class="white--text">{{ getResponseIcon }}</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <v-card
            class="chat-card chat-card-left text-left"
            :color="$vuetify.theme.dark ? '#333333' : '#FFFFFF'"
          >
            <span v-html="chunkText" class="teneo-reply"></span>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <DelayedResponse v-if="showDelayedResponse && itemIndexInDialog === dialog.length - 1"></DelayedResponse>
    <!-- show any options in the response: for example Yes, No Maybe -->
    <v-col cols="12" v-if="routerCheckList && itemIndexInDialog === dialog.length - 1" class="px-0">
      <v-card>
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-title class="headline">
              {{
              routerCheckList.title
              }}
            </v-card-title>

            <v-row
              align="center"
              justify="start"
              v-for="(item, index) in routerCheckList.items"
              :key="index"
              class="ml-1"
            >
              <v-col cols="2">
                <v-icon :color="item.color">{{ item.icon }}</v-icon>
              </v-col>
              <v-col cols="10">
                <p>{{ item.label }}</p>
              </v-col>
            </v-row>
          </div>

          <v-avatar class="ma-3" size="100" tile>
            <v-img src="https://wi.presales.artificial-solutions.com/media/mytelco/router.png"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-col>

    <v-card
      v-if="
        hasCollection &&
          (itemIndexInDialog === dialog.length - 1 || hasPermanentOptions)
      "
      class="mb-1 mx-3 pt-0 px-1 pb-2 elevation-0 text-center transparent teneo-response-collection"
    >
      <!-- Button Options -->
      <v-card-text class="teneo-button-options pt-2 pb-2" v-if="!hasLongOptions">
        <h3 v-text="getOptions.title" class="subtitle-1 font-weight-bold"></h3>
        <div v-if="getOptions.html" class="elevation-2 mt-2" v-html="getOptions.items"></div>
        <span v-else v-for="(option, optionIndex) in getOptions.items" :key="optionIndex + uuid">
          <v-btn
            height="25"
            class="option-btn mr-2 mt-2"
            x-small
            color="success"
            @click="optionClicked(option)"
          >{{ option.name }}</v-btn>
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
                <v-icon>{{ getLongListIcon(altOptionIndex) }}</v-icon>
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
    <v-row
      no-gutters
      v-if="hasFeedbackForm(item) && itemIndexInDialog === dialog.length - 1"
      class="mr-3"
    >
      <v-col cols="12" class="text-right mb-2">
        <v-btn color="secondary" class="mt-2" small @click="displayFeedbackForm">
          {{
          getFeedbackFormConfig.label
          ? getFeedbackFormConfig.label
          : "Leave Feedback"
          }}
          <v-icon right small color="white">mdi-thumbs-up-down</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="!completedForm && hasForm()" class="mr-4">
      <v-col cols="12" class="text-right mb-2">
        <Form
          v-if="mustShowForm()"
          :formConfig="getFormConfig()"
          @showForm="showForm()"
          @hideForm="hideForm()"
          @completed="completed()"
          @handleFocus="handleFocus()"
        />

        <v-btn color="success" class="mt-2" small @click="showForm()">
          {{
          getFormConfig && getFormConfig.openFormButtonText
          ? getFormConfig.openFormButtonText
          : "Form"
          }}
          <v-icon right small color="white">mdi-file-document-edit-outline</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      no-gutters
      v-if="(item.hasExtraData && hasModal(item) && notLiveChatTranscript) ||
            itemHasLongResponse(item)"
      class="mt-0 mr-3"
    >
      <v-col cols="12" class="text-right mb-1">
        <v-btn color="success" class="mt-2" small @click="showModal">
          {{ modalButtonText }}
          <v-icon right small color="white">{{ modalButtonIcon }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      no-gutters
      v-if="mustShowDate && itemIndexInDialog === dialog.length - 1"
      class="mt-2 mr-3"
    >
      <!-- Date Picker -->
      <v-col class="text-right" cols="12">
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2 mb-2"
          color="success"
          @click="toggleDate()"
        >
          <v-icon>mdi-calendar-clock</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      no-gutters
      v-if="mustShowTime && itemIndexInDialog === dialog.length - 1"
      class="mt-2 mr-3"
    >
      <!-- Time Picker -->
      <v-col class="text-right" cols="12">
        <v-btn
          small
          fab
          class="teneo-userinput-icon elevation-2 mb-2"
          color="success"
          @click="toggleTime()"
        >
          <v-icon>mdi-clock</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-snackbar
      v-if="snackbar"
      v-model="snackbar"
      absolute
      color="primary"
      :timeout="snackBarTimeout"
      top
    >{{ snackBarText }}</v-snackbar>
    <AgentAssistCannedResponseForm
      v-if="agentAssist.cannedResponseForm"
      :text="agentAssist.cannedResponseText"
      @hideDialog="agentAssist.cannedResponseForm = false"
      @saved="handleAgentAssistCannedResponseSave"
    />
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("ChatTeneoResponse.vue");
import LongPress from "vue-directive-long-press";
import Audio from "./Audio";
import Carousel from "./Carousel";
import ImageAnimation from "./ImageAnimation";
import DelayedResponse from "./DelayedResponse";
import Video from "./Video";
import AgentAssistCannedResponseForm from "./AgentAssistCannedResponseForm";
import Map from "./Map";
import Vimeo from "./Vimeo";
import Card from "./Card";
import YouTube from "./YouTube";
import { mapGetters } from "vuex";
import copy from "copy-to-clipboard";
var stripHtml = require("striptags");

export default {
  name: "ChatTeneoResponse",
  directives: {
    "long-press": LongPress
  },
  components: {
    Audio,
    AgentAssistCannedResponseForm,
    Carousel,
    Card,
    ImageAnimation,
    DelayedResponse,
    Map,
    Video,
    Vimeo,
    YouTube,
    Form: () => import("./Form")
  },
  props: ["item", "itemIndexInDialog"],
  data() {
    return {
      snackbar: false,
      snackBarTimeout: 1500,
      snackBarText: "Success",
      agentAssist: {
        cannedResponseForm: false,
        cannedResponseText: "",
        menu: [
          {
            icon: "mdi-backburger",
            title: "Send to live chat",
            method: this.sendToLiveChatAgentInputBox
          },
          {
            icon: "mdi-clipboard-arrow-up-outline",
            title: "Copy to clipboard",
            method: this.copyToClipboard
          },
          {
            icon: "mdi-pound-box-outline",
            title: "Add as canned response",
            method: this.showLiveAgentCannedResponseForm
          },
          {
            icon: "mdi-refresh",
            title: "Reset bot session",
            method: this.resetBotSession
          },
          {
            icon: "mdi-link-box-variant-outline",
            title: "Send URL to customer",
            condition: this.hasLink,
            method: this.sendLinkToLiveAgent
          },
          {
            icon: "mdi-tooltip-image-outline",
            title: "Get media data",
            condition: this.hasMedia,
            method: this.sendResponseMediaToLiveAgent
          },
          {
            icon: "mdi-arrow-expand-up",
            title: "Create moment",
            condition: false,
            method: this.createLiveChatMoment
          }
        ]
      },
      displayForm: false,
      hasFormAutomaticallyDisplayed: false,
      completedForm: false
    };
  },
  computed: {
    ...mapGetters([
      "isLiveAgentAssist",
      "dark",
      "itemAnswerTextCropped",
      "showChatIcons",
      "itemExtensions",
      "getFeedbackFormConfig",
      "imageUrl",
      "carouselImageArray",
      "responseIcon",
      "uuid",
      "hasInline",
      "hasMediaExtensions",
      "hasInlineType",
      "showFeedbackForm",
      "dialogs",
      "getLatestDialogHistory",
      "hasModal",
      "hasFeedbackForm",
      "lastItemHasLongResponse",
      "itemHasLongResponse",
      "showDelayedResponse",
      "vimeoId",
      "audioInfo",
      "videoInfo",
      "mapInfo",
      "youTubeVideoId"
    ]),
    routerCheckList() {
      let extensions = this.itemExtensions(this.item);
      let routerCheckList = null;

      extensions.forEach(extension => {
        if (extension.name.startsWith("displayRouterCheckList")) {
          routerCheckList = extension.parameters;
        }
      });

      return routerCheckList;
    },
    getResponseIcon() {
      let icon = this.responseIcon;
      if (
        "teneoResponse" in this.item &&
        this.item.teneoResponse.emotion !== "" &&
        decodeURIComponent(this.item.teneoResponse.emotion).indexOf("|") !== -1
      ) {
        let rawEmotion = decodeURIComponent(this.item.teneoResponse.emotion);
        icon = "mdi-" + rawEmotion.split("|")[1].trim();
      }
      return icon;
    },
    dynamicAgentAssistMenu() {
      let filtered = this.agentAssist.menu.filter(menuItem => {
        if ("condition" in menuItem) {
          if (typeof menuItem.condition === "boolean") {
            return menuItem.condition;
          } else if (typeof menuItem.condition === "function") {
            return menuItem.condition();
          }
        } else {
          return true;
        }
      });

      return filtered;
    },
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
      let iconName = "mdi-arrow-top-left-thick";
      extensions.forEach(extension => {
        if (!extension.inline || this.item.teneoResponse.link.href !== "") {
          countOfNonInlines++;
        }

        if (extension.name.startsWith("displayVideo")) {
          iconName = "mdi-youtube";
        } else if (extension.name.startsWith("displayImage")) {
          iconName = "mdi-file-image";
        } else if (extension.name.startsWith("displayTable")) {
          iconName = "mdi-table-large";
        }

        if (this.item.teneoResponse.link.href !== "") {
          iconName = "mdi-link-variant";
        }
      });

      if (countOfNonInlines > 1) {
        return "mdi-arrow-top-left-thick";
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
    hasMedia() {
      return this.hasMediaExtensions(this.item);
    },
    sendResponseMediaToLiveAgent() {
      logger.debug(`Sending media to Agent`);
      let finalMessageToAgent = "";
      const extensions = this.itemExtensions(this.item);
      extensions.forEach(extension => {
        if (this.hasInlineType(extension, "youTube")) {
          finalMessageToAgent += `\nYouTube: https://www.youtube.com/watch?v=${this.youTubeVideoId(
            extension
          )}`;
        } else if (this.hasInlineType(extension, "vimeo")) {
          finalMessageToAgent += `\nVimeoId: ${this.vimeoId(extension)}`;
        } else if (this.hasInlineType(extension, "video")) {
          finalMessageToAgent += `\nVideo: ${
            this.videoInfo(extension).videoUrl
          }`;
        } else if (this.hasInlineType(extension, "map")) {
          finalMessageToAgent += `\nAddress: ${
            this.mapInfo(extension).address
          }`;
        } else if (this.hasInlineType(extension, "image")) {
          logger.debug(this.imageUrl(extension));
          finalMessageToAgent += `\nImage: ${this.imageUrl(extension)}`;
        } else if (this.hasInlineType(extension, "carousel")) {
          finalMessageToAgent += `\nImages: ${this.carouselImageArray(
            extension
          )}`;
        }
      });
      if (finalMessageToAgent) {
        this.$store.dispatch(
          "putLiveChatAgentMessage",
          decodeURIComponent(finalMessageToAgent)
        );
      }
    },
    createLiveChatMoment() {
      logger.debug(`Create Moment`);
    },
    handleAgentAssistCannedResponseSave() {
      this.agentAssist.cannedResponseForm = false;
      this.snackBarText = "#️⃣ New canned response added";
      this.snackbar = true;
    },
    showLiveAgentCannedResponseForm() {
      this.agentAssist.cannedResponseText = stripHtml(this.itemText);
      this.agentAssist.cannedResponseForm = true;
    },
    hasLink() {
      return this.item.teneoResponse.link.href;
    },
    sendLinkToLiveAgent() {
      this.$store.dispatch(
        "putLiveChatAgentMessage",
        decodeURIComponent(this.item.teneoResponse.link.href)
      );
    },
    resetBotSession() {
      this.$store.dispatch("endSessionLite").then(() => {
        this.snackBarText = "♻ Bot session reset";
        this.snackbar = true;
      });
    },
    copyToClipboard() {
      copy(stripHtml(this.itemText));
      this.snackBarText = "📋 Copied to your clipboard";
      this.snackbar = true;
    },
    sendToLiveChatAgentInputBox() {
      this.$store.dispatch("putLiveChatAgentMessage", this.itemText);
    },
    isLastInDialog() {
      return this.itemIndexInDialog === this.dialog.length - 1;
    },
    handleFocus() {
      this.$emit("handleFocus");
    },
    mustShowForm() {
      if (this.displayForm) {
        return true;
      } else {
        let formConfig = this.getFormConfig();

        if (
          this.isLastInDialog() &&
          !this.hasFormAutomaticallyDisplayed &&
          formConfig &&
          formConfig.openAutomatically
        ) {
          this.hasFormAutomaticallyDisplayed = true;
          this.displayForm = true;
          return true;
        }
      }
      return false;
    },
    completed() {
      this.hideForm();
      this.completedForm = true;
      this.$store.commit("REMOVE_FORM_CONFIG", this.item.id);
    },
    showForm() {
      this.displayForm = true;
    },
    hideForm() {
      this.displayForm = false;
    },
    hasForm() {
      if (
        this.item.teneoResponse &&
        this.item.teneoResponse.extraData &&
        this.item.teneoResponse.extraData.formConfig
      ) {
        return true;
      }
      return false;
    },
    getFormConfig() {
      if (
        this.item.teneoResponse &&
        this.item.teneoResponse.extraData &&
        this.item.teneoResponse.extraData.formConfig
      ) {
        return JSON.parse(
          decodeURIComponent(this.item.teneoResponse.extraData.formConfig)
        );
      }
      return null;
    },
    hasCard(item) {
      if (
        item.teneoResponse.extraData &&
        item.teneoResponse.extraData.displayCard
      ) {
        return true;
      } else {
        return false;
      }
    },
    getLongListIcon(altOptionIndex) {
      let iconName = "mdi-numeric-9-plus-box-outline";
      if (altOptionIndex + 1 <= 9) {
        iconName = "mdi-numeric-" + (altOptionIndex + 1) + "-box-outline";
      }
      return iconName;
    },
    showModal() {
      this.$store.commit("HIDE_CHAT_MODAL"); // hide all modals first
      this.$store.commit("SHOW_CHAT_MODAL", this.item);
    },
    displayFeedbackForm() {
      this.$emit("showFeedback");
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
