<template>
  <v-row
    v-if="item.type === 'userInput'"
    no-gutters
    :class="itemIndexInDialog === dialog.length - 1 ? 'pb-3 pl-3 pr-1 pt-2'  : 'pl-3 pr-1 pt-2'"
  >
    <!-- user question -->
    <v-col>
      <v-card
        :color="determineCardColor()"
        tabindex="0"
        :ripple="false"
        class="chat-card chat-card-right text-right pr-3 align-content-end"
        :class="!showChatIcons || $vuetify.breakpoint.smAndDown ? `mr-2 ${leopardFont} ${questionLookAndFeel.blockBgColor}` : `${leopardFont} ${questionLookAndFeel.blockBgColor}`"
      >
        <span
          :class="`${questionLookAndFeel.blockTextColor === 'light' ? 'white--text' : ''}`"
        >{{ item.text }}</span>
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="text-center d-none d-sm-block"
      v-if="showChatIcons && !$vuetify.breakpoint.smAndDown"
    >
      <v-menu v-if="isLiveAgentAssist" close-on-click close-on-content-click offset-y>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            tabindex="-1"
            aria-label="Chat icon representing you"
            v-long-press="1000"
            @long-press-start="swapInputButton"
            class="teneo-userinput-icon"
            text
            tile
            icon
            large
            :color="`${questionLookAndFeel.iconColor} white--text`"
            @click="updateInputBox('')"
          >
            <v-icon large>{{ userIcon }}</v-icon>
          </v-btn>
        </template>

        <v-list class="liveAgentAssitMenu">
          <v-hover
            v-slot:default="{ hover }"
            v-for="menuItem in agentAssist.menu"
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
      <template v-else>
        <v-avatar
          v-if="authenticated && userProfileImage"
          v-long-press="1000"
          @long-press-start="swapInputButton"
          class="teneo-userinput-icon elevation-2"
          fab
          small
          @click="updateInputBox(item.text)"
        >
          <img :src="userProfileImage" :alt="displayName" />
        </v-avatar>
        <v-btn
          v-else
          tabindex="-1"
          aria-label="Chat icon representing you"
          v-long-press="1000"
          @long-press-start="swapInputButton"
          class="teneo-userinput-icon"
          text
          tile
          icon
          large
          :color="`${questionLookAndFeel.iconColor}`"
          @click="updateInputBox(item.text)"
        >
          <v-icon large>{{ userIcon }}</v-icon>
        </v-btn>
      </template>
      <v-snackbar
        v-model="snackbar"
        absolute
        color="primary"
        :timeout="snackBarTimeout"
        top
      >{{ snackBarText }}</v-snackbar>
      <AgentAssistTrainBotForm
        v-if="agentAssist.trainForm"
        :question="agentAssist.trainFormQuestion"
        @close="agentAssist.trainForm = false"
        @sent="handleAgentAssistBotTrainingFinished"
      />
    </v-col>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging").getLogger("ChatUserQuestion.vue");
import LongPress from "vue-directive-long-press";
import AgentAssistTrainBotForm from "./AgentAssistTrainBotForm";
import copy from "copy-to-clipboard";
var stripHtml = require("striptags");
import { mapGetters } from "vuex";
export default {
  name: "ChatUserQuestion",
  components: {
    AgentAssistTrainBotForm
  },
  directives: {
    "long-press": LongPress
  },
  props: ["item", "itemIndexInDialog"],
  data() {
    return {
      snackbar: false,
      snackBarTimeout: 1500,
      snackBarText: "Success",
      agentAssist: {
        trainForm: false,
        trainFormQuestion: null,
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
            icon: "mdi-robot",
            title: "Train bot",
            method: this.showLiveAgentTrainBotForm
          },
          {
            icon: "mdi-refresh",
            title: "Reset bot session",
            method: this.resetBotSession
          }
        ]
      }
    };
  },
  methods: {
    determineCardColor() {
      let color;
      if (this.showChatIcons && !this.$vuetify.breakpoint.smAndDown) {
        color = this.$vuetify.theme.dark ? "#333333" : "#FFFFFF";
      } else if (!this.showChatIcons || this.$vuetify.breakpoint.smAndDown) {
        color = this.$vuetify.theme.dark ? "#333333" : "primary white--text";
      } else if (this.showChatIcons && this.$vuetify.breakpoint.smAndDown) {
        color = this.$vuetify.theme.dark ? "#333333" : "primary white--text";
      }
      return color;
    },
    clearInputBox() {
      this.$emit("clicked", "");
    },
    showLiveAgentTrainBotForm() {
      this.clearInputBox();
      this.agentAssist.trainForm = true;
      this.agentAssist.trainFormQuestion = stripHtml(this.item.text);
    },
    handleAgentAssistBotTrainingFinished() {
      this.agentAssist.trainForm = false;
      this.snackBarText = "👨‍🏫 Training received. Thanks";
      this.snackbar = true;
    },
    resetBotSession() {
      this.$store.dispatch("endSessionLite").then(() => {
        this.snackBarText = "♻ Bot session reset";
        this.snackbar = true;
      });
    },
    copyToClipboard() {
      copy(stripHtml(this.item.text));
      this.snackBarText = "📋 Copied to your clipboard";
      this.snackbar = true;
    },
    sendToLiveChatAgentInputBox() {
      this.$store.dispatch("putLiveChatAgentMessage", this.item.text);
    },
    updateInputBox(userInput) {
      this.$emit("clicked", userInput);
    },
    swapInputButton() {
      this.$emit("swapInputButton");
    }
  },
  computed: {
    ...mapGetters([
      "leopardFont",
      "questionLookAndFeel",
      "isLiveAgentAssist",
      "showChatIcons",
      "dialogs",
      "getLatestDialogHistory",
      "authenticated",
      "userProfileImage",
      "displayName",
      "userIcon"
    ]),
    dialog() {
      if (this.$route.name === "chat") {
        return this.dialogs ? this.dialogs : [];
      } else {
        // history in session storage
        return this.getLatestDialogHistory ? this.getLatestDialogHistory : [];
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 0 !important;
}
</style>
