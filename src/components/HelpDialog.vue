<template>
  <v-dialog
    v-model="showDialog"
    scrollable
    persistent
    max-width="calc(1200px - 20vw)"
  >
    <v-card>
      <v-card-title>
        <h3>How to Configure a Solution in Teneo</h3>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 90vh">
        <v-layout row>
          <v-flex xs12>
            <p>
              To show any bells and whistles in the chat client interface. You will first need to add the contents of the following file to Solution loaded or upload the file to Resources and save it in <strong>/script_lib</strong></p>
            <p>
              <ul>
                <li><a
                    href="https://www.dropbox.com/s/zp3oyudt1jv640m/ExtensionHelper.groovy?dl=0"
                    target="_blank"
                  >https://www.dropbox.com/s/zp3oyudt1jv640m/ExtensionHelper.groovy?dl=0</a></li>
              </ul>

              <!-- <a href="https://www.dropbox.com/s/mqaovq0q52wb0ww/ExtensionHelper.groovy?dl=0" target="_blank">https://www.dropbox.com/s/mqaovq0q52wb0ww/ExtensionHelper.groovy?dl=0</a> -->
            </p>
            <p>
              Then you need to add an
              <strong>output parameter</strong> called
              <strong>extensions</strong> to the output where you want to show the extended view</p>
            <p>And the value differs depending on what you want to achieve.</p>

            If you wanted to show an image in a modal, the value should be:
            <prism language="groovy">${ExtensionHelper.displayImage(imageUrl,channel)}</prism>
            Where url is a variable containing the url of the image and channel is a variable specifying either
            <strong>webview</strong>,
            <strong>facebook </strong>or
            <strong>slack</strong>
            <br /><br />
            <p>If you wanted to show an images in a carousel, the value should be:</p>

            <prism language="groovy">${ExtensionHelper.displayImageCarousel(imageUrlArray,channel)}</prism>

            If you want to display a media file (Vimeo, YouTube, mp4, mp3), the value should be:
            <prism language="groovy">${ExtensionHelper.displayVideo(url,channel)}</prism>

            If you want to display some custom html, the value should be:

            <prism language="groovy">${ExtensionHelper.displayPanel(htmlContent,channel)}</prism>

            Display a button clickable list:

            <prism language="groovy">${ExtensionHelper.displayClickableList(myItems,channel)}</prism>

            Display a clickable list with each items on a separate line:

            <prism language="groovy">${ExtensionHelper.displayClickableList(myItems,channel, true)}</prism>

            Where myItems is a Map formatted as follows:

            <pre><prism language="groovy">def myItems = ["title": "Please confirm",
                "items": [
                  ["name": "Yes"],
                  ["name": "No"],
                  ["name": "Maybe", "params": "paramname=this-will-be-sent-back-in-url-when-maybe-option-clicked-optional"]
                ]]</prism></pre>
            Example media files that can be used with <strong>"displayVideo"</strong>:<br /><br />
            <p>
              <ul>
                <li><a href="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4</a></li>
                <li><a href="https://www.mfiles.co.uk/mp3-downloads/chopin-nocturne-op9-no2.mp3">https://www.mfiles.co.uk/mp3-downloads/chopin-nocturne-op9-no2.mp3</a></li>
                <li><a href="https://www.youtube.com/watch?v=rayiRwxUGdk">https://www.youtube.com/watch?v=rayiRwxUGdk</a></li>
                <li><a href="https://vimeo.com/114532272">https://vimeo.com/114532272</a></li>
              </ul>
            </p>
            You can also show a date picker just add an output parameter:
            <prism language="properties">datePicker = true</prism>

            Show a time picker by adding an output parameter:
            <prism language="properties">timePicker = true</prism>

            <h3>Modal Size and Positioning</h3>

            <p>To control the size of the respective dialog/modal that displays on the screen you can add either or both of these output parameters.</p>
            <prism language="properties">modalPosition = left/center/right/fullscreen</prism>
            <strong>"right"</strong> is the default if you don't specify a
            <strong>"modalPosition"</strong> output parameter.
            <prism language="properties">modalSize = small/medium/large/x-large</prism>
            <strong>"small"</strong> is the default if you don't specify a
            <strong>"modalSize"</strong> output parameter.<br />
            <br />
            <h3>Handling Anchor Links</h3>
            <p>You can output links in html or answer text that are then fed back into Teneo as user input.</p>
            <prism language="markup">&lt;a href=&quot;#&quot; class=&quot;sendInput&quot;&gt;This will be sent to Teneo&lt;/a&gt;</prism>
            <prism language="markup">&lt;a href=&quot;#&quot; onclick=&quot;sendUserInput('How do I fix a paper jam?')&quot;&gt;How do I fix a paper jam?&lt;/a&gt;</prism>

            <br>
            <h3>Switching Solution URL based off NER Language Detection</h3>
            <p>
              You can switch the Teneo Endpoint URL midway through a conversation. This is useful if you determine that a user is talking another language or is asking about a topic that might be better handled by another Teneo Solution. To accomplish this you would need to add two output parameters:
            </p>
            <prism language="properties">langinput = User input text you want to send to the new Teneo Runtime URL</prism>
            <prism language="properties">langengineurl = URL to the new Teneo Solution</prism>

            <br>
            <h3>Showing a Table in a Modal</h3>
            <p>
              You can display a sortable, paginated, and searchable table in a modal flyout. Note that tables tend to be larger than the typical chat window width, so you might want to position the modal
              <strong>center</strong> and make its size
              <strong>medium/large/x-large</strong>. Position and sizing output parameters are detailed above. To add a table you need to add an
              <strong>extensions</strong> output parameter with the following value:
            </p>
            <prism language="groovy">${ExtensionHelper.displayTable("webview", "My Example Table Title", "", true, headers, rows)}</prism>
            The displayTable method has this format:
            <prism language="groovy">public static String displayTable(def channel = "webview", def title, def footer = "", def enableSearch = true, def headers, def rows) {}</prism>
            There's a utility method that will build a table header for you.

            <prism language="groovy">public static Map createTableHeader(text, value, sortable = false, align = "center", width = "") {}</prism>

            Here's a script that will build a basic table. Note you can position table headers left, right or center:
            <pre><prism language="groovy">def dateHeader = ExtensionHelper.createTableHeader("Date", "date", true, "left", "20%");
def descriptionHeader = ExtensionHelper.createTableHeader("Description", "desc", false, "left");
def costHeader = ExtensionHelper.createTableHeader("Cost", "cost", true, "left", "20%");

headers = [dateHeader, descriptionHeader, costHeader]
rows = [
	[
		"date": "03/30/2018",
		"desc": "Description 1",
		"cost" : "\$100"
	],
	[
		"date": "05/22/2018",
		"desc": "Description 2",
		"cost" : "\$200"
	],
	[
		"date": "07/15/2018",
		"desc": "Description 3",
		"cost" : "\$300"
	],
]</prism></pre>

            <h3>Handover to Live Agent</h3>
            <p>To hand off to the live chat integration you will need to send an output parameter to the chat client</p>
            <prism language="groovy">liveChat = ${theDialogThatWillBePassedToTheLiveChatSystem}</prism>
            <p>If you want to be able to check if a live agent is available in Studio you can use the following integration</p>
            <v-img
              :src="liveChatImage()"
              class="elevation-4"
            ></v-img><br />
            <h3>ASR and TTS</h3>
            <p>
              You can enable ASR and TTS on a Chrome browser.

              <strong>toggle ASR and TTS</strong>:
            </p>
            <pre><prism language="groovy">
Long click in input box
Long click on any Teneo response icon
Long click on the >> chevron or micphrone icon
CTL+ALT+/ or CTL+ALT+DOWNARROW</prism></pre>

            <p>
              <strong>Capture audio through ASR</strong> can be done by clicking on the micrphone button or through shortcuts:
            </p>
            <prism language="groovy">CTL+ALT+UPARROW or CTL+ALT+.</prism>

            <p>
              <strong>Audion Capture or TTS can be cancelled</strong> using:
            </p>
            <prism language="groovy">ESC</prism>

            <p>
              You can <strong>close the modal window</strong> with:
            </p>
            <prism language="groovy">CTL+ALT+LEFTARROW</prism>

            <h3>TTS</h3>
            <p>
              If you have ASR and TTS enabled then you can override what is shown on the screen vs what is spoken back through the TTS. You just need to define a 'tts' output parameter on the respective output node.
              <prism language="properties">tts = "This will be spoken back through TTS"</prism>
            </p>

            <h3>Get the code</h3>
            <pre><prism language="bash"># clone
git clone https://github.com/jolzee/chat-teneo-vue.git

# move into cloned project
cd chat-teneo-vue

# install dependencies
npm install

# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build

# Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).</prism></pre>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-grey lighten-5"
          light
          @click="closeAction"
        >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<style scoped>
</style>
<script>
import "prismjs/prism";
import "prismjs/themes/prism-funky.css";
import "prismjs/plugins/command-line/prism-command-line.css";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-javascript.min.js";
import "prismjs/components/prism-properties.min.js";
import "prismjs/components/prism-bash.min.js";
import "prismjs/components/prism-groovy.min.js";
import "prismjs/plugins/command-line/prism-command-line.min.js";
import "prismjs/plugins/remove-initial-line-feed/prism-remove-initial-line-feed.min.js";
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js";

import Prism from "vue-prism-component";

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
  },
  methods: {
    liveChatImage() {
      return require("../assets/images/misc/livechat.png");
    }
  }
};
</script>