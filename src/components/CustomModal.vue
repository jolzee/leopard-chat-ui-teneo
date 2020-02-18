<template>
	<v-dialog
		v-if="showCustomModal"
		v-model="items"
		scrollable
		persistent
		no-click-animation
		content-class="teneo-modal"
		hide-overlay
		fullscreen
	>
		<v-row no-gutters>
			<v-col cols="12">
				<v-toolbar dark color="primary">
					<v-btn fab small color="secondary" @click="closeModal">
						<v-icon dark medium>mdi-close</v-icon>
					</v-btn>
					<v-toolbar-title>{{ $t("more.info.title") }}</v-toolbar-title>
				</v-toolbar>
			</v-col>
			<v-col cols="12">
				<v-card
					class="modal-height teneo-modal-card"
					:class="{ 'dark-scroll': dark, 'light-scroll': !dark }"
					tile
				>
					<v-container class="modal-container">
						<span v-for="(item, index) in items" :key="index">
							<div v-if="item.type === 'title'" class="title add-padding" v-html="item.value"></div>
							<div v-if="item.type === 'subtitle'" class="grey--text add-padding" v-html="item.value"></div>
							<div v-if="item.type === 'html'" class="add-padding" v-html="item.value"></div>
							<YouTube v-if="item.type === 'youTube'" :video-id="item.value"></YouTube>
							<Audio v-if="item.type === 'audio'" :url="item.value"></Audio>
							<Vimeo v-if="item.type === 'vimeo'" :video-id="item.value"></Vimeo>
							<Video v-if="item.type === 'video'" :url="item.value" type="mp4"></Video>
							<Map v-if="item.type === 'map'" :address="item.value"></Map>
							<ImageAnimation v-if="item.type === 'image'" :url="item.value"></ImageAnimation>
							<Carousel v-if="item.type === 'carousel'" :image-items="item.value"></Carousel>
						</span>
					</v-container>
					<v-row align="start" justify="center">
						<!-- show the close modal button -->
						<v-card-actions>
							<!-- Yes there are keyboard shortcuts to close the modal window -->
							<v-btn
								v-shortkey="['ctrl', 'alt', 'arrowleft']"
								color="primary"
								@shortkey.native="closeModal"
								@click.native="closeModal"
							>{{ $t("back.to.chat.button") }}</v-btn>
						</v-card-actions>
					</v-row>
				</v-card>
			</v-col>
		</v-row>
	</v-dialog>
</template>

<script>
const logger = require("@/utils/logging").getLogger("CustomModal.vue");

export default {
	components: {
		Audio: () => import("@/components/Audio"),
		Carousel: () => import("@/components/Carousel"),
		ImageAnimation: () => import("@/components/ImageAnimation"),
		Map: () => import("@/components/Map"),
		Video: () => import("@/components/Video"),
		Vimeo: () => import("@/components/Vimeo"),
		YouTube: () => import("@/components/YouTube")
	},
	props: {
		items: {
			type: Array,
			required: true
		}
	},
	data() {
		return {};
	},
	computed: {
		dark() {
			return this.$store.getters.dark;
		},
		showCustomModal() {
			if (this.$store.getters.showCustomModal && this.items && this.items.length > 0) {
				return true;
			}
			return false;
		}
	},
	methods: {
		closeModal() {
			this.$store.commit("HIDE_CUSTOM_MODAL");
		}
	}
};
</script>
<style>
.add-padding {
	padding: 10px;
}
</style>
