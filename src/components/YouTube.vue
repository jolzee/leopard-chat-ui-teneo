<template>
  <div v-if="videoId">
    <vue-plyr :options="youtubeSettings" class="mb-2 elevation-4">
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
    <v-btn
      aria-label="Play on YouTube opens in a new window"
      :color="`secondary ${textColor('secondary')}`"
      class="ml-2"
      x-small
      dark
      :href="`https://www.youtube.com/watch?v=${videoId}`"
      target="_blank"
    >{{ $t('youtube.open') }}</v-btn>
  </div>
</template>
<script>
import "plyr/dist/plyr.css";
import { mapGetters } from "vuex";

export default {
  components: { VuePlyr: () => import("vue-plyr") },
  props: {
    videoId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      youtubeSettings: {
        debug: false,
        volume: 0.25,
        controls: ["play", "progress", "current-time", "mute", "volume", "fullscreen"],
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
  },
  computed: {
    ...mapGetters(["textColor"])
  }
};
</script>
