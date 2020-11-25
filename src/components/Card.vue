<template>
  <v-card v-if="isValidCard" class="mx-2 mt-2" max-width="400">
    <v-img
      v-if="config.imageUrl"
      class="white--text align-end"
      contain
      :src="config.imageUrl"
      :alt="config.imageAlt ? config.imageAlt : ''"
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
    <div v-if="config.buttons" class="text-center">
      <span v-for="(action, index) in config.buttons" :key="'button' + index" class="ma-1">
        <v-btn small color="secondary" @click="buttonClicked(action)" class="mb-2">{{
          action
        }}</v-btn>
      </span>
    </div>
    <div v-if="config.linkButtons" class="text-center">
      <span
        v-for="(linkButton, index) in config.linkButtons"
        :key="'button-link' + index"
        class="ma-1"
      >
        <v-btn
          min-height="25"
          class="mb-2"
          x-small
          color="secondary"
          :aria-label="linkButton.title"
          @click="linkButtonClicked(linkButton)"
        >
          <v-icon left style="padding-top: 2px; opacity: 0.7 !important">{{
            `mdi-${
              linkButton.target && linkButton.target === "_blank"
                ? "open-in-new"
                : "link-box-variant"
            }`
          }}</v-icon>
          {{ linkButton.title }}
        </v-btn>
      </span>
    </div>
    <v-card-actions v-if="config.clickableList">
      <v-list class="elevation-1" style="width: 100%">
        <v-list-item-group>
          <template v-for="(option, altOptionIndex) in config.clickableList">
            <v-list-item
              :key="altOptionIndex + 'card-list' + uuid"
              :aria-label="option"
              dense
              ripple
              :input-value="option.color ? true : false"
              @click="buttonClicked(option)"
            >
              <v-list-item-content class="text-left">
                <v-list-item-subtitle
                  style="white-space: unset"
                  v-html="option"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
        </v-list-item-group>
      </v-list>
    </v-card-actions>
  </v-card>
</template>
<script>
const logger = require("@/utils/logging").getLogger("Card.vue");
import { mapGetters } from "vuex";
const TIE = require("leopard-tie-client");

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
    ...mapGetters(["uuid"]),
    isValidCard() {
      let result = false;
      if (this.item.teneoResponse) {
        const tResp = TIE.wrap(this.item.teneoResponse);
        if (tResp.hasParameter("displayCard")) {
          result = true;
        }
      }
      return result;
    },
    config() {
      const tResp = TIE.wrap(this.item.teneoResponse);
      let theConfig = tResp.getParameter("displayCard");
      logger.debug(`Card JSON`, theConfig);
      return theConfig;
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
    },
    linkButtonClicked(linkButton) {
      if (linkButton.target && linkButton.target === "_blank") {
        let win = window.open(linkButton.url, "_blank");
        win.focus();
      } else {
        window.location.href = linkButton.url;
      }
    },
    buttonClicked(text) {
      this.$store.commit("SHOW_PROGRESS_BAR");
      this.$store.commit("SET_USER_INPUT", text);
      this.$store.dispatch("sendUserInput").then(() => {
        logger.debug("Card button click sent to Teneo");
      });
    }
  }
};
</script>

<style></style>
