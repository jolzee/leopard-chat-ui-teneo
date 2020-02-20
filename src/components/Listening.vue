<template>
  <v-dialog v-model="value" persistent content content-class="centered-dialog pa-4">
    <v-row class="ma-0">
      <v-col cols="12" class="mt-3 text-center justify-center">
        <vue-loaders-line-scale-pulse-out-rapid
          color="#D32F2F"
          scale="2"
        ></vue-loaders-line-scale-pulse-out-rapid>
      </v-col>
      <v-col cols="12" class="pa-0 text-center justify-center">
        <div v-if="message != null" class="display-1 font-weight-bold">
          {{ message }}
        </div>
      </v-col>
    </v-row>
  </v-dialog>
</template>
<script>
const logger = require("@/utils/logging").getLogger("Listening.vue");

export default {
  name: "Loading",
  props: {
    value: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: "Listening..."
    }
  },
  data() {
    return {};
  }
};
</script>

<style>
.v-dialog.centered-dialog {
  width: auto;
  border-radius: 6px;
  color: whitesmoke;
  background: hsla(228, 100%, 1%, 0.7);
  box-shadow: none;
}
</style>
