<template>
  <v-layout v-if="showCustomModal">
    <v-flex xs12>

      <v-dialog
        v-model="items"
        scrollable
        persistent
        content-class="teneo-modal"
        hide-overlay
        fullscreen
      >
        <v-toolbar
          dark
          color="primary"
          height="64"
          fixed
          :class="toolbarWidth"
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
            >close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('more.info.title') }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card
          class="mb-1 pt-5 modal-height teneo-modal-card"
          :class="{'dark-scroll': dark, 'light-scroll': !dark}"
          tile
        >
          <v-container class="modal-container">
            <span
              v-for="(item, index) in items"
              :key="index"
            >
              <div
                class="modal-headline add-padding"
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
          <v-layout
            align-start
            justify-center
            row
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
          </v-layout>

        </v-card>

      </v-dialog>

    </v-flex>
  </v-layout>
</template>

<script>
import Audio from "./Audio";
import Carousel from "./Carousel";
import ImageAnimation from "./ImageAnimation";
import Video from "./Video";
import Vimeo from "./Vimeo";
import YouTube from "./YouTube";

export default {
  props: ["items", "toolbarWidth"],
  components: {
    Audio,
    Carousel,
    ImageAnimation,
    Video,
    Vimeo,
    YouTube
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