<template>
  <v-carousel
    :height="height"
    hide-delimiters
    v-if="imageItems && imageItems.length"
  >
    <v-carousel-item
      v-for="(imageUrl,i) in imageItems"
      :key="i"
      :src="imageUrl"
    ></v-carousel-item>
  </v-carousel>
</template>

<script>
export default {
  props: ["imageItems"],
  data() {
    return {
      height: 200
    };
  },
  computed: {}
};
</script>
