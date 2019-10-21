<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      scrollable
      max-width="320px"
    >
      <v-card>
        <v-card-title>Feedback</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 360px;">

          <v-container fluid>
            <v-row>
              <v-col
                cols="12"
                class="mb-0 pb-0"
              >
                <div class="text-center">
                  <v-rating
                    v-model="rating"
                    color="yellow darken-3"
                    background-color="grey darken-1"
                    empty-icon="$ratingFull"
                  ></v-rating>
                </div>
              </v-col>
              <v-col
                v-if="feedbackConfig.reasons"
                cols="12"
                class="mb-0 pb-0"
              >
                <v-combobox
                  v-model="reasons"
                  :items="items"
                  label="Reasons"
                  deletable-chips
                  hide-selected
                  small-chips
                  chips
                  multiple
                  outlined
                  dense
                ></v-combobox>
              </v-col>
              <v-col
                cols="12"
                class="my-0 py-0"
              >
                <v-textarea
                  outlined
                  v-model="comment"
                  name="feedbackComment"
                  label="Additional Feedback"
                  :value="comment"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>

        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-space-between">
          <v-btn
            color="blue darken-1"
            text
            @click="hideFeedback"
          >Close</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="sendFeedback"
          >Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
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
      console.log(
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
  computed: {}
};
</script>
<style>
</style>
