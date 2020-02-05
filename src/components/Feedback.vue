<template>
  <v-row justify="center" v-if="dialog">
    <v-dialog
      v-model="dialog"
      scrollable
      max-width="400px"
      :fullscreen="$vuetify.breakpoint.mdAndDown"
    >
      <v-card>
        <v-app-bar :color="`primary ${textColor('primary')}`" max-height="64">
          <v-toolbar-title>Feedback</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-app-bar>

        <v-card-text style="height: 360px;" class="px-2">
          <v-container fluid>
            <v-row>
              <v-col cols="12" class="mb-0 pb-0">
                <div class="text-center">
                  <v-rating
                    v-model="rating"
                    color="primary"
                    background-color="secondary lighten-5"
                    empty-icon="$ratingFull"
                    :x-large="$vuetify.breakpoint.lgAndUp"
                    :large="$vuetify.breakpoint.md"
                    :x-small="$vuetify.breakpoint.smAndDown"
                  ></v-rating>
                </div>
              </v-col>
              <v-col v-if="feedbackConfig.reasons" cols="12" class="mb-0 pb-0">
                <v-combobox
                  v-model="reasons"
                  :items="items"
                  label="Reasons"
                  color="primary"
                  append-icon="mdi-bookmark-plus"
                  clearable
                  solo
                  deletable-chips
                  item-color="secondary"
                  hide-selected
                  small-chips
                  chips
                  multiple
                  outlined
                  dense
                ></v-combobox>
              </v-col>
              <v-col cols="12" class="my-0 py-0">
                <v-textarea
                  outlined
                  v-model="comment"
                  clearable
                  color="primary"
                  solo
                  name="feedbackComment"
                  append-icon="mdi-comment-processing-outline"
                  label="Additional Feedback"
                  hint="All feedback is welcome."
                  rows="5"
                  auto-grow
                  :value="comment"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="error" text @click="hideFeedback">Close</v-btn>
          <v-btn small color="success" @click="sendFeedback">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
const logger = require("@/utils/logging").getLogger("Feedback.vue");
import { mapGetters } from "vuex";

export default {
  name: "Feedback",
  props: ["feedbackConfig"],
  data() {
    return {
      dialogm1: "",
      dialog: true,
      rating: 4,
      reasons: [],
      comment: "",
      items: this.feedbackConfig.reasons ? this.feedbackConfig.reasons : []
    };
  },
  methods: {
    hideFeedback() {
      this.$emit("hideFeedback");
    },
    sendFeedback() {
      logger.debug(
        `Rating: ${this.rating} Reasons: ${this.reasons} Comment: ${this.comment}`
      );

      const feedback = {
        rating: this.rating,
        reasons: this.reasons,
        comment: this.comment,
        nodeId: this.feedbackConfig.nodeId
      };
      this.hideFeedback();
      this.$store.dispatch("sendFeedback", feedback);
      this.$store.commit("CLEAR_FEEDBACK_FORM"); // so it doesn't show again
      this.$store.commit("SHOW_MESSAGE_IN_CHAT", "Thanks for your feedback.");
    }
  },
  computed: {
    ...mapGetters(["textColor"])
  }
};
</script>
<style></style>
