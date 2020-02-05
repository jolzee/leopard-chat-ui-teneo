<template>
  <transition
    name="leopard-dialog-transition"
    enter-active-class="animated flipInY"
    leave-active-class="animated fadeOutRightBig"
  >
    <v-dialog
      id="leopard-dialog"
      v-model="show"
      v-show="show"
      :transition="undefined"
      persistent
      scrollable
      max-width="80%"
      :width="width ? width : '600px'"
      :fullscreen="
        fullscreen ||
          $vuetify.breakpoint.mdAndDown
      "
      content-class="leopard-dialog resizable"
    >
      <v-card class="mx-auto">
        <v-fade-transition>
          <v-overlay absolute opacity="0.7" :value="overlay">
            <v-alert
              border="left"
              light
              colored-border
              type="info"
              elevation="2"
              @click="overlay = false"
            >"Welcome to my dialog!!"</v-alert>
          </v-overlay>
        </v-fade-transition>
        <v-system-bar
          height="25px"
          color="primary darken-3"
          :class="{
                  'grab-cursor': !fullscreen && !embed && !$vuetify.breakpoint.mdAndDown,
                  'teneo-toolbar-embed': embed && !fullscreenEmbed,
                  'teneo-toolbar-embed-fullscreen': fullscreenEmbed
                }"
          dark
        >
          <v-spacer style="height:30px" class="teneo-systembar-spacer"></v-spacer>

          <v-icon
            tabindex="0"
            tag="button"
            v-if="!embed && !$vuetify.breakpoint.mdAndDown"
            :aria-label="fullscreen ? 'Restore dialog size' : 'Maximize dialog'"
            @click="toggleFullscreen"
          >
            {{
            fullscreen ? "mdi-window-restore" : "mdi-window-maximize"
            }}
          </v-icon>

          <v-icon tag="button" aria-label="Close dialog" tabindex="0" @click="close">mdi-close</v-icon>
        </v-system-bar>

        <v-app-bar :color="`primary ${textColor('primary')}`" dense>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-app-bar>

        <v-card-text
          style="height: 90%;"
          class="px-3 py-0"
          :class="{ 'dark-scroll': dark, 'light-scroll': !dark }"
        >
          <v-container fluid>
            <v-row align="start" justify="start">
              <v-col cols="12" class="pa-2">
                <slot>Nothing passed to the dialog</slot>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="secondary white--text" @click="close">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </transition>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  name: "Dialog",
  props: ["title", "show", "width"],
  computed: {
    ...mapGetters(["uuid", "dark", "embed", "fullscreenEmbed", "textColor"])
  },
  data() {
    return {
      fullscreen: false,
      overlay: false
    };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    toggleFullscreen() {
      let dialogElements = document.getElementsByClassName("leopard-dialog");
      dialogElements[0].setAttribute("style", "");
      this.fullscreen = !this.fullscreen;
    }
  }
};
</script>
<style>
.leopard-dialog {
  overflow-x: hidden;
}

.v-dialog.v-dialog--active .grab-cursor {
  cursor: grab;
}

.v-dialog.v-dialog--active .grab-cursor:active {
  cursor: grabbing;
}
</style>
