<template>
  <v-layout
    align-start
    justify-end
    row
    fill-height
    v-if="item.type === 'userInput'"
  >
    <!-- user question -->
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
      <v-avatar
        v-if="authenticated && userProfileImage"
        v-long-press="swapInputButton"
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
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "ChatUserQuestion",
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
