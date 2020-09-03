<template>
  <v-card v-if="isValidCard" class="mx-2 mt-2 pa-2" max-width="400">
    <CustomHtml :items="customHtmlItems"></CustomHtml>
  </v-card>
</template>
<script>
import { mapGetters } from "vuex";
const logger = require("@/utils/logging").getLogger("CardCustomHtml.vue");

export default {
  components: {
    CustomHtml: () => import("@/components/CustomHtml")
  },
  name: "Card",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      customHtmlItems: []
    };
  },
  created() {
    const cardCustomHtml = this.getNamedExtension(this.item, "displayCardCustomHtml");
    if (cardCustomHtml) {
      this.customHtmlItems = cardCustomHtml.items;
    }
  },
  computed: {
    ...mapGetters(["getNamedExtension"]),
    isValidCard() {
      const cardCustomHtml = this.getNamedExtension(this.item, "displayCardCustomHtml");
      if (cardCustomHtml) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {}
};
</script>

<style></style>
