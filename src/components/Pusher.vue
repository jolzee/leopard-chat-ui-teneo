<template>
  <v-layout
    v-if="displayPusherMessage && pusherMessage"
    row
    justify-center
  >
    <v-dialog
      v-model="showPusher"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">Notification</v-card-title>

        <v-card-text>
          {{ pusherMessage }}<br />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            flat="flat"
            @click="displayPusherMessage = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
export default {
  props: ["pusherMessage", "displayPusherMessage"],
  data() {
    return {};
  }
};
</script>