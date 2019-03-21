<template>
  <span>
    <CustomModal
      :items="customModalItems"
      :toolbarWidth="toolbarWidth"
    ></CustomModal>
    <!-- Display Pusher Message -->
    <Pusher
      :displayPusherMessage="displayPusherMessage"
      :pusherMessage="pusherMessage"
    ></Pusher>

    <!-- show normal message -->
    <v-layout>
      <v-flex xs12>

        <v-dialog
          v-model="showModal"
          leave-absolute
          scrollable
          persistent
          content-class="teneo-modal"
          hide-overlay
          fullscreen
        >
          <v-toolbar
            dark
            color="primary"
            fixed
            height="48"
            :class="toolbarWidth"
          >
            <v-btn
              fab
              small
              @click="hideModal"
              color="secondary"
            >
              <v-icon
                dark
                medium
              >close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ $t('more.info.title') }}</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-card
            class="mb-1 pt-5 modal-height teneo-modal-card"
            :class="{'dark-scroll': dark, 'light-scroll': !dark}"
            tile
          >

            <!-- YouTube -->
            <YouTube :videoId="youTubeVideoId"></YouTube>

            <!-- Vimeo -->
            <Vimeo :videoId="vimeoVideoId"></Vimeo>

            <!-- Audio -->
            <Audio :url="audioUrl"></Audio>

            <!-- Misc Video -->
            <Video
              :url="videoUrl"
              :type="videoType"
            ></Video>

            <v-container class="modal-container">

              <!-- show an image if available -->
              <ImageAnimation :url="imageUrl"></ImageAnimation>

              <!-- show a carousel of images if available -->
              <Carousel :imageItems="images"></Carousel>

              <!-- display the modal title and sub-title -->
              <v-layout
                align-start
                justify-start
                column
              >
                <v-card-title primary-title>
                  <!-- Main Title -->
                  <div
                    class="modal-headline"
                    v-if="title"
                    v-html="title"
                  ></div>
                  <!-- Sub-Title -->
                  <span
                    class="grey--text"
                    v-if="subTitle"
                    v-html="subTitle"
                  ></span>
                </v-card-title>
              </v-layout>

              <v-layout
                align-start
                justify-center
                row
              >
                <!-- show the close modal button -->
                <v-card-actions>
                  <!-- Yes there are keyboard shortcuts to close the modal window -->
                  <v-btn
                    color="primary"
                    v-shortkey="['ctrl', 'alt', 'arrowleft']"
                    @shortkey.native="hideModal"
                    @click.native="hideModal"
                  >{{ $t('back.to.chat.button') }}
                  </v-btn>
                </v-card-actions>
              </v-layout>

              <!-- Show the body text, flight itineary, and any tables if available -->
              <div
                class=" mt-3"
                v-if="itinerary || bodyText || transactionItems.length || tableRows.length"
              >
                <!-- Show the flight itinerary -->
                <FlightItinerary :itinerary="itinerary"></FlightItinerary>

                <!-- show the body text -->
                <v-card-text
                  class="cardText"
                  id="chat-modal-html"
                  v-if="bodyText"
                  v-html="bodyText"
                  scrollable
                ></v-card-text>

                <!-- data tables -->
                <v-layout
                  v-if="transactionItems.length > 0 || tableRows.length > 0"
                  align-end
                  justify-start
                  fill-height
                >
                  <!-- table title -->
                  <v-layout v-if="tableTitle">
                    <v-flex
                      xs8
                      ml-4
                      class=""
                    >
                      <h3>{{tableTitle}}</h3>
                    </v-flex>
                  </v-layout>
                  <v-spacer v-else></v-spacer>
                  <!-- show a search input box for the table -->
                  <v-flex
                    xs4
                    class="mr-2"
                  >
                    <v-text-field
                      v-model="search"
                      append-icon="search"
                      label="Search"
                      single-line
                      hide-details
                    ></v-text-field>
                  </v-flex>
                </v-layout>

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
                ></Table>

              </div>
              <v-spacer></v-spacer>
            </v-container>

          </v-card>

        </v-dialog>

      </v-flex>
    </v-layout>
  </span>
</template>

<script>
import Audio from "./Audio";
import Carousel from "./Carousel";
import CustomModal from "./CustomModal";
import FlightItinerary from "./FlightItinerary";
import ImageAnimation from "./ImageAnimation";
import MyBankTransactions from "./MyBankTransactions";
import Pusher from "./Pusher";
import Table from "./Table";
import Video from "./Video";
import Vimeo from "./Vimeo";
import YouTube from "./YouTube";
import { mapGetters } from "vuex";

export default {
  components: {
    Audio,
    Carousel,
    CustomModal,
    FlightItinerary,
    ImageAnimation,
    MyBankTransactions,
    Pusher,
    Table,
    Video,
    Vimeo,
    YouTube
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
      modalPosition: "center", // left / right / center
      modalSize: "small", // small / medium / large / x-large / "" = full screen
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
      title: "",
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
          width: "70%"
        },
        {
          align: "left",
          sortable: true,
          text: "Amount",
          value: "amount",
          width: "10%"
        }
      ],
      transactionItems: [],
      videoType: "",
      videoUrl: "",
      vimeoVideoId: "",
      youTubeVideoId: ""
    };
  },
  mounted() {
    if (this.pusherEnabled) {
      console.log("Setting up pusher");
      this.$pusher.subscribe("web-channel");
      console.log("Subscribed to 'web-channel'");
      let that = this;
      this.$pusher.bind(
        "some-event-and-possibly-some-unique-id-for-user",
        data => {
          console.log("Message from Teneo: " + data.message);
          that.pusherMessage = data.message;
          that.displayPusherMessage = true;
        },
        null
      );
    }
  },
  watch: {
    getModalItem() {
      console.log(this.$store.getters.getModalItem);
      console.log(this.$store.getters.getShowModal);
      if (
        this.$store.getters.getModalItem &&
        this.$store.getters.getShowModal
      ) {
        this.resetModal();
        let response = this.$store.getters.getModalItem;
        let teneoResponse = response.teneoResponse;
        let outputLink = decodeURIComponent(teneoResponse.link.href);
        let actionRAW = decodeURIComponent(teneoResponse.extraData.extensions);
        let modalPosition = decodeURIComponent(
          teneoResponse.extraData.modalPosition
        );
        let modalSize = decodeURIComponent(teneoResponse.extraData.modalSize);
        let transcript = decodeURIComponent(teneoResponse.extraData.liveChat);
        let displayModal = false;

        // check if user wants to talk to a live agent
        // console.log("Live Chat? :" + this.$store.getters.isLiveChat);
        if (transcript !== "undefined" && this.$store.getters.isLiveChat) {
          this.$store.commit(
            "liveChat",
            "======= VIRTUAL ASSISTANT CONVERSATION HISTORY =======\n" +
              transcript +
              "====================================================\n"
          );
          this.$store.commit("hideModal"); // stops the transcript from being sent back constantly during a live chat
        }
        // send URL's to the I-FRAME
        if (outputLink !== "") {
          if (outputLink.startsWith("./")) {
            let currentIframeUrl =
              this.$store.getters.iFrameUrlBase +
              outputLink.substring(2, outputLink.length);
            console.log(currentIframeUrl);
            document.getElementById("site-frame").src = currentIframeUrl;
          } else {
            document.getElementById("site-frame").src = outputLink;
          }
        }

        if (actionRAW !== "undefined") {
          this.transactionItems = [];

          let action = JSON.parse(actionRAW);
          displayModal = true;

          // check for modal sizes and positions
          if (modalSize !== "undefined") {
            this.modalSize = modalSize.toLowerCase();
          }

          if (modalPosition !== "undefined") {
            this.modalPosition = modalPosition.toLowerCase();
          }

          // check for flight itinerary
          if (action.name === "displayItinerary") {
            this.title = this.getFirstChunk(response.text);
            this.itinerary = action.parameters;
          }

          // check for displayTranactionTable - myBank
          if (action.name === "displayTable") {
            this.title = this.getFirstChunk(response.text);
            this.tableTitle = action.parameters.title;
            this.tableRows = action.parameters.rows;
            this.tableHeaders = action.parameters.headers;
          }

          // check for displayTranactionTable - myBank
          if (action.name === "displayTransactionsTable") {
            // this.modalSize = "medium";
            // this.modalPosition = "center";
            this.title = this.getFirstChunk(response.text);
            this.transactionItems = [];
            action.parameters.transactions.transactions.forEach(transaction => {
              // console.log(transaction);
              this.transactionItems.push({
                date: transaction.Date,
                description: transaction.Description,
                amount: transaction.Amount
              });
            });
          }

          // check for display image action
          if (action.name === "displayImage") {
            this.title = this.getFirstChunk(response.text);
            this.imageUrl = action.parameters.image_url;
          }

          // check for display image action
          if (action.name === "displayImageCarousel") {
            this.title = this.getFirstChunk(response.text);
            this.images = action.parameters.images;
          }

          // check for basic card action
          if (action.name === "displayBasicCard") {
            this.title = action.parameters.title;
            this.bodyText = action.parameters.content;
          }

          // check for image card action
          if (action.name === "displayImageCard") {
            this.title = action.parameters.title;
            this.bodyText = action.parameters.content;
            this.imageUrl = action.parameters.image_url;
          }

          // check for panel card action
          if (action.name === "displayPanelCard") {
            this.title = this.getFirstChunk(response.text);
            this.bodyText = action.parameters.content;
          }

          // Check for a custom modal layout
          if (action.name.startsWith("displayModal")) {
            displayModal = false;
            this.showCustomModal = true;
            this.customModalItems = action.items;
          }

          // check for collection action
          if (action.name.startsWith("displayCollection")) {
            displayModal = false;
            // this.title = action.parameters.title;
            // items: action.parameters.item
          }

          // check for horizontal card action
          if (action.name === "displayHorizontalCard") {
            this.imageUrl = action.parameters.image;
            this.title = action.parameters.title;
            this.bodyText = action.parameters.content;
            // this.actions: action.parameters.actions;
          }

          // check for display video action
          if (action.name === "displayVideo") {
            let url = action.parameters.video_url;
            let videoId = this.getYoutubeId(url);
            if (!videoId) {
              videoId = this.getVimeoId(url);
              // console.log("vimeoid: " + videoId);
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

            this.title = this.getFirstChunk(response.text);
          }
        }
        if (this.bodyText) {
          this.bodyText = this.bodyText.replace(
            /(?:onclick='DI\.VA\.hope\.sendInput\(")([^"]+)(?:"\)')/g,
            'data-callback="$1" class="sendInput"'
          );
        }
        console.log("A: Display Modal: " + displayModal);
        this.showModal = displayModal;
      } else {
        console.log("B: Display Modal: false");
        this.showModal = false;
      }
    }
  },
  computed: {
    ...mapGetters(["getModalItem"]),
    showPusher() {
      if (this.displayPusherMessage) {
        return true;
      }
      return false;
    },
    toolbarWidth() {
      // console.log("Seeing if we need to adjust toolbar style");
      if (this.modalSize !== "") {
        // console.log("Yep adjusted toolbar style");
        return `teneo-modal-${this.modalSize}-width`;
      }
      return "";
    },
    dark() {
      return this.$store.getters.dark;
    }
  },
  updated() {
    this.modalClass();
    if (this.bodyText) {
      let chatModalDiv = document.getElementById("chat-modal-html");
      if (chatModalDiv) {
        chatModalDiv.addEventListener("click", this.onHtmlClickInModal);
      }
    }
  },
  methods: {
    getFirstChunk(text) {
      if (text.includes("||")) {
        return text.split("||")[0];
      }
      return text;
    },
    modalClass() {
      console.log("Applying custom modal size and position");
      // console.log("Adding sizing and position styles to modal");
      var modalElements = document.getElementsByClassName("teneo-modal");
      if (modalElements !== "undefined" && this.modalSize !== "undefined") {
        for (var i = 0; i < modalElements.length; i++) {
          modalElements[i].className += ` teneo-modal-${
            this.modalPosition
          } teneo-modal-${this.modalSize}-width`;
        }
      }
    },
    removeCustomStylesFromModal() {
      // console.log("removing custom styles from modal");
      var modalElements = document.getElementsByClassName("teneo-modal");
      if (modalElements !== "undefined") {
        for (var i = 0; i < modalElements.length; i++) {
          // console.log("Removing existing modal styles - reset");
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
      // console.log("html link clicked in modal");
      // Find the closest anchor to the target.
      const anchor = event.target.closest("a");
      if (!anchor) return;

      // Check to make sure this is from our v-html because
      // we don't want to handle clicks from other things in
      // the Vue
      if (!anchor.classList.contains("sendInput")) return;
      // console.log(anchor.dataset.callback);
      event.stopPropagation();
      event.preventDefault();
      this.updateInputBox(anchor.dataset.callback);
      this.sendUserInput();
    },
    sendUserInput() {
      if (this.$store.getters.getUserInput) {
        this.$store.commit("showProgressBar");
        this.$store.dispatch("sendUserInput");
      }
    },
    updateInputBox(userInput) {
      this.$store.commit("setUserInput", userInput);
    },
    isVideoFile(url) {
      // console.log("IsVideo:" + url);
      const regExp = /\.(?:mp4|webm|ogg)$/i;
      const match = url.match(regExp);
      let result = match ? match[0].substring(1, match[0].length) : false;
      // console.log(result);
      return result;
    },
    isAudioFile(url) {
      // console.log("ISAudio:" + url);
      const regExp = /\.(?:wav|mp3|ogg)$/i;
      const match = url.match(regExp);
      let result = match ? match[0].substring(1, match[0].length) : false;
      // console.log(result);
      return result;
    },
    getYoutubeId(url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#]*).*/;
      const match = url.match(regExp);
      if (match) {
        return match && match[7].length == 11 ? match[7] : false;
      } else {
        return false;
      }
    },
    getVimeoId(url) {
      const regExp = /^.+vimeo.com\/(.*\/)?([^#]*)/;
      const match = url.match(regExp);
      return match ? match[2] || match[1] : false;
    },
    hideModal() {
      this.$store.commit("hideModal");
      let that = this;
      setTimeout(function() {
        that.resetModal();
      }, 1000); // needed to stop weird animations on the close
    },
    resetModal() {
      console.log("reseting modal values");
      this.actions = "";
      this.audioType = "";
      this.audioUrl = "";
      this.bodyText = "";
      this.customModalItems = [];
      this.imageUrl = "";
      this.images = [];
      this.itinerary = "";
      this.modalPosition = "center";
      this.modalSize = "small";
      this.removeCustomStylesFromModal();
      this.search = "";
      this.showCustomModal = false;
      this.showModal = false;
      this.subTitle = "";
      this.tableFooter = "";
      this.tableHeaders = [];
      this.tableRows = [];
      this.tableTitle = "";
      this.title = "";
      this.transactionItems = [];
      this.videoType = "";
      this.videoUrl = "";
      this.vimeoVideoId = "";
      this.youTubeVideoId = "";
    }
  }
};
</script>

<style>
.v-toolbar--fixed {
  left: unset !important;
}

.modal-container {
  padding: 0px;
}

.modal-height {
  min-height: calc(100vh - 48px) !important;
  height: fit-content;
}

.v-menu__content {
  position: inherit !important;
}
.cardText {
  padding-top: 5px;
  padding-left: 30px;
  text-align: left;
}

.modal-headline {
  font-size: 1.2em;
}

.cardText table {
  border-collapse: collapse;
  text-align: left;
  width: 100%;
  border: 3px solid #0070a8;
}
.cardText table td,
.cardText table th {
  padding: 3px 10px;
}
.cardText table thead th {
  background-color: #006699;
  color: #ffffff;
  font-size: 11px;
  font-weight: bold;
  border-left: 1px solid #ffffff;
}
.cardText table td.summaryHeader {
  border-top: 1px solid #0070a8;
  border-bottom: 1px solid #0070a8;
  background-color: rgb(165, 165, 165);
}
.cardText table tbody td {
  border-left: 1px solid #0070a8;
  font-size: 12px;
  font-weight: normal;
}
.cardText table tbody td:first-child {
  border-left: none;
}
.cardText table tbody tr:last-child td {
  border-bottom: none;
}

.teneo-modal {
  position: absolute !important;
  right: 0 !important;
  margin: 0 !important;
  padding-top: 48px !important;
  overflow-y: hidden;
}

.teneo-modal-card {
  overflow-y: auto;
  height: auto;
}

.teneo-modal-center {
  margin-right: auto !important;
  margin-left: auto !important;
  right: unset !important;
  position: unset !important;
}

.teneo-modal-right {
  left: unset !important;
  right: 0px !important;
}

.teneo-modal-left {
  right: unset !important;
  left: 0px !important;
}

.teneo-modal-small-width {
  max-width: 360px !important;
}

.teneo-modal-medium-width {
  max-width: 500px !important;
}

.teneo-modal-large-width {
  max-width: 700px !important;
}

.teneo-modal-x-large-width {
  max-width: 900px !important;
}

@media only screen and (max-width: 480px) {
  .modal-fly-out {
    width: 100vw !important;
  }
}
</style>