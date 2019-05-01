<template>
  <!-- Misc Message -->
  <div v-if="item.type === 'miscMessage'">
    <v-alert
      :value="true"
      color="info"
      icon="fa-broadcast-tower"
    >{{item.text}}
    </v-alert>
  </div>
</template>

<script>
export default {
  name: "ChatBroadcastMessage",
  props: ["item"]
};
</script>