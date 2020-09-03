<template>
  <Dialog
    v-if="showCustomModal"
    :show="showCustomModal"
    title="Additional Information"
    width="500px"
    @close="closeModal"
  >
    <CustomHtml :items="items" />

    <!-- <template v-slot:buttons>
      <v-btn small color="green lighten-4 black--text" @click="importDialog = false">Cancel</v-btn>
      <v-btn small color="green lighten-4 black--text" @click="closeModal">Back to Chat</v-btn>
    </template>-->
  </Dialog>
</template>

<script>
const logger = require("@/utils/logging").getLogger("CustomModal.vue");

export default {
  components: {
    Dialog: () => import("@/components/Dialog"),
    CustomHtml: () => import("@/components/CustomHtml")
  },
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    dark() {
      return this.$store.getters.dark;
    },
    showCustomModal() {
      if (this.$store.getters.showCustomModal && this.items && this.items.length > 0) {
        return true;
      }
      return false;
    }
  },
  methods: {
    closeModal() {
      this.$store.commit("HIDE_CUSTOM_MODAL");
    }
  }
};
</script>
<style>
.add-padding {
  padding: 10px;
}
</style>
