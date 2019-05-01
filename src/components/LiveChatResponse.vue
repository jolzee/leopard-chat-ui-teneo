<template>
  <!-- Live Chat Queue -->
  <span>
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
        </v-card>
      </v-flex>
    </v-layout>
  </span>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "LiveChatResponse",
  props: ["item"],
  computed: {
    ...mapGetters(["dark"])
  }
};
</script>

