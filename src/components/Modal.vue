<template>
  <!-- Display Pusher Message -->
  <span>
    <v-layout
      v-model="displayPusherMessage"
      row
      justify-center
    >

      <v-dialog
        v-model="showPusher"
        max-width="290"
      >
        <v-card>
          <v-card-title class="headline">Notification</v-card-title>

          <v-card-text>
            {{ pusherMessage }}<br />
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              color="green darken-1"
              flat="flat"
              @click="displayPusherMessage = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

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
            height="64px"
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
            class="mb-1 pt-5 modal-height"
            tile
          >

            <!-- video and audio -->
            <!-- YouTube -->
            <vue-plyr v-if="youTubeVideoId">
              <div class="plyr__video-embed">
                <iframe
                  :src="`https://www.youtube.com/embed/${youTubeVideoId}?iv_load_policy=1&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`"
                  allowfullscreen
                  allowtransparency
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                >
                </iframe>
              </div>
            </vue-plyr>
            <!-- Vimeo -->
            <vue-plyr v-if="vimeoVideoId">
              <div class="plyr__video-embed">
                <iframe
                  :src="`https://player.vimeo.com/video/${vimeoVideoId}?loop=false&amp;byline=false&amp;portrait=false&amp;title=false&amp;speed=true&amp;transparent=0&amp;gesture=media`"
                  allowfullscreen
                  allowtransparency
                  allow="autoplay"
                >
                </iframe>
              </div>
            </vue-plyr>
            <!-- Audio -->
            <vue-plyr v-if="audioUrl">
              <audio>
                <source
                  :src="audioUrl"
                  :type="audioType"
                />
              </audio>
            </vue-plyr>

            <!-- Misc Video -->
            <vue-plyr v-if="videoUrl">
              <video
                poster="poster.png"
                src="video.mp4"
              >
                <source
                  :src="videoUrl"
                  :type="videoType"
                />
              </video>
            </vue-plyr>

            <v-container class="modal-container">
              <transition
                name="modal-image-transition"
                enter-active-class="animated zoomIn"
              >
                <v-img :src="imageUrl"></v-img>
                <!-- <v-card-media v-if="imageUrl" :src="imageUrl" height="226px"></v-card-media> -->
              </transition>

              <v-layout
                align-start
                justify-start
                column
              >
                <v-card-title primary-title>
                  <div
                    class="modal-headline"
                    v-if="title"
                    v-html="title"
                  ></div>
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
                <v-card-actions>
                  <v-btn
                    color="primary"
                    v-shortkey="['ctrl', 'alt', 'arrowleft']"
                    @shortkey.native="hideModal"
                    @click.native="hideModal"
                  >{{ $t('back.to.chat.button') }}
                  </v-btn>
                </v-card-actions>
              </v-layout>
              <div
                class=" mt-3"
                v-if="itinerary || bodyText || transactionItems.length || tableRows.length"
              >
                <flight-itinerary
                  v-if="itinerary"
                  :itinerary="itinerary"
                ></flight-itinerary>
                <v-card-text
                  class="cardText"
                  id="chat-modal-html"
                  v-if="bodyText"
                  v-html="bodyText"
                  scrollable
                ></v-card-text>
                <!-- data table tranactions -->
                <v-layout
                  v-if="transactionItems.length > 0 || tableRows.length > 0"
                  align-end
                  justify-start
                  fill-height
                >
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

                <v-data-table
                  v-if="transactionItems.length > 0"
                  :headers="transactionHeaders"
                  :items="transactionItems"
                  :search="search"
                >
                  <template
                    slot="items"
                    slot-scope="props"
                  >
                    <td class="text-xs-left">{{ props.item.date }}</td>
                    <td class="text-xs-left">{{ props.item.description }}</td>
                    <td class="text-xs-left">{{ props.item.amount }}</td>
                  </template>
                  <v-alert
                    slot="no-results"
                    :value="true"
                    color="error"
                    icon="warning"
                  >
                    Your search for "{{ search }}" found no results.
                  </v-alert>
                </v-data-table>

                <v-data-table
                  v-if="tableRows.length > 0"
                  :headers="tableHeaders"
                  :items="tableRows"
                  :search="search"
                >
                  <template
                    slot="items"
                    slot-scope="props"
                  >
                    <td
                      v-for="(header, key) in tableHeaders"
                      :key='key'
                      class="text-xs-left"
                    >
                      {{ props.item[header.value] }}
                    </td>
                  </template>
                  <v-alert
                    slot="no-results"
                    :value="true"
                    color="error"
                    icon="warning"
                  >
                    Your search for "{{ search }}" found no results.
                  </v-alert>
                  <template
                    v-if="tableFooter"
                    slot="footer"
                  >
                    <td colspan="100%">
                      <strong>{{ tableFooter }}</strong>
                    </td>
                  </template>
                </v-data-table>
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
import FlightItinerary from "./FlightItinerary";
import { mapGetters } from "vuex";

export default {
  components: {
    "flight-itinerary": FlightItinerary
  },
  data() {
    return {
      displayPusherMessage: false,
      pusherMessage: "",
      showModal: false,
      title: "",
      subTitle: "",
      imageUrl: "",
      actions: "",
      bodyText: "",
      youTubeVideoId: "",
      vimeoVideoId: "",
      itinerary: "",
      audioType: "",
      audioUrl: "",
      videoType: "",
      videoUrl: "",
      tableTitle: "",
      tableHeaders: [],
      tableRows: [],
      tableFooter: "",
      search: "",
      modalSize: "small", // small / medium / large / x-large / "" = full screen
      modalPosition: "right", // left / right / center
      transactionHeaders: [
        {
          text: "Date",
          sortable: false,
          value: "date",
          width: "20%",
          align: "left"
        },
        {
          text: "Description",
          value: "description",
          width: "70%",
          align: "left"
        },
        {
          text: "Amount",
          value: "amount",
          sortable: true,
          width: "10%",
          align: "left"
        }
      ],
      transactionItems: []
    };
  },
  mounted() {
    // console.log("Setting up pusher");
    // // var channel = this.$pusher.subscribe("web-channel");
    // this.$pusher.subscribe("web-channel");
    // console.log("Subscribed to 'web-channel'");
    // let that = this;
    // this.$pusher.bind(
    //   "reboot-complete-event-12345",
    //   data => {
    //     console.log("Message from Teneo: " + data.message);
    //     that.pusherMessage = data.message;
    //     that.displayPusherMessage = true;
    //   },
    //   null
    // );
  },
  watch: {
    getModalItem() {
      console.log(this.$store.getters.getModalItem);
      console.log(this.$store.getters.getShowModal);
      if (
        this.$store.getters.getModalItem &&
        this.$store.getters.getShowModal
      ) {
        // if (this.$store.getters.getShowModal) {
        //   this.resetModal();
        // }
        let response = this.$store.getters.getModalItem;
        let teneoResponse = response.teneoResponse;
        // console.log(teneoResponse);
        let outputLink = decodeURIComponent(teneoResponse.link.href);
        let actionRAW = decodeURIComponent(teneoResponse.extraData.extensions);
        let modalPosition = decodeURIComponent(
          teneoResponse.extraData.modalPosition
        );
        let modalSize = decodeURIComponent(teneoResponse.extraData.modalSize);
        console.log(
          "Modal Size:" + modalSize + " Modal Position: " + modalPosition
        );
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
            let currentIframeUrl = document.getElementById("site-frame").src;
            currentIframeUrl =
              currentIframeUrl.substring(0, currentIframeUrl.lastIndexOf("/")) +
              "/" +
              outputLink.substring(2, outputLink.length);
            // console.log(currentIframeUrl);
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
        // .then(console.log("Sent user input"))
        // .catch(err => {
        //   // TODO: add some logic
        // });
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

      // this.$refs.userInput.focus();
      // TODO: Find a way to make the user input box have focus
    },
    resetModal() {
      console.log("reseting modal values");
      this.title = "";
      this.subTitle = "";
      this.imageUrl = "";
      this.actions = "";
      this.bodyText = "";
      this.itinerary = "";
      this.youTubeVideoId = "";
      this.vimeoVideoId = "";
      this.audioType = "";
      this.audioUrl = "";
      this.videoType = "";
      this.videoUrl = "";
      this.modalSize = "small";
      this.showModal = false;
      this.modalPosition = "right";
      this.removeCustomStylesFromModal();
      this.search = "";
      this.tableTitle = "";
      this.tableHeaders = [];
      this.tableRows = [];
      this.tableFooter = "";
      this.transactionItems = [];
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
  min-height: calc(100vh - 64px) !important;
  height: fit-content;
}
</style>
<style>
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
  padding-top: 64px !important;
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