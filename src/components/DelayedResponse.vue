<template>
  <v-row justify="center">
    <v-container class="fill-height">
      <v-row
        justify="center"
        align="center"
      >
        <line-scale-pulse-out-rapid-loader
          color="#D7D7D7"
          size="50px"
        ></line-scale-pulse-out-rapid-loader>
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