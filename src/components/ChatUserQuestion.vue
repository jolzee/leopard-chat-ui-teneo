<template>
  <v-row
    v-if="item.type === 'userInput'"
    no-gutters
  >
    <!-- user question -->
    <v-col>
      <v-card
        color="primary white--text"
        class="chat-card chat-card-right text-right pr-3 align-content-end"
      >
        {{item.text}}
      </v-card>
    </v-col>
    <v-col
      cols="2"
      class="text-center"
      v-if="showChatIcons"
    >
      <v-avatar
        v-if="authenticated && userProfileImage"
        v-long-press="1000"
        @long-press-start="swapInputButton"
        class="teneo-userinput-icon elevation-2"
        fab
        small
        @click="updateInputBox(item.text)"
      >
        <img
          :src="userProfileImage"
          :alt="displayName"
        >
      </v-avatar>
      <v-btn
        v-else
        v-long-press="1000"
        @long-press-start="swapInputButton"
        class="teneo-userinput-icon elevation-2"
        fab
        small
        color="white primary--text"
        @click="updateInputBox(item.text)"
      >
        <v-icon>{{userIcon}}</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import LongPress from "vue-directive-long-press";
import { mapGetters } from "vuex";
export default {
  name: "ChatUserQuestion",
  directives: {
    "long-press": LongPress
  },
  props: ["item"],
  methods: {
    updateInputBox(userInput) {
      this.$emit("clicked", userInput);
    },
    swapInputButton() {
      this.$emit("swapInputButton");
    }
  },
  computed: {
    ...mapGetters([
      "showChatIcons",
      "authenticated",
      "userProfileImage",
      "displayName",
      "userIcon",
      "userIcon"
    ])
  }
};
</script>

<style scoped>
.container {
  padding: 0 !important;
}
</style>
