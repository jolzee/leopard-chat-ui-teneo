<template>
  <v-card width="360">
    <v-card-media :src="teneoImage" height="200px"></v-card-media>
    <v-card-title primary-title>
      <div>
        <h3 class="headline mb-3">{{ $t('about.page.title') }}</h3>
        <div>{{ $t('about.page.content') }}
        </div>
      </div>
    </v-card-title>
    <v-layout justify-center class="pb-3">
      <v-card-actions>
        <v-btn :loading="loading" color="primary" :href="$t('about.page.url')" @click="loading = !loading">{{
          $t('about.page.button') }}
        </v-btn>
      </v-card-actions>
    </v-layout>
    <v-divider></v-divider>
  </v-card>
</template>
<style scoped>
</style>
<script>
  export default {
    data() {
      return {
        loading: false
      };
    },
    computed: {
      teneoImage() {
        return require("../assets/teneo.jpg");
      }
    }
  };
</script>
