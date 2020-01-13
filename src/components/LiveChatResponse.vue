<template>
  <!-- Live Chat Queue -->
  <div v-if="isLiveChatRelated" class="mx-3">
    <div v-if="item.type === 'liveChatQueue'" class="mt-4">
      <v-alert
        :value="true"
        dense
        border="left"
        prominent
        :color="$vuetify.theme.dark ? 'info darken-3' : 'info lighten-2'"
        icon="mdi-counter"
        elevation="2"
      >{{ item.text }}</v-alert>
    </div>

    <!-- Live Chat Status -->
    <div
      v-if="item.type === 'liveChatStatus'"
      :class="itemIndexInDialog === 0 ? 'mt-4' : 'mt-0 mb-0'"
    >
      <v-alert
        :value="true"
        dense
        border="left"
        colored-border
        color="success"
        icon="mdi-account-multiple-check"
        elevation="2"
        :class="itemIndexInDialog !== 0 && itemIndexInDialog !== dialog.length - 1 ? 'mb-0' : ''"
      >{{ item.text }}</v-alert>
    </div>
    <div v-if="item.type === 'liveChatEnded'" class="mt-4">
      <v-alert
        :value="true"
        color="warning"
        dense
        border="left"
        colored-border
        icon="mdi-account-multiple-minus"
        elevation="2"
      >{{ item.text }}</v-alert>
    </div>
    <!-- Live Chat Response -->
    <!-- start -->
    <v-row
      v-if="item.type === 'liveChatResponse' && item.text !== '<p>'"
      class="mt-4"
      :class="itemIndexInDialog === dialog.length - 1 ? 'mb-3' : ''"
      no-gutters
      justify="start"
    >
      <v-col
        cols="2"
        class="text-center d-none d-sm-block"
        v-if="showChatIcons && !$vuetify.breakpoint.smAndDown"
      >
        <v-avatar size="40px" class="teneo-response-icon elevation-2">
          <img :src="item.agentAvatar" :alt="item.agentName" />
        </v-avatar>
      </v-col>
      <v-col class="text-left">
        <v-card
          :color="$vuetify.theme.dark ? '#333333' : `${responseLookAndFeel.blockBgColor}`"
          class="chat-card chat-card-left text-left"
        >
          <p class="sr-only">Live agent said.</p>
          <p
            class="teneo-reply"
            :class="`${leopardFont} ${responseLookAndFeel.blockTextColor === 'light' ? 'white--text' : ''}`"
            v-html="item.text"
          ></p>
        </v-card>
      </v-col>
    </v-row>
    <!-- end -->
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("LiveChatResponse.vue");
import { mapGetters } from "vuex";
export default {
  name: "LiveChatResponse",
  props: ["item", "itemIndexInDialog"],
  computed: {
    ...mapGetters([
      "showChatIcons",
      "dialogs",
      "getLatestDialogHistory",
      "leopardFont",
      "responseLookAndFeel"
    ]),
    dialog() {
      if (this.$route.name === "chat") {
        return this.dialogs ? this.dialogs : [];
      } else {
        // history in session storage
        return this.getLatestDialogHistory ? this.getLatestDialogHistory : [];
      }
    },
    isLiveChatRelated() {
      let isLiveChat = false;
      if (this.item.type.startsWith("liveChat")) {
        isLiveChat = true;
      }
      return isLiveChat;
    }
  }
};
</script>
