<template>
  <!-- <transition
    v-if="url"
    name="modal-image-transition"
    enter-active-class="zoomIn"
  >-->
  <v-img
    v-if="url"
    :src="url"
    :max-height="determineMaxHeight()"
    lazy-src="@/assets/placeholder-image-300x207.png"
    contain
  >
    <template v-slot:placeholder>
      <v-row class="fill-height ma-0" align="center" justify="center">
        <v-progress-circular indeterminate color="secondary lighten-2"></v-progress-circular>
      </v-row>
    </template>
  </v-img>
  <!-- </transition> -->
</template>
<script>
export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
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
