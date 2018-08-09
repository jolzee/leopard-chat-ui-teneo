<template>
  <v-layout>
    <v-flex xs12>
      <v-dialog v-model="showModal" scrollable persistent content-class="modal-fly-out" hide-overlay>
        <v-card class="pt-5 modal-height">
          <v-toolbar dark color="primary" fixed>
            <v-btn fab small @click="hideModal" color="secondary">
              <v-icon dark medium>close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ $t('more.info.title') }}</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <!-- video and audio -->
          <plyr-youtube v-if="youTubeVideoId" :id="youTubeVideoId" allowtransparency allow="autoplay" />
          <plyr-vimeo v-if="vimeoVideoId" :id="vimeoVideoId" allowtransparency allow="autoplay" />
          <plyr v-if="audioUrl">
            <audio>
              <source :src="audioUrl" :type="audioType" />
            </audio>
          </plyr>
          <plyr v-if="videoUrl">
            <video>
              <source :src="videoUrl" :type="videoType" />
            </video>
          </plyr>
          <v-container class="modal-container">
            <transition name="modal-image-transition" enter-active-class="animated zoomIn">
              <v-card-media v-if="imageUrl" :src="imageUrl" height="226px" contain></v-card-media>
            </transition>

            <v-layout align-start justify-start column>
              <v-card-title primary-title>
                <div class="modal-headline" v-if="title">{{title}}</div>
                <span class="grey--text" v-if="subTitle">{{subTitle}}</span>
              </v-card-title>
            </v-layout>
            <v-layout align-start justify-center row>
              <v-card-actions>
                <v-btn color="primary" v-shortkey="['ctrl', 'alt', 'arrowleft']" @shortkey.native="hideModal" @click.native="hideModal">{{ $t('back.to.chat.button') }}
                </v-btn>
              </v-card-actions>
            </v-layout>
            <div class="pt-3">
              <flight-itinerary v-if="itinerary" :itinerary="itinerary"></flight-itinerary>
              <v-card-text class="cardText" id="chat-modal-html" v-if="bodyText" v-html="bodyText" scrollable></v-card-text>
            </div>
            <v-spacer></v-spacer>
          </v-container>

        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>
<style scoped>
.v-toolbar--fixed {
  left: unset !important;
}

.modal-container {
  padding: 0px;
}

.modal-height {
  min-height: 100vh;
  height: fit-content;
}
</style>
<style>
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

.modal-fly-out {
  position: absolute !important;
  width: 360px !important;
  right: 0 !important;
  margin: 0 !important;
  max-height: 100% !important;
  /* height: 100% !important; */
}
.plyr__menu {
  display: none !important;
}

@media only screen and (max-width: 480px) {
  .modal-fly-out {
    width: 100vw !important;
  }
}
</style>
<script>
import { PlyrVideo, PlyrYoutube, PlyrAudio, PlyrVimeo, Plyr } from "vue-plyr";
import "vue-plyr/dist/vue-plyr.css";
import FlightItinerary from "./FlightItinerary";

export default {
  components: {
    PlyrVideo,
    PlyrYoutube,
    PlyrAudio,
    PlyrVimeo,
    Plyr,
    "flight-itinerary": FlightItinerary,
    props: ["itinerary"]
  },
  data() {
    return {
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
      videoUrl: ""
    };
  },
  computed: {
    showModal() {
      this.resetModal();
      let response = this.$store.getters.getModalItem;
      if (response) {
        let teneoResponse = response.teneoResponse;
        // console.log(teneoResponse);
        let outputLink = decodeURIComponent(teneoResponse.link.href);
        let actionRAW = decodeURIComponent(teneoResponse.extraData.extensions);
        let transcript = decodeURIComponent(
          response.teneoResponse.extraData.liveChat
        );
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
            console.log(currentIframeUrl);
            document.getElementById("site-frame").src = currentIframeUrl;
          } else {
            document.getElementById("site-frame").src = outputLink;
          }
        }

        if (actionRAW !== "undefined") {
          let action = JSON.parse(actionRAW);
          displayModal = true;

          // check for flight itinerary
          if (action.name === "displayItinerary") {
            this.title = response.text;
            this.itinerary = action.parameters;
          }

          // check for display video action
          if (action.name === "displayImage") {
            this.title = response.text;
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
            this.title = response.text;
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
              console.log("vimeoid: " + videoId);
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

            this.title = response.text;
          }
        }
        if (this.bodyText) {
          this.bodyText = this.bodyText.replace(
            /(?:onclick='DI\.VA\.hope\.sendInput\(")([^"]+)(?:"\)')/g,
            'data-callback="$1" class="sendInput"'
          );
        }
        return displayModal ? this.$store.getters.getShowModal : false;
      }
      return false;
    }
  },
  updated() {
    if (this.bodyText) {
      let chatModalDiv = document.getElementById("chat-modal-html");
      if (chatModalDiv) {
        chatModalDiv.addEventListener("click", this.onHtmlClickInModal);
      }
    }
  },
  methods: {
    onHtmlClickInModal(event) {
      console.log("html link clicked in modal");
      // Find the closest anchor to the target.
      const anchor = event.target.closest("a");
      if (!anchor) return;

      // Check to make sure this is from our v-html because
      // we don't want to handle clicks from other things in
      // the Vue
      if (!anchor.classList.contains("sendInput")) return;
      console.log(anchor.dataset.callback);
      event.stopPropagation();
      event.preventDefault();
      this.updateInputBox(anchor.dataset.callback);
      this.sendUserInput();
    },
    sendUserInput() {
      if (this.$store.getters.getUserInput) {
        this.$store.commit("showProgressBar");
        this.$store
          .dispatch("sendUserInput")
          .then(console.log("Sent user input"))
          .catch(err => {
            // TODO: add some logic
          });
      }
    },
    updateInputBox(userInput) {
      this.$store.commit("setUserInput", userInput);
    },
    isVideoFile(url) {
      console.log("IsVideo:" + url);
      const regExp = /\.(?:mp4|webm|ogg)$/i;
      const match = url.match(regExp);
      let result = match ? match[0].substring(1, match[0].length) : false;
      console.log(result);
      return result;
    },
    isAudioFile(url) {
      console.log("ISAudio:" + url);
      const regExp = /\.(?:wav|mp3|ogg)$/i;
      const match = url.match(regExp);
      let result = match ? match[0].substring(1, match[0].length) : false;
      console.log(result);
      return result;
    },
    getYoutubeId(url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match) {
        return match && match[7].length == 11 ? match[7] : false;
      } else {
        return false;
      }
    },
    getVimeoId(url) {
      const regExp = /^.+vimeo.com\/(.*\/)?([^#\?]*)/;
      const match = url.match(regExp);
      return match ? match[2] || match[1] : false;
    },
    hideModal() {
      this.$store.commit("hideModal");
      // this.$refs.userInput.focus();
      // TODO: Find a way to make the user input box have focus
    },
    resetModal() {
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
    }
  }
};
</script>
