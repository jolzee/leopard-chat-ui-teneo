<template>
  <v-fade-transition>
    <v-overlay
      absolute
      opacity="0.65"
      z-index="123456"
      :value="showOverlayAlert"
    >
      <v-alert
        border="left"
        light
        colored-border
        type="info"
        elevation="2"
        class="mx-4"
      >{{ overlayAlertMessage }}
      </v-alert>
    </v-overlay>
  </v-fade-transition>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "OverlayAlert",
  computed: {
    ...mapGetters(["showOverlayAlert", "overlayAlertMessage"])
  }
};
</script>
<style>
</style>