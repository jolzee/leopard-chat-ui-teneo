<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-card-title primary-title>
          <div>
            <h2>{{ $t('help.page.title') }}</h2>
            <div class="mt-4">
              <template>
                <v-expansion-panel>
                  <v-expansion-panel-content v-for="(item,i) in knowledgeData" :key="i" hide-actions ripple>
                    <div slot="header" @click="sendUserInput(item)">{{ item }}</div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </template>
            </div>
          </div>
        </v-card-title>
      </v-card>
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
      this.$store.commit("setUserInput", userInput);
      if (this.$store.getters.getUserInput) {
        this.$store.commit("showProgressBar");
        this.$store.dispatch("sendUserInput");
      }
      this.$router.push("/");
    }
  }
};
</script>
