<template>
  <vue-plyr v-if="url">
    <audio>
      <source
        :src="url"
        :type="type"
      />
    </audio>
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