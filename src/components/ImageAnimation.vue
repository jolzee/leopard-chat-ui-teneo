<template>
  <!-- <transition
    v-if="url"
    name="modal-image-transition"
    enter-active-class="animated zoomIn"
  > -->
  <v-img
    v-if="url"
    :src="url"
    :max-height="determineMaxHeight()"
    contain
  ></v-img>
  <!-- </transition> -->
</template>
<script>
export default {
  props: ["url"],
  data() {
    return {};
  },
  methods: {
    determineMaxHeight() {
      if (this.url.includes("/weather/")) {
        return 100;
      }
      return "230";
    }
  }
};
</script>
