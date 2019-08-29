<template>
  <!-- Live Chat Queue -->
  <span>
    <div v-if="item.type === 'liveChatQueue'">
      <v-alert
        :value="true"
        color="info"
        icon="fa-clock"
        elevation="2"
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
        elevation="2"
      >
        {{item.text}}
      </v-alert>
    </div>
    <div v-if="item.type === 'liveChatEnded'">
      <v-alert
        :value="true"
        color="info"
        icon="fa-hand-paper"
        elevation="2"
      >
        {{item.text}}
      </v-alert>
    </div>
    <!-- Live Chat Response -->
    <!-- start -->
    <v-row
      v-if="item.type === 'liveChatResponse' && item.text !== '<p>'"
      class="my-1"
      no-gutters
      justify="start"
    >
      <v-col
        cols="2"
        class="text-center"
        v-if="showChatIcons"
      >
        <v-avatar
          size="40px"
          class="teneo-response-icon elevation-2"
        >
          <img
            :src="item.agentAvatar"
            :alt="item.agentName"
          >
        </v-avatar>
      </v-col>
      <v-col class="text-left">
        <v-card
          :color="$vuetify.theme.dark ? '#333333' : '#FAFAFA'"
          class="chat-card chat-card-left text-left"
        >
          <span
            v-html="item.text"
            class="teneo-reply"
          ></span>
        </v-card>
      </v-col>

    </v-row>
    <!-- end -->

  </span>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "LiveChatResponse",
  props: ["item"],
  computed: {
    ...mapGetters(["showChatIcons"])
  }
};
</script>

