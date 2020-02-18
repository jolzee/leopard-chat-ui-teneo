<template>
  <div class="map-responsive mb-2 elevation-4">
    <iframe
      id="gmap_canvas"
      width="600"
      height="450"
      :src="googleMapsUrl"
      frameborder="0"
      style="border:0"
      allowfullscreen
    ></iframe>
  </div>
</template>
<script>
export default {
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    googleMapsUrl() {
      return `https://maps.google.com/maps?q=${encodeURI(
        this.address
      )}&ie=UTF8&iwloc=&output=embed`;
    }
  }
};
</script>
<style>
.map-responsive {
  overflow: hidden;
  padding-bottom: 56.25%;
  position: relative;
  height: 0;
}
.map-responsive iframe {
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>
