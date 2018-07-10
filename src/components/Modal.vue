<template>
  <v-layout>
    <v-flex xs12>
      <v-dialog v-model="showModal" scrollable content-class="modal-fly-out" hide-overlay transition="dialog-bottom-transition">
        <v-card height="100vh">
          <v-toolbar dark color="primary">
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

          <transition name="modal-image-transition" enter-active-class="animated zoomIn">
            <v-card-media v-if="imageUrl" :src="imageUrl" height="226px" contain></v-card-media>
          </transition>
          <v-layout align-content-start row wrap column>

            <v-card-title primary-title>
              <div>
                <div class="headline" v-if="title">{{title}}</div>
                <span class="grey--text" v-if="subTitle">{{subTitle}}</span>
              </div>
            </v-card-title>
            <v-layout justify-center class="pb-3" row fill-height align-start>
              <v-card-actions>
                <v-btn color="primary" v-shortkey="['ctrl', 'alt', 'arrowleft']" @shortkey.native="hideModal" @click.native="hideModal">{{ $t('back.to.chat.button') }}
                </v-btn>
              </v-card-actions>
            </v-layout>
            <v-spacer></v-spacer>
          </v-layout>
          <flight-itinerary v-if="itinerary" :itinerary="itinerary"></flight-itinerary>
          <v-card-text class="cardText" v-if="bodyText" v-html="bodyText" scrollable></v-card-text>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>
<style scoped>
.cardText {
  padding-top: 5px;
  padding-left: 30px;
  text-align: left;
}
</style>
<style>
.modal-fly-out {
  position: absolute !important;
  width: 360px !important;
  right: 0 !important;
  margin: 0 !important;
  max-height: 100% !important;
  height: 100% !important;
}
.plyr__menu {
  display: none;
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
        let outputLink = decodeURIComponent(teneoResponse.link.href);
        let actionRAW = decodeURIComponent(teneoResponse.extraData.extensions);
        let transcript = decodeURIComponent(
          response.teneoResponse.extraData.liveChat
        );
        let displayModal = false;

        // check if user wants to talk to a live agent
        console.log("Live Chat? :" + this.$store.getters.isLiveChat);
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
          document.getElementById("site-frame").src = outputLink;
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
          if (action.name === "displayCollection") {
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

        return displayModal ? this.$store.getters.getShowModal : false;
      }
      return false;
    }
  },
  updated: function() {},
  mounted() {},
  methods: {
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
