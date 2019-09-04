<template>
  <!-- Misc Message -->
  <div v-if="item.type === 'miscMessage'">
    <v-alert
      :value="true"
      color="info"
      icon="mdi-alert-octagram"
      class="mb-0 elevation-2"
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