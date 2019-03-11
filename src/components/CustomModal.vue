<template>
  <v-layout v-if="items && items.length > 0">
    <v-flex xs12>

      <v-dialog
        v-model="items"
        leave-absolute
        scrollable
        persistent
        content-class="teneo-modal"
        hide-overlay
        fullscreen
      >
        <v-toolbar
          dark
          color="primary"
          fixed
          height="64px"
          :class="toolbarWidth"
        >
          <v-btn
            fab
            small
            @click="items = []"
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
          class="mb-1 pt-5 modal-height"
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
                @shortkey.native="items = []"
                @click.native="items = []"
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
import Carousel from "./Carousel";
import YouTube from "./YouTube";
import ImageAnimation from "./ImageAnimation";
import Audio from "./Audio";

export default {
  props: ["items", "toolbarWidth"],
  components: {
    ImageAnimation,
    Carousel,
    YouTube,
    Audio
  },
  data() {
    return {};
  }
};
</script>
<style>
.add-padding {
  padding: 10px;
}
</style>