<template>
  <v-alert
    :border="config.border ? config.border : undefined"
    :color="config.color ? config.color : 'primary'"
    :light="config.light ? config.light : false"
    :dark="config.light ? !config.light : true"
    :colored-border="config.coloredBorder ? config.coloredBorder : false"
    :elevation="config.elevation ? config.elevation : '2'"
    :dense="config.dense ? config.dense : false"
    :icon="config.icon ? `mdi-${config.icon}` : undefined"
    :outlined="config.outlined ? config.outlined : false"
    :prominent="config.prominent ? config.prominent : false"
    class="mx-4 mb-1"
  >
    <span v-html="config.text"></span>
  </v-alert>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Alert",
  props: ["config"],
  computed: {
    ...mapGetters([])
  }
};
</script>
<style></style>
