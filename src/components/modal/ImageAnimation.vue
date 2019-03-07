<template>
  <transition
    v-if="url"
    name="modal-image-transition"
    enter-active-class="animated zoomIn"
  >
    <v-img
      :src="url"
      contain
      height="200px"
    ></v-img>
  </transition>
</template>
<script>
export default {
  props: ["url"],
  data() {
    return {};
  }
};
</script>