<template>
  <vue-plyr v-if="videoId" class="mb-2 elevation-4">
    <div class="plyr__video-embed">
      <iframe
        :src="
          `https://www.youtube.com/embed/${videoId}?iv_load_policy=1&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`
        "
        allowfullscreen
        allowtransparency
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    </div>
  </vue-plyr>
</template>
<script>
// import VuePlyr from "vue-plyr";
// const VuePlyr = () => import("vue-plyr");
import "plyr/dist/plyr.css";
export default {
  components: { VuePlyr: () => import("vue-plyr") },
  props: ["videoId"],
  data() {
    return {};
  }
};
</script>
