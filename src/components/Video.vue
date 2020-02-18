<template>
	<vue-plyr v-if="url && type" class="mb-2 elevation-4">
		<video autoplay="false">
			<source :src="url" :type="type" />
		</video>
	</vue-plyr>
</template>
<script>
// import VuePlyr from "vue-plyr";
// const VuePlyr = () => import("vue-plyr");
import "plyr/dist/plyr.css";

export default {
	components: { VuePlyr: () => import("vue-plyr") },
	props: {
		url: {
			type: String,
			required: true
		},
		type: {
			type: String,
			required: true
		}
	},
	data() {
		return {};
	}
};
</script>
