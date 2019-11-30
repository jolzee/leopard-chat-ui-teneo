<template>
  <vue-plyr
    v-if="url"
    class="mb-2"
  >
    <audio>
      <source
        :src="url"
        :type="type"
      />
    </audio>
  </vue-plyr>
</template>

<script>
const logger = require("@/utils/logging")("Audio.vue");
export default {
  props: ["url", "type"],
  data() {
    return {};
  }
};
</script>
