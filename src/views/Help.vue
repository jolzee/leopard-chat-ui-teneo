<template>
  <v-layout>
    <v-flex xs12>
      <v-card class="elevation-1">
        <v-card-title primary-title>
          <div>
            <h2>{{ $t('help.page.title') }}</h2>
          </div>
        </v-card-title>
      </v-card>
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(item,i) in knowledgeData"
          :key="i"
          hide-actions
          ripple
        >
          <div
            slot="header"
            @click="sendUserInput(item)"
          >{{ item }}</div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-flex>
  </v-layout>
</template>
<style scoped>
</style>
<script>
export default {
  data() {
    return {};
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
      this.$router.push("/");
    }
  }
};
</script>
