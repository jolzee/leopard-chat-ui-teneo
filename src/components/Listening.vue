<template>
  <v-layout
    row
    justify-center
  >
    <v-dialog
      v-model="value"
      persistent
      content
      content-class="centered-dialog"
    >
      <v-container fill-height>
        <v-layout
          column
          justify-center
          align-center
        >
          <line-scale-pulse-out-rapid-loader
            color="#D32F2F"
            size="90px"
          ></line-scale-pulse-out-rapid-loader>
          <h1 v-if="message != null">{{message}}</h1>
        </v-layout>
      </v-container>
    </v-dialog>
  </v-layout>
</template>
<script>
export default {
  name: "Loading",
  data: function() {
    return {};
  },
  props: {
    value: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: "Listening..."
    }
  }
};
</script>

<style>
.v-dialog.centered-dialog {
  background: hsla(228, 100%, 1%, 0.7);
  box-shadow: none;
  border-radius: 6px;
  width: auto;
  color: whitesmoke;
}
</style>
