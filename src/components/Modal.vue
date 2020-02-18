<template>
	<span>
		<CustomModal :items="customModalItems" :toolbar-width="toolbarWidth"></CustomModal>
		<!-- Display Pusher Message -->
		<!-- <Pusher
      :displayPusherMessage="displayPusherMessage"
      :pusherMessage="pusherMessage"
		></Pusher>-->

		<!-- show normal message -->
		<v-dialog
			v-if="showModal"
			v-model="showModal"
			leave-absolute
			scrollable
			persistent
			no-click-animation
			:content-class="
				embed && !fullscreenEmbed
					? 'teneo-modal-embed'
					: fullscreenEmbed
					? 'teneo-modal-fullscreen'
					: 'teneo-modal'
			"
			hide-overlay
			:width="
				currentModalSize === 'small'
					? 360
					: currentModalSize === 'medium'
					? 500
					: currentModalSize === 'large'
					? 700
					: 900
			"
			:fullscreen="
				fullscreen ||
					currentModalSize === 'fullscreen' ||
					currentModalPosition === 'fullscreen' ||
					$vuetify.breakpoint.mdAndDown
			"
		>
			<v-card>
				<v-fade-transition>
					<v-overlay absolute opacity="0.7" :value="overlay">
						<v-alert
							border="left"
							light
							colored-border
							type="info"
							elevation="2"
							@click="overlay = false"
						>{{ overlayMessage }}</v-alert>
					</v-overlay>
				</v-fade-transition>
				<v-system-bar
					height="25px"
					color="primary darken-3"
					:class="{
						'grab-cursor': !fullscreen && !embed && !$vuetify.breakpoint.mdAndDown,
						'teneo-toolbar-embed': embed && !fullscreenEmbed,
						'teneo-toolbar-embed-fullscreen': fullscreenEmbed
					}"
					dark
				>
					<v-spacer style="height:30px" class="teneo-systembar-spacer"></v-spacer>
					<v-icon
						v-if="
							currentModalPosition !== 'fullscreen' &&
								currentModalSize !== 'fullscreen' &&
								!embed &&
								!$vuetify.breakpoint.mdAndDown
						"
						tabindex="0"
						tag="button"
						:aria-label="fullscreen ? 'Restore dialog size' : 'Maximize dialog'"
						@click="toggleFullscreen"
					>{{ fullscreen ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
					<v-icon tag="button" aria-label="Close dialog" tabindex="0" @click="hideModal">mdi-close</v-icon>
				</v-system-bar>

				<v-app-bar :dense="title.length < 43" :color="`primary ${textColor('primary')}`">
					<h2
						class="subtitle-1"
						:aria-label="aria ? aria : title ? title : $t('more.info.title')"
					>{{ title ? title : $t("more.info.title") }}</h2>
					<v-spacer></v-spacer>
				</v-app-bar>
				<v-card-text
					style="height: 90%;"
					class="px-2 mx-0 py-0"
					:class="{ 'dark-scroll': dark, 'light-scroll': !dark }"
				>
					<v-container fluid>
						<v-row align="start" justify="start">
							<v-col cols="12" class="pa-2">
								<!-- display the modal title and sub-title -->

								<!-- Sub-Title -->
								<div v-if="subTitle" class="subtitle-2 font-weight-bold" v-html="subTitle"></div>

								<!-- YouTube -->
								<YouTube :video-id="youTubeVideoId"></YouTube>

								<!-- Vimeo -->
								<Vimeo :video-id="vimeoVideoId"></Vimeo>

								<!-- Audio -->
								<Audio :url="audioUrl"></Audio>

								<!-- Misc Video -->
								<Video :url="videoUrl" :type="videoType"></Video>

								<!-- Gogle Map -->
								<Map v-if="address" :address="address"></Map>

								<!-- show an image if available -->
								<ImageAnimation :url="imageUrl"></ImageAnimation>

								<!-- show a carousel of images if available -->
								<Carousel :image-items="images"></Carousel>

								<!-- Show the body text, flight itineary, and any tables if available -->
								<div
									v-if="itinerary || bodyText || transactionItems.length || tableRows.length"
									class="mt-3"
								>
									<!-- Show the flight itinerary -->
									<FlightItinerary :itinerary="itinerary"></FlightItinerary>

									<!-- show the body text -->
									<v-card-text
										v-if="bodyText"
										id="chat-modal-html"
										class="cardText"
										scrollable
										v-html="bodyText"
									></v-card-text>

									<!-- data tables -->
									<v-row
										v-if="transactionItems.length > 0 || tableRows.length > 0"
										class="fill-height mx-1"
										align="end"
										justify="start"
									>
										<!-- table title -->
										<v-row v-if="tableTitle">
											<v-col cols="8" class="ml-4">
												<h3>{{ tableTitle }}</h3>
											</v-col>
										</v-row>
										<v-spacer v-else></v-spacer>
										<!-- show a search input box for the table -->
										<v-col v-if="tableEnableSearch" cols="4" class="mr-2">
											<v-text-field
												v-model="search"
												append-icon="mdi-table-search"
												label="Search"
												single-line
												hide-details
											></v-text-field>
										</v-col>
									</v-row>

									<!-- Show the MyBank Transactions as a Table -->
									<MyBankTransactions
										:headers="transactionHeaders"
										:items="transactionItems"
										:search="search"
									></MyBankTransactions>

									<!-- Show a Generic Data Table -->
									<Table
										:headers="tableHeaders"
										:items="tableRows"
										:search="search"
										:footer="tableFooter"
										:rows-per-page="tableRowsPerPage"
									></Table>
								</div>
							</v-col>
						</v-row>
					</v-container>
				</v-card-text>

				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						id="leopard-back-to-chat-button"
						v-shortkey="['ctrl', 'alt', 'arrowleft']"
						color="secondary white--text"
						small
						@click.native="hideModal"
						@shortkey.native="hideModal"
					>{{ $t("back.to.chat.button") }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</span>
</template>

<script>
import { stripHtmlTags, removeAll } from "@/utils/utils";
import { mapGetters } from "vuex";

const logger = require("@/utils/logging").getLogger("Modal.vue");

export default {
	components: {
		Audio: () => import("@/components/Audio"),
		Carousel: () => import("@/components/Carousel"),
		CustomModal: () => import("@/components/CustomModal"),
		FlightItinerary: () => import("@/components/FlightItinerary"),
		ImageAnimation: () => import("@/components/ImageAnimation"),
		MyBankTransactions: () => import("@/components/MyBankTransactions"),
		Map: () => import("@/components/Map"),
		// Pusher,
		Table: () => import("@/components/Table"),
		Video: () => import("@/components/Video"),
		Vimeo: () => import("@/components/Vimeo"),
		YouTube: () => import("@/components/YouTube")
	},
	data() {
		return {
			actions: "",
			audioType: "",
			audioUrl: "",
			bodyText: "",
			customModalItems: [],
			displayPusherMessage: false,
			images: [],
			imageUrl: "",
			itinerary: "",
			fullscreen: false,
			overlay: false,
			overlayMessage: "",
			currentModalPosition: "center", // left / right / center / fullscreen
			currentModalSize: "medium", // small / medium / large / x-large / fullscreen "" = full screen
			pusherEnabled: false,
			pusherMessage: "",
			search: "",
			showCustomModal: false,
			showModal: false,
			subTitle: "",
			tableFooter: "",
			tableHeaders: [],
			tableRows: [],
			tableTitle: "",
			tableEnableSearch: false,
			tableRowsPerPage: [5, 10, 25],
			title: "",
			aria: "",
			transactionHeaders: [
				{
					align: "left",
					sortable: false,
					text: "Date",
					value: "date",
					width: "20%"
				},
				{
					align: "left",
					text: "Description",
					value: "description",
					width: "65%"
				},
				{
					align: "right",
					sortable: true,
					text: "Amount",
					value: "amount",
					width: "15%"
				}
			],
			transactionItems: [],
			videoType: "",
			videoUrl: "",
			address: "",
			vimeoVideoId: "",
			youTubeVideoId: ""
		};
	},
	computed: {
		...mapGetters([
			"dark",
			"embed",
			"textColor",
			"fullscreenEmbed",
			"showButtonOnly",
			"extensionIsInline",
			"hasInline",
			"hasModal",
			"hasInlineType",
			"iFrameUrlBase",
			"itemExtensions",
			"itemExtensionsModal",
			"isAudioFile",
			"isLiveChat",
			"isVideoFile",
			"liveChatTranscript",
			"modalItem",
			"modalSize",
			"modalPosition",
			"outputLink",
			"userInput",
			"vimeoIdFromUrl",
			"youTubeIdFromUrl",
			"itemHasLongResponse"
		]),
		showPusher() {
			// if (this.displayPusherMessage) {
			//   return true;
			// }
			// return false;
			return false;
		},
		toolbarWidth() {
			if (this.currentModalSize !== "") {
				logger.debug("Adjusted the custom modal toolbar style");
				return `teneo-modal-${this.currentModalSize}-width`;
			}
			return "";
		}
	},
	watch: {
		fullscreen(mustBeFullscreen) {
			if (mustBeFullscreen) {
				this.removeCustomStylesFromModal();
			} else {
				this.modalClass();
			}
		},
		showModal(newValue) {
			if (newValue) {
				this.$store.commit("HIDE_508_CONTENT");
				logger.info(`Modal Open - Hiding 508 content in the chat window`);
			} else {
				this.$store.commit("SHOW_508_CONTENT");
				logger.info(`Modal Closed - Hiding 508 content in the chat window`);
			}
		},
		modalItem() {
			if (
				(this.modalItem && this.$store.getters.showModal) ||
				this.itemHasLongResponse(this.modalItem)
			) {
				logger.debug("About to RESET MODAL");
				this.resetModal();
				const item = this.modalItem;
				const transcript = this.liveChatTranscript(item);
				let displayModal = false;

				// check if user wants to talk to a live agent
				logger.debug(`Live Chat? :${this.isLiveChat}`);
				if (transcript !== "undefined" && this.isLiveChat) {
					this.$store.commit(
						"LIVE_CHAT",
						`======= VIRTUAL ASSISTANT CONVERSATION HISTORY =======\n${transcript}====================================================\n`
					);
					this.$store.commit("HIDE_CHAT_MODAL"); // stops the transcript from being sent back constantly during a live chat
				}
				// send URL's to the I-FRAME
				const outputUrl = this.outputLink(item);
				if (outputUrl !== "" && !this.showButtonOnly) {
					if (String(outputUrl).startsWith("./")) {
						const currentIframeUrl = this.iFrameUrlBase + outputUrl.substring(2, outputUrl.length);
						this.$store.commit("UPDATE_FRAME_URL", currentIframeUrl);
					} else {
						this.$store.commit("UPDATE_FRAME_URL", outputUrl);
					}
				}

				if (this.hasModal(this.modalItem)) {
					const extensions = this.itemExtensionsModal(item);
					extensions.forEach(extension => {
						this.transactionItems = [];
						displayModal = true;

						if (extension.title) {
							this.title = extension.title;
						}
						if (extension.aria) {
							this.aria = extension.aria;
						}

						// check for modal sizes and positions
						if (this.modalSize(item) !== "undefined") {
							this.currentModalSize = this.modalSize(item);
						}

						if (this.modalPosition(item) !== "undefined") {
							this.currentModalPosition = this.modalPosition(item);
						}

						// check for flight itinerary
						if (extension.name === "displayItinerary") {
							this.subTitle = this.getFirstChunk(item.text);
							this.itinerary = extension.parameters;
						}

						// check for displayTranactionTable - myBank
						if (extension.name === "displayTable") {
							if ("overrideTitle" in extension.parameters && extension.parameters.overrideTitle) {
								// this.title = extension.parameters.title;
							} else {
								// if (!this.title) {
								//   this.title = this.getFirstChunk(item.text);
								// }
								this.tableTitle = extension.parameters.title;
							}
							this.tableEnableSearch = extension.parameters.enableSearch;
							this.tableRows = extension.parameters.rows;
							this.tableHeaders = extension.parameters.headers;
							this.tableRowsPerPage = extension.parameters.rowsPerPage;
						}

						// check for displayTranactionTable - myBank
						if (extension.name === "displayTransactionsTable") {
							// if (!this.title) {
							//   this.title = this.getFirstChunk(item.text);
							// }
							this.transactionItems = [];
							extension.parameters.transactions.transactions.forEach(transaction => {
								logger.debug(transaction);
								this.transactionItems.push({
									date: transaction.Date,
									description: transaction.Description,
									amount: transaction.Amount
								});
							});
						}

						// check for display image action
						if (extension.name === "displayImage") {
							this.imageUrl = extension.parameters.image_url;
						}

						// check for display image action
						if (extension.name === "displayImageCarousel") {
							this.images = extension.parameters.images;
						}

						// check for basic card action
						if (extension.name === "displayBasicCard") {
							this.title = extension.parameters.title;
							this.bodyText = extension.parameters.content;
						}

						// check for image card action
						if (extension.name === "displayImageCard") {
							this.title = extension.parameters.title;
							this.bodyText = extension.parameters.content;
							this.imageUrl = extension.parameters.image_url;
						}

						// check for panel card action
						if (extension.name === "displayPanelCard") {
							this.bodyText = extension.parameters.content;
						}

						// Check for a custom modal layout
						if (String(extension.name).startsWith("displayModal")) {
							displayModal = false;
							this.showCustomModal = true;
							this.customModalItems = extension.items;
							this.$store.commit("SHOW_CUSTOM_MODAL");
						}

						// check for horizontal card action
						if (extension.name === "displayHorizontalCard") {
							this.imageUrl = extension.parameters.image;
							this.title = extension.parameters.title;
							this.bodyText = extension.parameters.content;
						}

						if (extension.name === "displayMap") {
							this.address = extension.parameters.address;
						}

						// check for display video action
						if (extension.name === "displayVideo") {
							const url = extension.parameters.video_url;
							let videoId = this.youTubeIdFromUrl(url);
							if (!videoId) {
								videoId = this.vimeoIdFromUrl(url);
								logger.debug(`vimeoid: ${videoId}`);
								if (videoId) {
									this.vimeoVideoId = videoId;
								} else {
									const audioFileExt = this.isAudioFile(url);
									if (audioFileExt) {
										this.audioType = `audio/${audioFileExt}`;
										this.audioUrl = url;
									} else {
										const videoFileExt = this.isVideoFile(url);
										if (videoFileExt) {
											this.videoType = `video/${videoFileExt}`;
											this.videoUrl = url;
										}
									}
								}
							} else {
								this.youTubeVideoId = videoId;
							}
						}
						if (this.title) {
							this.subTitle = this.getFirstChunk(item.text);
						}
						if (!this.title) {
							this.title = this.getFirstChunk(item.text);
						}
					});
				}
				if (this.itemHasLongResponse(this.modalItem)) {
					this.title = decodeURIComponent(this.modalItem.teneoResponse.lastinput);
					this.bodyText = this.modalItem.text;
					// this.bodyText = this.modalItem.text.replace(
					//   /(?:\r\n|\r|\n)/g,
					//   "<br/><br/>"
					// );
					displayModal = true;
				}
				// look for anchors with callbacks
				if (this.bodyText) {
					this.bodyText = this.bodyText.replace(
						/(?:onclick='DI\.VA\.hope\.sendInput\(")([^"]+)(?:"\)')/g,
						'data-input="$1" class="sendInput"'
					);
				}
				this.showModal = displayModal;

				if (this.title.length > 90) {
					this.subTitle = this.title;
					this.title = "";
				}
				this.title = stripHtmlTags(this.title);
			} else {
				this.showModal = false;
			}
		}
	},
	mounted() {
		// if (this.pusherEnabled) {
		//   logger.debug("Setting up pusher");
		//   this.$pusher.subscribe("web-channel");
		//   logger.debug("Subscribed to 'web-channel'");
		//   let that = this;
		//   this.$pusher.bind(
		//     "some-event-and-possibly-some-unique-id-for-user",
		//     data => {
		//       logger.debug("Message from Teneo: " + data.message);
		//       that.pusherMessage = data.message;
		//       that.displayPusherMessage = true;
		//     },
		//     null
		//   );
		// }
	},
	updated() {
		this.$nextTick(() => {
			setTimeout(() => {
				const elements = document.getElementsByClassName("plyr__control--overlaid");
				if (elements.length > 0) {
					elements.forEach(element => {
						element.focus();
					});
				} else {
					const backButton = document.getElementById("leopard-back-to-chat-button");
					if (backButton) {
						backButton.focus();
					}
				}
				const iframes = document.getElementsByTagName("iframe");
				iframes.forEach(iframe => {
					if (iframe.hasAttribute("allow")) {
						const allowValue = iframe.getAttribute("allow");
						if (allowValue.indexOf("accelerometer") !== -1) {
							iframe.setAttribute("tabindex", "-1");
						}
					}
				});
			}, 1000);
		});

		this.modalClass();
		if (this.bodyText) {
			const chatModalDiv = document.getElementById("chat-modal-html");
			if (chatModalDiv) {
				chatModalDiv.addEventListener("click", this.onHtmlClickInModal);
			}
		}
	},
	methods: {
		// handleFocus() {
		//   this.$store.commit("HIDE_508_CONTENT");
		//   logger.info(`Modal Has Focus - Hiding 508 content in the chat window`);
		// },
		toggleFullscreen() {
			const modalElements = document.getElementsByClassName("teneo-modal");
			modalElements[0].setAttribute("style", "");
			this.fullscreen = !this.fullscreen;
		},
		getFirstChunk(text) {
			if (text && text.includes("||")) {
				return text.split("||")[0];
			}
			return text;
		},
		modalClass() {
			if (!this.fullscreen) {
				logger.debug("Applying custom modal size and position");
				logger.debug("Adding sizing and position styles to modal");
				const modalElements = document.getElementsByClassName("teneo-modal");
				if (modalElements !== "undefined" && this.currentModalSize !== "undefined") {
					for (let i = 0; i < modalElements.length; i += 1) {
						if (
							this.currentModalSize !== "fullscreen" &&
							this.currentModalPosition !== "fullscreen"
						) {
							modalElements[i].className = removeAll(modalElements[i].className, [
								"teneo-modal-left",
								"teneo-modal-center",
								"teneo-modal-right",
								"teneo-modal-fullscreen"
							]);
							modalElements[i].className += ` teneo-modal-${this.currentModalPosition}`;
						}
					}
				}
			} else {
				this.removeCustomStylesFromModal();
			}
		},
		removeCustomStylesFromModal() {
			logger.debug("removing custom styles from modal");
			const modalElements = document.getElementsByClassName("teneo-modal");
			if (modalElements !== "undefined") {
				for (let i = 0; i < modalElements.length; i += 1) {
					logger.debug("Removing existing modal size and position styles - reset");
					modalElements[i].classList.remove("teneo-modal-center");
					modalElements[i].classList.remove("teneo-modal-right");
					modalElements[i].classList.remove("teneo-modal-left");
					modalElements[i].classList.remove("teneo-modal-small-width");
					modalElements[i].classList.remove("teneo-modal-medium-width");
					modalElements[i].classList.remove("teneo-modal-large-width");
					modalElements[i].classList.remove("teneo-modal-x-large-width");
				}
			}
		},
		onHtmlClickInModal(event) {
			logger.debug("html link clicked in modal");
			// Find the closest anchor to the target.
			const anchor = event.target.closest("a");
			if (!anchor) return;

			// Check to make sure this is from our v-html because
			// we don't want to handle clicks from other things in
			// the Vue
			if (!anchor.classList.contains("sendInput") && !anchor.classList.contains("openInIframe")) {
				// basically treat like a normal link
			} else if (anchor.classList.contains("openInIframe")) {
				// open in iframe
				event.stopPropagation();
				event.preventDefault();
				this.$store.commit("UPDATE_FRAME_URL", anchor.getAttribute("href"));
			} else {
				event.stopPropagation();
				event.preventDefault();
				if (anchor.getAttribute("data-input")) {
					this.updateInputBox(anchor.getAttribute("data-input"));
				} else {
					this.updateInputBox(anchor.innerText);
				}
				this.sendUserInput("&isClick=true");
			}
		},
		sendUserInput(params = "") {
			if (this.userInput) {
				this.$store.commit("SHOW_PROGRESS_BAR");
				this.$store.dispatch("sendUserInput", params);
			}
		},
		updateInputBox(userInput) {
			this.$store.commit("SET_USER_INPUT", userInput);
		},
		hideModal() {
			this.$store.commit("HIDE_CHAT_MODAL");
			this.$store.commit("SHOW_508_CONTENT");
			const that = this;
			logger.debug("About to RESET MODAL to defaults");
			setTimeout(() => {
				that.resetModal();
			}, 1000); // needed to stop weird animations on the close
		},
		resetModal() {
			this.actions = "";
			this.audioType = "";
			this.audioUrl = "";
			this.bodyText = "";
			this.customModalItems = [];
			this.imageUrl = "";
			this.images = [];
			this.itinerary = "";
			this.fullscreen = false;
			this.overlay = false;
			this.overlayMessage = "";
			this.currentModalPosition = "center";
			this.currentModalSize = "small";
			this.removeCustomStylesFromModal();
			this.search = "";
			this.showCustomModal = false;
			this.showModal = false;
			this.subTitle = "";
			this.tableFooter = "";
			this.tableHeaders = [];
			this.tableRows = [];
			this.tableTitle = "";
			this.tableEnableSearch = false;
			this.tableRowsPerPage = [5, 10, 25];
			this.title = "";
			this.aria = "";
			this.transactionItems = [];
			this.videoType = "";
			this.videoUrl = "";
			this.address = "";
			this.vimeoVideoId = "";
			this.youTubeVideoId = "";
		}
	}
};
</script>

<style>
.v-toolbar--fixed {
	left: unset !important;
	z-index: 5000;
}

.modal-container {
	padding: 0px;
	/* margin-top: 20px; */
}

.modal-height {
	min-height: calc(100vh - 64px) !important;
	height: fit-content;
}

.v-menu__content {
	position: inherit !important;
}

.cardText {
	padding-top: 5px;
	text-align: left;
}

.modal-headline {
	font-size: 0.7em;
}

#chat-modal-html {
	padding-left: 0px !important;
	padding-right: 0px !important;
}

.cardText table {
	width: 100%;
	border-spacing: 0;
	border: 1px solid;
}

.cardText table td,
.cardText table th {
	padding: 3px 10px;
	font-size: 1em;
}

.cardText table thead th {
	font-size: 1em;
	border-left: 1px solid black;
	color: white;
	background-color: rgb(152, 52, 53);
}

.cardText table td.summaryHeader {
	background-color: rgb(22, 54, 102, 0.8);
	color: white;
}

.cardText table tbody td {
	border-left: 1px solid black;
	font-size: 12px;
	font-weight: 700;
}

.cardText table tbody td:first-child {
	border-left: none;
}

.cardText table tbody tr:last-child td {
	border-bottom: none;
}

.teneo-modal {
	overflow-y: auto;
	overflow-x: hidden;
}

.teneo-modal-embed {
	overflow-y: auto;
	overflow-x: hidden;
	border-radius: 4px !important;
}

.teneo-modal-fullscreen {
	overflow-y: auto;
	overflow-x: hidden;
	border-radius: 0px !important;
}

.teneo-modal-card {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
}

.teneo-modal-right {
	left: unset;
	right: 20px;
}

.teneo-modal-left {
	right: unset;
	left: 20px;
}

@media only screen and (max-width: 480px) {
	.modal-fly-out {
		width: 100% !important;
	}

	.teneo-modal-right {
		right: 0;
	}

	.teneo-modal-left {
		left: 0;
	}
}
</style>
