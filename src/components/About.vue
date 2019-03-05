<template>
  <v-card class="teneo-about-card">
    <vue-plyr v-if="vimeoVideoId" class="elevation-4">
      <div class="plyr__video-embed">
        <iframe :src="`https://player.vimeo.com/video/${vimeoVideoId}?loop=false&amp;byline=false&amp;portrait=false&amp;title=false&amp;speed=true&amp;transparent=0&amp;gesture=media`" allowfullscreen allowtransparency allow="autoplay">
        </iframe>
      </div>
    </vue-plyr>

    <!-- <v-img :src="teneoImage" class="elevation-4"></v-img> -->
    <!-- <v-card-media :src="teneoImage" height="200px"></v-card-media> -->
    <v-card-title primary-title>
      <div>
        <h3 class="headline mb-3">{{ $t('about.page.title') }}</h3>
        <div>{{ $t('about.page.content') }}
        </div>
      </div>
    </v-card-title>
    <v-layout justify-center class="pb-3">
      <v-card-actions>
        <v-btn :loading="loading" color="primary" :href="$t('about.page.url')" @click="loading = !loading">{{ $t('about.page.button') }}
        </v-btn>
      </v-card-actions>
    </v-layout>
    <v-divider></v-divider>
  </v-card>
</template>
<style>
.teneo-about-card {
  width: 360px;
}

@media only screen and (max-width: 480px) {
  .teneo-about-card {
    width: 100vw !important;
  }
}
</style>
<script>
export default {
  data() {
    return {
      vimeoVideoId: 214813354,
      loading: false
    };
  },
  computed: {
    teneoImage() {
      return require("../assets/teneo.png");
    }
  }
};
</script>
