<template>
  <vue-plyr v-if="url" class="mb-2 elevation-2">
    <audio>
      <source :src="url" :type="type" />
    </audio>
  </vue-plyr>
</template>

<script>
// const VuePlyr = () => import("vue-plyr");
import "plyr/dist/plyr.css";
const logger = require("@/utils/logging").getLogger("Audio.vue");
export default {
  components: { VuePlyr: () => import("vue-plyr") },
  props: ["url", "type"],
  data() {
    return {};
  }
};
</script>
