<template>
  <!-- <transition
    v-if="url"
    name="modal-image-transition"
    enter-active-class="zoomIn"
  >-->
  <v-img
    v-if="url"
    :src="url"
    :max-height="determineMaxHeight()"
    lazy-src="@/assets/placeholder-image-300x207.png"
    contain
  >
    <template v-slot:placeholder>
      <v-row class="fill-height ma-0" align="center" justify="center">
        <v-progress-circular indeterminate color="secondary lighten-2"></v-progress-circular>
      </v-row>
    </template>
  </v-img>
  <!-- </transition> -->
</template>
<script>

var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    determineMaxHeight() {
      let params = getParams(this.url);
      if (params.width) {
        return params.width;
      } else {
        return "230";
      }
    }
  }
};
</script>
