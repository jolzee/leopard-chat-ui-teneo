<template>
  <v-layout
    row
    justify-center
  >
    <v-container fill-height>
      <v-layout
        column
        justify-center
        align-center
      >
        <line-scale-pulse-out-rapid-loader
          color="#D7D7D7"
          size="50px"
        ></line-scale-pulse-out-rapid-loader>
      </v-layout>
    </v-container>
  </v-layout>
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