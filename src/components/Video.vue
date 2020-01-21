<template>
  <vue-plyr v-if="url && type" class="mb-2 elevation-4">
    <video autoplay="false">
      <source :src="url" :type="type" />
    </video>
  </vue-plyr>
</template>
<script>
import VuePlyr from "vue-plyr";
import "plyr/dist/plyr.css";
export default {
  components: { VuePlyr },
  props: ["url", "type"],
  data() {
    return {};
  }
};
</script>
