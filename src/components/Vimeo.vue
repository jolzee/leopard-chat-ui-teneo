<template>
  <vue-plyr v-if="videoId" class="mb-2 elevation-4">
    <div class="plyr__video-embed">
      <iframe
        :src="
          `https://player.vimeo.com/video/${videoId}?loop=false&amp;byline=false&amp;portrait=false&amp;title=false&amp;speed=true&amp;transparent=0&amp;gesture=media`
        "
        allowfullscreen
        allowtransparency
        allow="autoplay"
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
  props: {
    videoId: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  }
};
</script>
