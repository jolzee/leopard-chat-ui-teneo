<template>
  <v-row v-if="dialog" justify="center">
    <v-dialog v-model="dialog" persistent max-width="500" content-class="trainbot">
      <v-card>
        <v-card-title class="title">
          <v-icon class="mr-2" color="primary">mdi-teach</v-icon>Train Bot
        </v-card-title>
        <v-card-text class="px-1">
          <v-col cols="12">
            <v-alert
              border="top"
              colored-border
              color="success"
              elevation="2"
              icon="mdi-comment-question-outline"
              >{{ question }}</v-alert
            >
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="answer"
              solo
              name="answer"
              rows="3"
              label="Expected Answer"
              placeholder="Write your expected answer here"
              hint="Expected Answer"
              auto-grow
              outlined
              persistent-hint
              append-icon="mdi-comment-check-outline"
            ></v-textarea>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="comment"
              solo
              name="comment"
              rows="3"
              label="Additional Comments"
              placeholder="Provide a helpful explanation to the C.A.I Developers of this bot"
              hint="Additional Comments"
              auto-grow
              outlined
              persistent-hint
              append-icon="mdi-information-outline"
            ></v-textarea>
          </v-col>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="$emit('close')">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="trainTeneo">Train</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging").getLogger("AgentAssistTrainBotForm.vue");

export default {
  name: "AgentAsssitTrainBotForm",
  props: {
    question: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      dialog: true,
      answer: null,
      comment: ""
    };
  },
  computed: {},
  mounted() {
    this.$store.commit("SET_USER_INPUT", "");
  },
  methods: {
    trainTeneo() {
      this.$store.commit("SET_USER_INPUT", "");
      const params = `&command=train&question=${encodeURIComponent(
        this.question
      )}&answer=${encodeURIComponent(this.answer)}&comment=${encodeURIComponent(this.comment)}`;
      this.$store.dispatch("sendUserInput", params);
      this.$emit("sent");
    }
  }
};
</script>
<style></style>
