<template>
  <v-row
    justify="center"
    align="center"
    class="loading-ball text-center pt-5 mt-5"
  >
    <v-col
      cols="12"
      class="mt-5 pt-5"
    >
      <vue-loaders-line-scale
        color="#C2C2C2"
        scale="3"
      ></vue-loaders-line-scale>
    </v-col>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging")("ChatLoading.vue");
export default {};
</script>
