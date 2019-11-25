<template>
  <vue-plyr
    v-if="url && type"
    class="mb-2"
  >
    <video autoplay="false">
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