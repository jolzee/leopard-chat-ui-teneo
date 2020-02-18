<template>
	<v-carousel
		v-if="imageItems && imageItems.length"
		:height="height"
		hide-delimiters
		show-arrows-on-hover
		cycle
		dark
		continuous
		interval="5000"
		progress
		progress-color="secondary"
		class="mb-2 elevation-2"
	>
		<v-carousel-item v-for="(imageUrl, i) in imageItems" :key="i" :src="imageUrl"></v-carousel-item>
	</v-carousel>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Carousel.vue");

export default {
	props: {
		imageItems: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			height: 200
		};
	},
	computed: {}
};
</script>
