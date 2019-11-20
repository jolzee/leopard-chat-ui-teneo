<template>
  <!-- Live Chat Queue -->
  <span>
    <div v-if="item.type === 'liveChatQueue'">
      <v-alert
        :value="true"
        dense
        border="left"
        prominent
        :color="this.$vuetify.theme.dark ? 'info darken-3' : 'info lighten-2'"
        icon="mdi-counter"
        elevation="2"
      >
        {{ item.text }}
      </v-alert>
    </div>

    <!-- Live Chat Status -->
    <div
      v-if="item.type === 'liveChatStatus'"
      :class="itemIndexInDialog === 0 ? 'mt-4' : 'mt-0'"
    >
      <v-alert
        :value="true"
        dense
        border="left"
        colored-border
        color="success"
        icon="mdi-account-multiple-check"
        elevation="2"
      >
        {{ item.text }}
      </v-alert>
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
      >
        {{ item.text }}
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
        class="text-center d-none d-sm-block"
        v-if="showChatIcons && !this.$vuetify.breakpoint.xs"
      >
        <v-avatar size="40px" class="teneo-response-icon elevation-2">
          <img :src="item.agentAvatar" :alt="item.agentName" />
        </v-avatar>
      </v-col>
      <v-col class="text-left">
        <v-card
          :color="$vuetify.theme.dark ? '#333333' : '#FAFAFA'"
          class="chat-card chat-card-left text-left"
        >
          <span class="teneo-reply" v-html="item.text"> </span>
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
  props: ["item", "itemIndexInDialog"],
  computed: {
    ...mapGetters(["showChatIcons"])
  }
};
</script>
