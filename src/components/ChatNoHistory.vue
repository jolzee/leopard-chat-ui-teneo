<template>
  <v-layout>
    <v-flex xs12>
      <v-card>
        <v-img
          :src="noHistoryImage"
          class="elevation-4"
        ></v-img>
        <v-card-title primary-title>
          <v-card-text>
            <div class="text-xs-center">
              <h3 class="headline mb-2 text-xs-center">{{ $t('no.chat.history.title') }}</h3>
              <div class="text-xs-center">{{ $t('no.chat.history.body') }}</div>
            </div>
          </v-card-text>
        </v-card-title>
        <v-layout
          justify-center
          class="pb-3"
        >
          <v-card-actions>
            <v-btn
              dark
              color="primary"
              :to="{name: 'chat'}"
            >{{ $t('menu.chat') }}</v-btn>
            <v-btn
              dark
              color="primary"
              :to="{name: 'help'}"
            >{{ $t('menu.help') }}</v-btn>
            <v-btn
              dark
              color="primary"
              :to="{name: 'about'}"
            >{{ $t('menu.about') }}</v-btn>
          </v-card-actions>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  computed: {
    noHistoryImage() {
      return require("../assets/history.png");
    }
  }
};
</script>
