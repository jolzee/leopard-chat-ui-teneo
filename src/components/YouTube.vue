<template>
  <vue-plyr v-if="videoId" :options="youtubeSettings" class="mb-2 elevation-4">
    <div class="plyr__video-embed">
      <iframe
        :src="
          `https://www.youtube.com/embed/${videoId}?iv_load_policy=3&cc_load_policy=1&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`
        "
        allowfullscreen
        allowtransparency
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    </div>
  </vue-plyr>
</template>
<script>
import "plyr/dist/plyr.css";
export default {
  components: { VuePlyr: () => import("vue-plyr") },
  props: ["videoId"],
  data() {
    return {
      youtubeSettings: {
        debug: false,
        volume: 0.25,
        controls: [
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen"
        ],
        tooltips: { controls: true, seek: true },
        youtube: {
          noCookie: false,
          origin: window.location.origin,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          modestbranding: 1,
          cc_load_policy: 1,
          enablejsapi: 1
        }
      }
    };
  }
};
</script>
