<template>
  <v-card v-if="isValidCard" class="mx-2 mt-2" max-width="400">
    <v-img
      v-if="config.imageUrl"
      class="white--text align-end"
      contain
      :src="config.imageUrl"
    ></v-img>
    <v-card-title
      v-if="config.title"
      class="subtitle-2 white--text primary cardTitleBackground mb-5"
      >{{ config.title }}</v-card-title
    >
    <v-card-subtitle v-if="config.subTitle" class="pb-1">{{ config.subTitle }}</v-card-subtitle>

    <v-card-text v-if="config.bodyText" class="text--primary">{{ config.bodyText }}</v-card-text>

    <v-card-text v-if="config.chips" class="my-0 py-0">
      <v-chip-group v-model="chipSelectionIndex" active-class="secondary white--text" column>
        <v-chip v-for="(chip, index) in config.chips" :key="'chip' + index">{{ chip.name }}</v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions v-if="config.actions">
      <v-spacer></v-spacer>
      <v-btn
        v-for="(action, index) in config.actions"
        :key="'action' + index"
        :disabled="config.chips && chipSelectionIndex === null"
        small
        color="secondary"
        @click="actionClicked(action)"
        >{{ action.name }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>
<script>
const logger = require("@/utils/logging").getLogger("Card.vue");

export default {
  name: "Card",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chipSelectionIndex: null
    };
  },
  computed: {
    isValidCard() {
      try {
        const theConfig = decodeURIComponent(this.item.teneoResponse.extraData.displayCard);
        JSON.parse(theConfig);
        return true;
      } catch (e) {
        return false;
      }
    },
    config() {
      const theConfig = decodeURIComponent(this.item.teneoResponse.extraData.displayCard);
      logger.debug(`Card JSON`, theConfig);
      return JSON.parse(theConfig);
    }
  },
  methods: {
    actionClicked(action) {
      let responseText = "";
      let responseParameters = "";
      if (this.chipSelectionIndex !== null) {
        const selectedChip = this.config.chips[this.chipSelectionIndex];
        responseText = selectedChip.name;
        responseParameters = `&${selectedChip.params}`;
      } else {
        responseText = action.name;
      }
      responseParameters += `&${action.params}`;
      this.$store.commit("SHOW_PROGRESS_BAR");
      this.$store.commit("SET_USER_INPUT", responseText);
      const optionClickParam = "&isClick=true";
      this.$store.dispatch("sendUserInput", responseParameters + optionClickParam).then(() => {
        logger.debug("Card info sent to Teneo");
      });
    }
  }
};
</script>

<style></style>
