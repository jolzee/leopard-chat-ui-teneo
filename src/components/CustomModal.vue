<template>
  <Dialog
    v-if="showCustomModal"
    :show="showCustomModal"
    title="Additional Information"
    width="500px"
    @close="closeModal"
  >
    <v-container class="modal-container">
      <span v-for="(item, index) in items" :key="index">
        <div v-if="item.type === 'title'" class="title add-padding" v-html="item.value"></div>
        <div v-if="item.type === 'subtitle'" class="grey--text add-padding" v-html="item.value"></div>
        <div v-if="item.type === 'html'" class="add-padding" v-html="item.value"></div>
        <YouTube v-if="item.type === 'youTube'" :video-id="item.value"></YouTube>
        <Audio v-if="item.type === 'audio'" :url="item.value"></Audio>
        <Vimeo v-if="item.type === 'vimeo'" :video-id="item.value"></Vimeo>
        <Video v-if="item.type === 'video'" :url="item.value" type="mp4"></Video>
        <Map v-if="item.type === 'map'" :address="item.value"></Map>
        <ImageAnimation v-if="item.type === 'image'" :url="item.value"></ImageAnimation>
        <Carousel v-if="item.type === 'carousel'" :image-items="item.value"></Carousel>
      </span>
    </v-container>

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
    Audio: () => import("@/components/Audio"),
    Carousel: () => import("@/components/Carousel"),
    ImageAnimation: () => import("@/components/ImageAnimation"),
    Map: () => import("@/components/Map"),
    Video: () => import("@/components/Video"),
    Vimeo: () => import("@/components/Vimeo"),
    YouTube: () => import("@/components/YouTube")
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
