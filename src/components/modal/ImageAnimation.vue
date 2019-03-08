<template>
  <!-- <transition
    v-if="url"
    name="modal-image-transition"
    enter-active-class="animated zoomIn"
  > -->
  <v-img
    v-if="url"
    :src="url"
    contain
    height="auto"
  ></v-img>
  <!-- </transition> -->
</template>
<script>
export default {
  props: ["url"],
  data() {
    return {};
  }
};
</script>