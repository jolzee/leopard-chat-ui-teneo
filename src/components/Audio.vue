<template>
  <vue-plyr v-if="url" class="mb-2">
    <audio>
      <source :src="url" :type="type" />
    </audio>
  </vue-plyr>
</template>

<script>
import VuePlyr from "vue-plyr";
import "plyr/dist/plyr.css";
const logger = require("@/utils/logging").getLogger("Audio.vue");
export default {
  components: { VuePlyr },
  props: ["url", "type"],
  data() {
    return {};
  }
};
</script>
