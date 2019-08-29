<template>
  <v-card
    class="teneo-about-card"
    flat
  >
    <youTube :videoId="youTubeVideoId"></youTube>

    <v-card-title primary-title>
      <div>
        <h3 class="headline mb-3">{{ $t('about.page.title') }}</h3>
      </div>
    </v-card-title>
    <v-card-text>{{ $t('about.page.content') }}</v-card-text>
    <v-row
      justify="center"
      class="pb-3"
    >
      <v-card-actions>
        <v-btn
          :loading="loading"
          color="primary"
          :href="$t('about.page.url')"
          @click="loading = !loading"
        >{{ $t('about.page.button') }}
        </v-btn>
      </v-card-actions>
    </v-row>
    <v-divider></v-divider>
  </v-card>
</template>

<script>
import YouTube from "../components/YouTube";
export default {
  components: {
    YouTube
  },
  data() {
    return {
      youTubeVideoId: "a4LZFqz-lSg",
      loading: false
    };
  },
  computed: {}
};
</script>

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