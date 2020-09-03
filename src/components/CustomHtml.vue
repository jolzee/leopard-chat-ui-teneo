<template>
  <v-container class="custom-container">
    <span v-for="(item, index) in items" :key="index">
      <div v-if="item.type === 'title'" class="title add-padding" v-html="item.value"></div>
      <div v-if="item.type === 'subtitle'" class="grey--text add-padding" v-html="item.value"></div>
      <div v-if="item.type === 'html'" class="add-padding" v-html="item.value"></div>
      <YouTube v-if="item.type === 'youTube'" :video-id="item.value" class="mb-1"></YouTube>
      <Audio v-if="item.type === 'audio'" :url="item.value"></Audio>
      <Vimeo v-if="item.type === 'vimeo'" :video-id="item.value"></Vimeo>
      <Video v-if="item.type === 'video'" :url="item.value" type="mp4"></Video>
      <Map v-if="item.type === 'map'" :address="item.value"></Map>
      <ImageAnimation v-if="item.type === 'image'" :url="item.value"></ImageAnimation>
      <Carousel v-if="item.type === 'carousel'" :image-items="item.value"></Carousel>
    </span>
  </v-container>
</template>

<script>
const logger = require("@/utils/logging").getLogger("CustomHtml.vue");

export default {
  components: {
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
  computed: {},
  methods: {}
};
</script>
<style>
.add-padding {
  padding: 10px;
}
</style>
