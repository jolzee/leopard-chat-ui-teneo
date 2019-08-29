<template>
  <v-row no-gutters>
    <v-col cols="12">
      <v-card class="elevation-0">
        <v-card-title primary-title>
          <h5>{{ $t('help.page.title') }}</h5>
        </v-card-title>
      </v-card>
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(item,i) in knowledgeData"
          :key="i"
        >
          <v-expansion-panel-header
            @click="sendUserInput(item)"
            :hide-actions="true"
          >
            {{ item }}
          </v-expansion-panel-header>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>
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
