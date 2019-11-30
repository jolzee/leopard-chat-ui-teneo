<template>

  <v-dialog
    v-if="showCustomModal"
    v-model="items"
    scrollable
    persistent
    no-click-animation
    content-class="teneo-modal"
    hide-overlay
    fullscreen
  >
    <v-row no-gutters>
      <v-col cols="12">
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            fab
            small
            @click="closeModal"
            color="secondary"
          >
            <v-icon
              dark
              medium
            >mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('more.info.title') }}</v-toolbar-title>
        </v-toolbar>
      </v-col>
      <v-col cols="12">
        <v-card
          class="modal-height teneo-modal-card"
          :class="{'dark-scroll': dark, 'light-scroll': !dark}"
          tile
        >
          <v-container class="modal-container">
            <span
              v-for="(item, index) in items"
              :key="index"
            >
              <div
                class="title add-padding"
                v-if="item.type === 'title'"
                v-html="item.value"
              ></div>
              <div
                class="grey--text add-padding"
                v-if="item.type === 'subtitle'"
                v-html="item.value"
              ></div>
              <div
                class="add-padding"
                v-if="item.type === 'html'"
                v-html="item.value"
              ></div>
              <YouTube
                v-if="item.type === 'youTube'"
                :videoId="item.value"
              ></YouTube>
              <Audio
                v-if="item.type === 'audio'"
                :url="item.value"
              ></Audio>
              <Vimeo
                v-if="item.type === 'vimeo'"
                :videoId="item.value"
              ></Vimeo>
              <Video
                v-if="item.type === 'video'"
                :url="item.value"
                type="mp4"
              ></Video>
              <Map
                v-if="item.type === 'map'"
                :address="item.value"
              ></Map>
              <ImageAnimation
                v-if="item.type === 'image'"
                :url="item.value"
              ></ImageAnimation>
              <Carousel
                v-if="item.type === 'carousel'"
                :imageItems="item.value"
              ></Carousel>

            </span>
          </v-container>
          <v-row
            align="start"
            justify="center"
          >
            <!-- show the close modal button -->
            <v-card-actions>
              <!-- Yes there are keyboard shortcuts to close the modal window -->
              <v-btn
                color="primary"
                v-shortkey="['ctrl', 'alt', 'arrowleft']"
                @shortkey.native="closeModal"
                @click.native="closeModal"
              >{{ $t('back.to.chat.button') }}
              </v-btn>
            </v-card-actions>
          </v-row>

        </v-card>
      </v-col>
    </v-row>

  </v-dialog>

</template>

<script>
const logger = require("@/utils/logging")("CustomModal.vue");
// import Audio from "./Audio";
// import Carousel from "./Carousel";
// import ImageAnimation from "./ImageAnimation";
// import Video from "./Video";
// import Map from "./Map";
// import Vimeo from "./Vimeo";
// import YouTube from "./YouTube";

export default {
  props: ["items", "toolbarWidth"],
  components: {
    Audio: () => import("./Audio"),
    Carousel: () => import("./Carousel"),
    ImageAnimation: () => import("./ImageAnimation"),
    Map: () => import("./Map"),
    Video: () => import("./Video"),
    Vimeo: () => import("./Vimeo"),
    YouTube: () => import("./YouTube")
  },
  data() {
    return {};
  },
  computed: {
    dark() {
      return this.$store.getters.dark;
    },
    showCustomModal() {
      if (
        this.$store.getters.showCustomModal &&
        this.items &&
        this.items.length > 0
      ) {
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