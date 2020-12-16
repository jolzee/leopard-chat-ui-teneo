<template>
  <!-- Misc Message -->
  <div v-if="item.type === 'miscMessage'" class="mt-2 mx-3 pb-3">
    <v-alert
      :border="item.borderPosition"
      :value="true"
      :prominent="item.prominent"
      colored-border
      :outlined="item.outlined"
      :type="item.alertType ? item.alertType : null"
      :color="item.color"
      :icon="item.icon"
      class="mb-0 elevation-2"
    >
      <p>{{ item.message }}</p>
    </v-alert>
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("ChatBroadcastMessage.vue");

export default {
  name: "ChatBroadcastMessage",
  props: {
    item: {
      type: Object,
      required: true
    }
  }
};
</script>
