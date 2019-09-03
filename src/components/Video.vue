<template>
  <vue-plyr v-if="url && type" class="mb-2">
    <video
      poster="poster.png"
      src="video.mp4"
    >
      <source
        :src="url"
        :type="type"
      />
    </video>
  </vue-plyr>
</template>
<script>
export default {
  props: ["url", "type"],
  data() {
    return {};
  }
};
</script>