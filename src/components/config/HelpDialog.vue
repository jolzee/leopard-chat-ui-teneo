<template>
    <v-dialog v-model="showDialog" scrollable persistent max-width="calc(1200px - 20vw)">
        <v-card>
            <v-card-title>
                <h3>How to Configure a Solution in Teneo</h3>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: 90vh">
                <v-layout row>
                    <v-flex xs12>
                        <p>
                            To show any bells and whistles in the chat client interface. You will first need to add the contents of the following file to Solution loaded or upload the file to Resources and save it in /script_lib</p>
                        <p>
                            <a href="https://www.dropbox.com/s/mqaovq0q52wb0ww/ExtensionHelper.groovy?dl=0" target="_blank">https://www.dropbox.com/s/mqaovq0q52wb0ww/ExtensionHelper.groovy?dl=0</a>
                        </p>
                        <p>
                            Then you need to add an
                            <strong>output parameter</strong> called
                            <strong>extensions</strong> to the output where you want to show the extended view</p>
                        <p>And the value differs depending on what you want to achieve.</p>

                        For example, if you want to show an image, the value should be:
                        <prism language="groovy">${ExtensionHelper.displayImage(url,channel)}</prism>
                        Where url is a variable containing the url of the image and channel is a variable specifying either
                        <strong>webview</strong>,
                        <strong>facebook </strong>or
                        <strong>slack</strong>

                        If you want to display a media file (Vimeo, YouTube, mp4, mp3), the value should be:
                        <prism language="groovy">${ExtensionHelper.displayVideo(url,channel)}</prism>

                        If you want to display some custom html, the value should be:

                        <prism language="groovy">${ExtensionHelper.displayPanel(htmlContent,channel)}</prism>

                        Display a clickable list:

                        <prism language="groovy">${ExtensionHelper.displayClickableList(myItems,channel)}</prism>

                        Where myItems is an array formatted as follows:

                        <prism language="groovy">def myItems = [ "title":"Please confirm", "items":[ ["name":"Yes", "params": "jolzee=washere&peter=joles"], ["name":"No"], ["name":"Maybe"] ] ]</prism>
                        Example media files that can be used with "displayVideo":<br/><br/>
                        <p>
                            <a href="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4</a><br/>
                            <a href="https://www.mfiles.co.uk/mp3-downloads/chopin-nocturne-op9-no2.mp3">https://www.mfiles.co.uk/mp3-downloads/chopin-nocturne-op9-no2.mp3</a><br/>
                            <a href="https://www.youtube.com/watch?v=-NnuefHCNdU">https://www.youtube.com/watch?v=-NnuefHCNdU</a><br/>
                            <a href="https://vimeo.com/114532272">https://vimeo.com/114532272</a><br/>
                        </p>
                        You can also show a date picker just add an output parameter:
                        <prism language="groovy">datePicker = true</prism>
                    </v-flex>
                </v-layout>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-grey lighten-5" light @click="closeAction">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>
</style>
<script>
import Prism from "vue-prism-component";
import "@/assets/prism.css";
import prism from "@/assets/prism.js";

export default {
  props: {
    showDialog: Boolean,
    closeAction: Function
  },
  components: {
    Prism
  },
  data() {
    return {};
  }
};
</script>