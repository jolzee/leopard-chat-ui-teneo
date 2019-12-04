<template>
  <!-- Misc Message -->
  <div v-if="item.type === 'miscMessage'" class="mt-2 mx-3 pb-3">
    <v-alert
      :border="item.alertBorderPosition"
      :value="true"
      :prominent="item.alertProminent"
      :outlined="item.alertOutlined"
      :type="item.alertType"
      :color="item.alertColor"
      :icon="item.alertIcon"
      class="mb-0 elevation-2"
    >{{ item.alertText }}</v-alert>
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("ChatBroadcastMessage.vue");
export default {
  name: "ChatBroadcastMessage",
  props: ["item"]
};
</script>
