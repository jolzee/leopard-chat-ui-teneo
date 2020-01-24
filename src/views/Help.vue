<template>
  <v-card class="teneo-help-card leopard-alternative-views" flat>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card class="elevation-0">
          <v-card-title primary-title>
            <h2 class="title">{{ $t("help.page.title") }}</h2>
          </v-card-title>
        </v-card>
        <ul class="pl-0">
          <v-list-item tag="li" class="pl-0" v-for="(item, i) in knowledgeData" :key="i">
            <v-btn
              class="leopard-help-button ma-2 text-left py-2"
              style="justify-content: start; text-transform: unset; min-height:36px; height: unset; white-space: normal; width: 200px; "
              left
              block
              text
              outlined
              @click="sendUserInput(item)"
            >{{ item }}</v-btn>
          </v-list-item>
        </ul>
      </v-col>
    </v-row>
    <v-row justify="center" class="pb-3">
      <v-card-actions>
        <v-btn
          color="secondary"
          aria-label="Back to Chat Bot"
          ripple
          to="/"
        >{{ $t('back.to.chat.button') }}</v-btn>
      </v-card-actions>
    </v-row>
  </v-card>
</template>
<style scoped></style>
<script>
const logger = require("@/utils/logging").getLogger("Help.vue");
export default {
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        let element = document.getElementById("leopard-chat-toolbar-title");
        if (element) {
          element.focus();
        }
      }, 100);
    });
  },
  data() {
    return {};
  },
  beforeRouteLeave(from, to, next) {
    this.$emit("closeMenu");
    next();
  },
  computed: {
    knowledgeData() {
      return this.$store.getters.knowledgeData;
    }
  },
  methods: {
    sendUserInput(userInput) {
      this.$store.commit("SET_USER_INPUT", userInput);
      if (this.$store.getters.userInput) {
        this.$store.commit("SHOW_PROGRESS_BAR");
        this.$store.dispatch("sendUserInput");
      }
      if (this.$router.currentRoute.path !== "/") {
        this.$router.push("/"); // make sure we show the main chat window
      }
    }
  }
};
</script>
<style>
.teneo-help-card {
  width: 360px;
}

@media only screen and (max-width: 480px) {
  .teneo-help-card {
    width: 100vw !important;
  }
}

button.leopard-help-button span.v-btn__content {
  flex: unset;
}
</style>