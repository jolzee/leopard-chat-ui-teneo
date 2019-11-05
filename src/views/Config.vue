<template>
  <div>
    <v-dialog
      v-model="showModal"
      fullscreen
      :persistent="true"
      :hide-overlay="true"
      light
    >
      <v-card style="background-color: #FAFAFA">
        <v-toolbar
          fixed
          color="grey lighten-2"
        >
          <v-col cols="8">
            <v-row
              align="center"
              justify="start"
            >
              <v-btn
                class="mr-2"
                fab
                small
                dark
                @click="refreshBrowser"
                aria-label="Refresh browser taking into account current selected solution"
                color="green"
                :loading="refresh"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
              <v-tooltip
                open-delay="600"
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="mr-2"
                    v-bind="attrs"
                    v-on="on"
                    aria-label="Open a new window showing the current selected solution embedded in a mobile view"
                    dark
                    fab
                    rounded
                    small
                    outlined
                    color="indigo"
                    :href="getActiveSolutionDeepLinkMobile"
                    target="_blank"
                  >

                    <v-icon dark>mdi-cellphone-android</v-icon>
                  </v-btn>
                </template>
                <span>Deep Link Mobile</span>
              </v-tooltip>
              <v-tooltip
                open-delay="600"
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="mr-2"
                    v-bind="attrs"
                    v-on="on"
                    aria-label="Refresh the browser to a deep link of the selected solution"
                    fab
                    dark
                    rounded
                    small
                    outlined
                    color="indigo"
                    :href="getActiveSolutionDeepLink"
                  >
                    <v-icon dark>mdi-monitor</v-icon>
                  </v-btn>
                </template>
                <span>Deep Link Desktop</span>

              </v-tooltip>
              <v-toolbar-title class="d-none d-sm-flex text-left">Configuration</v-toolbar-title>
            </v-row>
          </v-col>

          <v-spacer></v-spacer>
          <v-badge
            left
            overlap
            color="#4051B1"
            :aria-label="`There are ${config.solutions.length} known teneo solutions`"
            class="mr-2"
          >
            <span
              slot="badge"
              style="background-color: #4051B1"
            >{{config.solutions.length}}</span>
            <v-icon
              large
              color="grey lighten-1"
            >mdi-settings</v-icon>
          </v-badge>
          <v-chip
            v-if="config.activeSolution"
            disabled
            color="green"
            text-color="white"
            class="mr-4 d-none d-sm-flex"
          >
            <v-avatar class="green darken-4">
              <v-icon>mdi-check</v-icon>
            </v-avatar>
            {{ config.activeSolution }}
          </v-chip>
        </v-toolbar>

        <v-container class="mt-5 pt-5">
          <v-col cols="12">
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-0">Solution Config</h3>
                      <div>
                        <v-container fluid>
                          <v-row>
                            <v-col
                              cols="12"
                              v-if="hasSolutions"
                            >
                              <v-select
                                style="max-width: 452px;"
                                color="light-blue darken-1"
                                item-avatar="userIcon"
                                autofocus
                                ref="selectedSolution"
                                item-text="name"
                                item-value="name"
                                v-model="selectedSolution"
                                :menu-props="{contentClass:'select-options'}"
                                solo
                                :items="sortedSolutions"
                                return-object
                                no-data-text="No Solutions"
                                label="Select a Teneo Solution"
                                aria-label="Select a Teneo solution"
                                append-icon="mdi-chevron-double-down"
                              ></v-select>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <v-tooltip
                                open-delay="600"
                                bottom
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    aria-label="Add a new solution"
                                    class="mr-2 mb-2"
                                    v-bind="attrs"
                                    v-on="on"
                                    fab
                                    dark
                                    small
                                    @click="addSolution"
                                    color="green"
                                  >
                                    <v-icon dark>mdi-plus-circle</v-icon>
                                  </v-btn>
                                </template>
                                <span>Create a new solution config</span>
                              </v-tooltip>
                              <v-tooltip
                                open-delay="600"
                                bottom
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    aria-label="Make the selected solution the active solution"
                                    class="mr-2 mb-2"
                                    v-bind="attrs"
                                    v-on="on"
                                    fab
                                    dark
                                    color="light-blue darken-1"
                                    small
                                    @click="setActiveSolution"
                                    v-if="selectedSolution"
                                  >
                                    <v-icon dark>{{(selectedSolution && (config.activeSolution === selectedSolution.name)) ? "mdi-checkbox-marked" : "mdi-checkbox-blank-outline"}}
                                    </v-icon>
                                  </v-btn>
                                </template>
                                <span>Active/Deactive</span>
                              </v-tooltip>
                              <template v-if="selectedSolution">
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Edit the selected solution"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      color="pink darken-4"
                                      @click="editSolution"
                                    >
                                      <v-icon dark>mdi-pencil</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Edit</span>
                                </v-tooltip>
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Clone the currently selected solution"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      @click="cloneSolution"
                                      color="orange"
                                    >
                                      <v-icon dark>mdi-content-copy</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Clone</span>
                                </v-tooltip>
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Delete the currently selected solution"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      @click="deleteSolutionConfig"
                                      color="red"
                                    >
                                      <v-icon dark>mdi-trash-can</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Delete</span>
                                </v-tooltip>
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Copy the selected solution configuration to the clipboard"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      color="indigo"
                                      @click="copySolutionToClipboard"
                                    >
                                      <v-icon dark>mdi-clipboard-arrow-up-outline</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Copy selected solution config to clipboard</span>
                                </v-tooltip>
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Download the selected solution's configuration as a file"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      color="teal darken-3"
                                      @click="downloadSelectedSolutionConfig"
                                    >
                                      <v-icon dark>mdi-file-download</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Download selected solution's config as a file</span>
                                </v-tooltip>
                                <v-tooltip
                                  open-delay="600"
                                  bottom
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      aria-label="Generate sharable link for team members"
                                      class="mr-2 mb-2"
                                      v-bind="attrs"
                                      v-on="on"
                                      fab
                                      dark
                                      small
                                      color="red darken-3"
                                      @click="createShareLinkForSolution"
                                    >
                                      <v-icon dark>mdi-link-plus</v-icon>
                                    </v-btn>
                                  </template>
                                  <span>Generate sharable link for team members</span>
                                </v-tooltip>
                              </template>
                            </v-col>
                          </v-row>
                        </v-container>
                      </div>
                    </div>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
            <v-row class="mt-3 mb-3">
              <v-col cols="12">
                <v-card class="pb-3">

                  <v-card-title primary-title>
                    <div>
                      <h3 class="headline mb-3">Upload / Download / Help</h3>
                      <div>
                        <!-- show the nicely formatted view of the full configuration -->

                        <v-tooltip
                          open-delay="600"
                          bottom
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              aria-label="Upload new or additional solution configurations"
                              class="mr-2 mt-2"
                              v-bind="attrs"
                              v-on="on"
                              fab
                              dark
                              small
                              color="pink"
                              @click="showUploadDialog"
                            >
                              <v-icon dark>mdi-upload</v-icon>
                            </v-btn>
                          </template>
                          <span>Upload an individual or full solution config</span>
                        </v-tooltip>
                        <v-tooltip
                          open-delay="600"
                          bottom
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              aria-label="Copy all solution configurations to the clipboard"
                              class="mr-2 mt-2"
                              v-bind="attrs"
                              v-on="on"
                              fab
                              dark
                              small
                              color="indigo"
                              @click="copyWholeConfigClipboard"
                            >
                              <v-icon dark>mdi-clipboard-arrow-up-outline</v-icon>
                            </v-btn>
                          </template>
                          <span>Copy full solution config to clipboard</span>
                        </v-tooltip>
                        <v-tooltip
                          open-delay="600"
                          bottom
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              aria-label="Download all solution configurations as a JSON file"
                              class="mr-2 mt-2"
                              v-bind="attrs"
                              v-on="on"
                              fab
                              dark
                              small
                              color="teal darken-3"
                              @click="downloadSolutionConfig"
                            >
                              <v-icon dark>mdi-file-download</v-icon>
                            </v-btn>
                          </template>
                          <span>Download all solutions configs as a file</span>
                        </v-tooltip>
                        <v-tooltip
                          open-delay="600"
                          bottom
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              aria-label="Toggle a visual display of all solution configurations as JSON"
                              class="mr-2 mt-2"
                              v-bind="attrs"
                              v-on="on"
                              fab
                              dark
                              small
                              color="deep-purple"
                              @click="toggleDisplayOfSolutionConfig"
                            >
                              <v-icon dark>{{ displayFullSolutionConfig ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                            </v-btn>
                          </template>
                          <span>Toggle display of full solution config</span>
                        </v-tooltip>
                        <v-tooltip
                          open-delay="600"
                          bottom
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              aria-label="Open documentation for Leopard's Chat UI"
                              class="mr-2 mt-2"
                              fab
                              v-bind="attrs"
                              v-on="on"
                              dark
                              small
                              color="brown darken-3"
                              href="https://jolzee.gitbook.io/leopard/"
                              target="_blank"
                            >
                              <v-icon dark>mdi-lifebuoy</v-icon>
                            </v-btn>
                          </template>
                          <span>Help / Documentation</span>
                        </v-tooltip>
                      </div>
                    </div>
                  </v-card-title>

                </v-card>
              </v-col>
            </v-row>

            <div v-if="displayFullSolutionConfig && !displayAddEditDialog">
              <prism language="json">{{ prettyPrintFullConfig }}</prism>
            </div>

            <!-- upload new configuration -->
            <v-dialog
              v-model="uploadDialog"
              scrollable
              persistent
              light
              max-width="calc(1200px - 20vw)"
            >

              <v-card>
                <v-card-title>
                  <h3>Upload Configurations
                    <v-progress-circular
                      v-if="showProgressUpload"
                      :size="30"
                      :width="3"
                      indeterminate
                      color="purple"
                    ></v-progress-circular>
                  </h3>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text style="height: 90vh">

                  <v-row>
                    <v-col cols="12">
                      <div class="upload-btn ml-2 mb-2">
                        <input
                          id="uploadFile"
                          type="file"
                          accept="text/*"
                          name="uploadFile"
                          @click="toggleLoading"
                          @change="readConfigFile"
                        />
                        <label
                          for="uploadFile"
                          class="v-btn primary upload-btn pa-2 ml-2"
                        >
                          Upload
                          <v-icon
                            dark
                            right
                          >mdi-publish</v-icon>
                        </label>
                      </div>
                      <v-textarea
                        v-model="getUploadConfig"
                        :loading="uploadTextAreaLoading"
                        ref="newConfig"
                        filled
                        name="new-config"
                        label="Paste in full or partial configurations"
                        :value="getUploadConfig"
                        auto-grow
                        prepend-icon="mdi-settings-transfer"
                        class="coding-font"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="mr-2"
                    color="blue-grey lighten-5"
                    light
                    @click="closeUploadDialog"
                  >Close</v-btn>
                  <v-btn
                    class="mr-2"
                    color="green"
                    @click="saveUploadForm"
                  >Save
                    <v-icon
                      right
                      dark
                    >mdi-content-save-move</v-icon>
                  </v-btn>
                  <v-snackbar
                    :timeout="globalSnackbarTimeout"
                    v-model="globalSnackbar"
                    absolute
                  >
                    {{ globalSnackbarMessage }}
                  </v-snackbar>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-container>
      </v-card>
    </v-dialog>
    <ConfigAddEditSolution
      v-if="displayAddEditDialog"
      v-on:result="closeAddNewSolutionDialog($event)"
      :currentModeEdit="currentModeEdit"
      :config="config"
      :selectedSolution="selectedSolution"
      key="configAddEditSolution"
    ></ConfigAddEditSolution>
    <v-row class="mb-2">
      <!-- global snackbar -->
      <v-snackbar
        :timeout="globalSnackbarTimeout"
        v-model="globalSnackbar"
        :color="globalSnackbarColor"
      >
        {{ globalSnackbarMessage }}
      </v-snackbar>

    </v-row>
  </div>
</template>

<script>
import dayjs from "dayjs";
import copy from "copy-to-clipboard";
import {
  STORAGE_KEY,
  SOLUTION_DEFAULT
} from "../constants/solution-config-default.js";
import "prismjs/prism";
import "prismjs/themes/prism-funky.css";
import "prismjs/components/prism-json.min.js";
import ConfigAddEditSolution from "../components/ConfigAddEditSolution";
import Prism from "vue-prism-component";
import jsonpack from "jsonpack/main";

export default {
  name: "ConfigView",
  components: {
    Prism,
    ConfigAddEditSolution
  },
  data() {
    return {
      refresh: false,
      snackbar: false,
      snackbarTimeout: 3000,
      globalSnackbarMessage: "",
      globalSnackbar: false,
      globalSnackbarTimeout: 2000,
      globalSnackbarColor: "",
      uploadTextAreaLoading: false,
      displayFullSolutionConfig: false,
      showProgressUpload: false,
      displayAddEditDialog: false,
      currentModeEdit: "",
      dialogTitle: "",
      showModal: true,
      saveLoading: false,
      uploadDialog: false,
      uploadConfig: "",
      selectedSolution: null,
      config: this.$store.state.chatConfig
        ? this.$store.state.chatConfig
        : {
            activeSolution: "",
            solutions: []
          }
    };
  },
  computed: {
    sortedSolutions() {
      return this.config.solutions.slice().sort(this.compareSolutions);
    },
    getUploadConfig: {
      get: function() {
        return this.uploadConfig;
      },
      set: function(newValue) {
        this.uploadConfig = newValue;
      }
    },
    hasSolutions() {
      return this.config.solutions.length > 0;
    },
    prettyPrintFullConfig() {
      return JSON.stringify(this.config, null, 2);
    },
    getActiveSolutionDeepLink() {
      sessionStorage.removeItem(STORAGE_KEY + "teneo-chat-history");
      return `${location.protocol}//${location.host}${location.pathname}?dl=${this.selectedSolution.deepLink}`;
    },
    getActiveSolutionDeepLinkMobile() {
      sessionStorage.removeItem(STORAGE_KEY + "teneo-chat-history");
      return `${location.protocol}//${location.host}${location.pathname}mobile.html?dl=${this.selectedSolution.deepLink}`;
    },
    getCurrentSelectedSolutionConfig() {
      const result = JSON.stringify(this.selectedSolution, null, 2);
      // console.log(result);
      return result;
    },
    getFullSolutionConfig() {
      const result = JSON.stringify(this.config, null, 2);
      return result;
    }
  },
  updated: function() {},
  created() {
    // add new JSON config if missing
    this.config.solutions.forEach(solution => {
      this.fixSolution(solution);
    });
    this.setActiveSolutionAsSelected();
    this.saveToLocalStorage();
  },
  methods: {
    fixSolution(solution) {
      if (!("animations" in solution)) {
        solution.animations = SOLUTION_DEFAULT.animations;
      }
      if (!("promptTriggers" in solution)) {
        solution.promptTriggers = SOLUTION_DEFAULT.promptTriggers;
      }
    },
    createShareLinkForSolution() {
      // let configValue = encodeURIComponent(
      //   JSON.stringify(this.selectedSolution)
      // );

      let configValue = encodeURIComponent(
        jsonpack.pack(this.selectedSolution)
      );

      const sharableLink = `${location.protocol}//${location.host}${location.pathname}?import=${configValue}`;
      copy(sharableLink);
      this.displaySnackBar(
        "📋 Copied Solution Sharable Import Link to Clipboard 🔗"
      );
      this.snackbarClipboard = true;
    },
    closeAddNewSolutionDialog(result) {
      this.displayAddEditDialog = false;

      if (result) {
        this.config = result.config;
        this.selectedSolution = this.config.solutions.find(
          solution => solution.name === result.selectedSolutionName
        );
      }
      this.currentModeEdit = "";
      this.saveToLocalStorage();
      const self = this;
      setTimeout(function() {
        self.solution = self.cloneObject(SOLUTION_DEFAULT);
      }, 1000);
    },
    toggleDisplayOfSolutionConfig() {
      this.displayFullSolutionConfig = !this.displayFullSolutionConfig;
    },
    importSolution(newSolution) {
      this.fixSolution(newSolution);
      let existingSolutionsWithName = this.config.solutions.findIndex(
        solution => solution.name === newSolution.name
      );
      let existingSolutionsWithDeepLink = this.config.solutions.findIndex(
        solution => solution.deepLink === newSolution.deepLink
      );

      if (existingSolutionsWithName < 0 && existingSolutionsWithDeepLink < 0) {
        // no clashes in name or deep link
        this.config.solutions.push(newSolution); // no conflicts
      } else if (
        existingSolutionsWithName >= 0 &&
        existingSolutionsWithDeepLink >= 0
      ) {
        // name and deep link clash
        newSolution.name = newSolution.name + " [imported]";
        newSolution.deepLink = newSolution.deepLink + "-" + this.randId();
        this.config.solutions.push(newSolution);
      } else if (
        existingSolutionsWithName >= 0 &&
        existingSolutionsWithDeepLink < 0
      ) {
        // name clash only
        newSolution.name = newSolution.name + " [imported]";
        this.config.solutions.push(newSolution);
      } else if (
        existingSolutionsWithDeepLink >= 0 &&
        existingSolutionsWithName < 0
      ) {
        // deeplink clash only
        newSolution.deepLink = newSolution.deepLink + "-" + this.randId();
        this.config.solutions.push(newSolution);
      }
    },
    toggleLoading() {
      this.showProgressUpload = true;
    },
    readConfigFile(event) {
      this.showProgressUpload = true;
      var file = event.target.files[0];
      this.uploadConfig = "";

      let reader = new FileReader();
      let self = this;
      reader.onload = function() {
        self.uploadConfig = reader.result;
        self.showProgressUpload = false;
      };
      reader.readAsText(file);
    },
    compareSolutions(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    },
    downloadSolutionConfig() {
      this.download(
        this.getFullSolutionConfig,
        `leopard-all-config-${dayjs().format("YYYYMMDD[-]H[-]mm")}.txt`
      );
    },
    downloadSelectedSolutionConfig() {
      this.download(
        JSON.stringify(this.selectedSolution, null, 2),
        `leopard-${this.selectedSolution.name
          .replace(/[|&;$%@"<>()+,]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()}-config-${dayjs().format("YYYYMMDD[-]H[-]mm")}.txt`
      );
    },
    download(data, filename, type = "text/plain") {
      var file = new Blob([data], {
        type: type
      });
      if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
      else {
        // Others
        var a = document.createElement("a"),
          url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      }
    },
    copyWholeConfigClipboard() {
      copy(JSON.stringify(this.config, null, 2));
      this.displaySnackBar("📋 Copied All Solution Configs to Clipboard");
      this.snackbarClipboard = true;
    },
    copySolutionToClipboard() {
      copy(JSON.stringify(this.selectedSolution, null, 2));
      this.displaySnackBar("📋 Copied Solution Config to Clipboard");
    },
    setActiveSolutionAsSelected() {
      // pre select the solution active in the browser
      if (this.$store.getters.activeSolution) {
        this.selectedSolution = this.$store.getters.activeSolution;
      } else {
        // fallback to the default active solutions
        this.selectedSolution = this.config.solutions.find(
          solution => solution.name === this.config.activeSolution
        );
      }
    },
    setSolutionAsSelected(solutionName) {
      this.selectedSolution = this.config.solutions.find(
        solution => solution.name === solutionName
      );
    },
    randId() {
      return Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(2, 10);
    },
    cloneObject(obj) {
      // this is a deep clone
      return JSON.parse(JSON.stringify(obj));
    },
    doesParameterExist(name) {
      var queryString = location.search;
      var params = queryString.substring(1).split("&");
      for (var i = 0; i < params.length; i++) {
        var pair = params[i].split("=");
        if (decodeURIComponent(pair[0]) == name) return true;
      }
      return false;
    },
    refreshBrowser() {
      this.refresh = true;
      sessionStorage.removeItem("teneo-chat-history"); // new config delete chat history
      let addtionalParams = "";
      if (this.doesParameterExist("embed")) {
        addtionalParams += "&embed";
      }
      if (this.doesParameterExist("button")) {
        addtionalParams += "&button";
      }
      window.location = `${location.protocol}//${location.host}${location.pathname}?dl=${this.selectedSolution.deepLink}${addtionalParams}`;
    },
    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
    },
    editSolution() {
      if (this.selectedSolution !== null) {
        this.dialogTitle = "Editing Solution";
        this.currentModeEdit = "edit";
        this.solution = this.cloneObject(this.selectedSolution); // make a copy - we have a save button
        this.showAddEditDialog();
      }
    },
    setActiveSolution() {
      this.config.activeSolution = this.selectedSolution.name;
      this.saveToLocalStorage();
    },
    cloneSolution() {
      const newName = this.selectedSolution.name + " - Copy";
      let clonedSolution = this.cloneObject(this.selectedSolution);
      clonedSolution.name = newName;
      const duplicateSolutions = this.config.solutions.filter(
        solution => solution.name === newName
      );
      if (duplicateSolutions.length > 0) {
        clonedSolution.name = clonedSolution.name + " [" + this.randId() + "]";
      }
      clonedSolution.deepLink = clonedSolution.deepLink + "-" + this.randId();
      this.config.solutions.push(clonedSolution);
      this.selectedSolution = this.cloneObject(clonedSolution);
      this.displaySnackBar(
        "Solution was cloned. New name is " + clonedSolution.name,
        3000
      );
      this.saveToLocalStorage();
    },
    displaySnackBar(message, timeout = 2000, color = "") {
      this.globalSnackbar = false;
      this.globalSnackbarMessage = message;
      this.globalSnackbar = true;
      this.globalSnackbarTimeout = timeout;
      this.globalSnackbarColor = color;
    },
    deleteSolutionConfig() {
      if (this.selectedSolution) {
        const name = this.selectedSolution.name;
        if (this.config.activeSolution === name) {
          this.config.activeSolution = "";
        }
        this.config.solutions = this.config.solutions.filter(
          obj => JSON.stringify(obj) !== JSON.stringify(this.selectedSolution)
        );
        if (this.config.solutions.length === 1) {
          this.config.activeSolution = this.config.solutions[0].name;
          this.selectedSolution = this.cloneObject(this.config.solutions[0]);
        } else if (this.config.solutions.length > 1) {
          let self = this;
          this.selectedSolution = this.cloneObject(
            this.config.solutions.find(function(solution) {
              return solution.name === self.config.activeSolution;
            })
          );
        } else {
          this.selectedSolution = null;
        }
        this.displaySnackBar("Solution was deleted", 3000);
        this.saveToLocalStorage();
      }
    },
    closeUploadDialog() {
      this.newConfig = "";
      this.uploadConfig = "";
      this.uploadDialog = false;
    },
    saveUploadForm() {
      // let inputValue = this.$refs.newConfig.inputValue;
      if (this.uploadConfig && this.uploadConfig.trim()) {
        let newConfig = "";
        try {
          newConfig = JSON.parse(this.uploadConfig);
        } catch (error) {
          this.displaySnackBar("Please provide a valid configuration", 3000);
          return;
        }
        if (newConfig && "activeSolution" in newConfig) {
          // ok uploading a full config
          if ("activeSolution" in this.config) {
            // let's merge
            newConfig.solutions.forEach(newSolution => {
              this.importSolution(newSolution);
            });
            this.displaySnackBar(
              "Merged existing full config with newly uploded",
              3000
            );
          } else {
            // current config is empty
            this.config = newConfig;
            this.displaySnackBar("Imported a new full configuration", 3000);
          }

          this.setActiveSolutionAsSelected();
        } else if (newConfig && "name" in newConfig) {
          // uploading a single config - add it to the current solution config
          this.importSolution(newConfig);
          this.setSolutionAsSelected(newConfig.name);
          this.displaySnackBar("Imported as " + newConfig.name, 3000);
        }

        this.closeUploadDialog();
        this.saveToLocalStorage();
      } else {
        this.displaySnackBar(
          "Please provide a valid configuration",
          3000,
          "red"
        );
      }
    },
    addSolution() {
      this.dialogTitle = "Creating a new solution configuration";
      this.solution = this.cloneObject(SOLUTION_DEFAULT);
      const self = this;
      this.showAddEditDialog();
      setTimeout(function() {
        self.showAddEditDialog();
      }, 1000);
    },
    showAddEditDialog() {
      this.displayAddEditDialog = true;
    },
    showUploadDialog() {
      this.uploadDialog = true;
    },

    getBase64Image(img) {
      // bannerImage = document.getElementById("bannerImg");
      // imgData = getBase64Image(bannerImage);
      // localStorage.setItem("imgData", imgData);

      // var dataImage = localStorage.getItem('imgData');
      // bannerImg = document.getElementById('tableBanner');
      // bannerImg.src = "data:image/png;base64," + dataImage;

      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      var dataURL = canvas.toDataURL("image/png");

      return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
  }
};
</script>

<style>
div.v-input__slot:focus,
button:focus,
a:focus {
  -webkit-box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
  box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
  outline: 0;
}
</style>

<style scoped>
div.v-input__slot:focus,
button:focus,
a:focus {
  -webkit-box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
  box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
  outline: 0;
}

#app {
  border-radius: 0px !important;
}

.select-options {
  position: fixed !important;
  /* margin-left: 15px; */
}

.upload-btn {
  padding-left: 16px;
  padding-right: 16px;
}

.upload-btn input[type="file"] {
  position: absolute;
  height: 0.1px;
  width: 0.1px;
  overflow: hidden;
  opacity: 0;
  z-index: -1;
}

.upload-btn-hover {
  cursor: pointer;
}

.v-tooltip__content {
  position: fixed !important;
}

.code-styling {
  /* margin: 0 !important; */
  background-color: inherit;
  /* margin-bottom: -20px !important; */
}

.coding-font {
  font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;
  font-size: 1em;
}

.mono-font {
  font-family: "Courier New", Courier, monospace;
  font-weight: 500;
  font-size: 10px !important;
  line-height: 1;
}

code {
  display: unset !important;
  border-radius: 2px !important;
  white-space: unset !important;
  font-size: unset !important;
  font-weight: unset !important;
}

pre[class*="language-"] {
  background-size: 1.2em 1.2em !important;
  background-color: rgba(76, 43, 112, 1) !important;
  border-radius: 5px;
}
</style>
