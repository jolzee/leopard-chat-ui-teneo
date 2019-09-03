<template>
  <v-row justify="center">
    <v-container class="fill-height">
      <v-row
        justify="center"
        align="center"
      >
        <vue-loaders-line-scale-pulse-out-rapid
          color="#D7D7D7"
          size="50px"
        ></vue-loaders-line-scale-pulse-out-rapid>
      </v-row>
    </v-container>
  </v-row>
</template>
<script>
export default {
  name: "DelayedResponse",
  data: function() {
    return {};
  },
  props: {}
};
</script>

<style>
</style>