<template>
  <div>
    <v-dialog
      v-model="showModal"
      content-class="leopard-config-modal"
      persistent
      scrollable
      max-height="auto"
      no-click-animation
      overlay-opacity="0.7"
      max-width="calc(900px - 10vw)"
      :fullscreen="
        fullscreen ||
          $vuetify.breakpoint.xs ||
          $vuetify.breakpoint.sm ||
          $vuetify.breakpoint.md
      "
      light
    >
      <v-card style="background-color: #FAFAFA">
        <v-system-bar
          height="30px"
          light
          :class="{
            'leopard-config-app-bar-fullscreen':
              fullscreen ||
              $vuetify.breakpoint.xs ||
              $vuetify.breakpoint.sm ||
              $vuetify.breakpoint.md
          }"
        >
          <v-icon>mdi-tune</v-icon>
          <span>Leopard Configuration</span>
          <v-spacer></v-spacer>
          <v-icon @click="toggleFullscreen">
            {{
            fullscreen ? "mdi-window-restore" : "mdi-window-maximize"
            }}
          </v-icon>
          <v-icon @click="$router.push('/')">mdi-close</v-icon>
        </v-system-bar>
        <v-app-bar color="#2F286B" max-height="64px">
          <v-fab-transition>
            <v-btn
              class="mr-2"
              :loading="!showSolutionButtons || refresh"
              fab
              small
              dark
              @click="refreshBrowser"
              aria-label="Refresh browser taking into account current selected solution"
              color="green"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-fab-transition>
          <v-tooltip open-delay="300" bottom color="green">
            <template v-slot:activator="{ on, attrs }">
              <v-fab-transition>
                <v-btn
                  class="mr-2"
                  :loading="!showSolutionButtons"
                  v-bind="attrs"
                  v-on="on"
                  aria-label="Open a new window showing the current selected solution embedded in a mobile view"
                  light
                  fab
                  rounded
                  small
                  color="#F3C234"
                  :href="getActiveSolutionDeepLinkMobile"
                  target="_blank"
                >
                  <v-icon dark>mdi-cellphone-android</v-icon>
                </v-btn>
              </v-fab-transition>
            </template>
            <span>
              Open mobile view in new page |
              {{ getSelectedSolutionName }}
            </span>
          </v-tooltip>
          <v-tooltip open-delay="300" bottom color="green">
            <template v-slot:activator="{ on, attrs }">
              <v-fab-transition>
                <v-btn
                  class="mr-2"
                  :loading="!showSolutionButtons"
                  v-bind="attrs"
                  v-on="on"
                  aria-label="Refresh the browser to a deep link of the selected solution"
                  fab
                  light
                  rounded
                  small
                  color="#F3C234"
                  :href="getActiveSolutionDeepLink"
                >
                  <v-icon dark>mdi-monitor</v-icon>
                </v-btn>
              </v-fab-transition>
            </template>
            <span>
              Reload page to the active solution |
              {{ getSelectedSolutionName }}
            </span>
          </v-tooltip>

          <v-spacer></v-spacer>
          <v-badge
            left
            overlap
            color="#4051B1"
            :aria-label="
              `There are ${config.solutions.length} known teneo solutions`
            "
            class="mr-2 d-none d-sm-inline"
          >
            <span slot="badge" style="background-color: #4051B1">
              {{
              config.solutions.length
              }}
            </span>
            <v-icon large color="grey lighten-1">mdi-settings</v-icon>
          </v-badge>
          <v-chip
            v-if="config.activeSolution"
            color="#24C0CA"
            text-color="#2F2869"
            class="pl-1 mr-2 d-none d-sm-none d-md-inline elevation-2"
          >
            <v-avatar color="#FE4E5D" class="ml-0 pl-0 mr-2 elevation-2">
              <v-icon>mdi-check</v-icon>
            </v-avatar>
            {{ config.activeSolution }}
          </v-chip>
        </v-app-bar>
        <v-card-text height="80%" class="px-2 mx-0 py-0">
          <v-container fluid>
            <v-row align="start" justify="start">
              <v-col cols="12" class="pa-2">
                <p class="ml-4 mb-0 title">Solution Management</p>
                <v-container fluid>
                  <v-row>
                    <v-col cols="12" v-if="hasSolutions">
                      <v-autocomplete
                        style="max-width: 452px;"
                        color="#2F2869"
                        item-avatar="userIcon"
                        autofocus
                        clearable
                        open-on-clear
                        hint="Buttons below are specific to the selected solution"
                        persistent-hint
                        dense
                        outlined
                        :allow-overflow="false"
                        ref="selectedSolution"
                        item-text="name"
                        item-value="name"
                        v-model="selectedSolution"
                        :menu-props="{ contentClass: 'select-options' }"
                        solo
                        :items="sortedSolutions"
                        return-object
                        no-data-text="No Solutions"
                        label="Select a Teneo Solution"
                        aria-label="Select a Teneo solution"
                        append-icon="mdi-chevron-double-down"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-tooltip open-delay="300" bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-fab-transition>
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
                          </v-fab-transition>
                        </template>
                        <span>Create a new solution config</span>
                      </v-tooltip>

                      <template v-if="selectedSolution">
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Make the selected solution the active solution"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                color="light-blue darken-1"
                                small
                                @click="setActiveSolution"
                              >
                                <v-icon dark>
                                  {{
                                  selectedSolution &&
                                  config.activeSolution ===
                                  selectedSolution.name
                                  ? "mdi-checkbox-marked"
                                  : "mdi-checkbox-blank-outline"
                                  }}
                                </v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Make the "{{ getSelectedSolutionName }}" the active
                            solution. An active solution can be accessed without
                            the deep link
                          </span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Edit the selected solution"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                color="pink darken-4"
                                @click="editSolution"
                              >
                                <v-icon dark>mdi-pencil</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>Edit solution | {{ getSelectedSolutionName }}</span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Clone the currently selected solution"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                @click="cloneSolution"
                                color="orange"
                              >
                                <v-icon dark>mdi-content-copy</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Clone solution |
                            {{ getSelectedSolutionName }}
                          </span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Delete the currently selected solution"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                @click="deleteSolutionConfig"
                                color="red"
                              >
                                <v-icon dark>mdi-trash-can</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Delete solution |
                            {{ getSelectedSolutionName }}
                          </span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Copy the selected solution configuration to the clipboard"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                color="indigo"
                                @click="copySolutionToClipboard"
                              >
                                <v-icon dark>mdi-clipboard-arrow-up-outline</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Copy config to clipboard |
                            {{ getSelectedSolutionName }}
                          </span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Download the selected solution's configuration as a file"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                color="teal darken-3"
                                @click="downloadSelectedSolutionConfig"
                              >
                                <v-icon dark>mdi-file-download</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Download config |
                            {{ getSelectedSolutionName }}
                          </span>
                        </v-tooltip>
                        <v-tooltip open-delay="300" bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-fab-transition>
                              <v-btn
                                aria-label="Generate sharable link for team members"
                                class="mr-2 mb-2"
                                v-bind="attrs"
                                v-on="on"
                                v-show="showSolutionButtons"
                                fab
                                dark
                                small
                                color="red darken-3"
                                @click="createShareLinkForSolution"
                              >
                                <v-icon dark>mdi-link-plus</v-icon>
                              </v-btn>
                            </v-fab-transition>
                          </template>
                          <span>
                            Generate sharable link for team members |
                            {{ getSelectedSolutionName }}
                          </span>
                        </v-tooltip>
                      </template>
                    </v-col>
                  </v-row>
                </v-container>
                <p class="ml-4 mb-0 title">Import / Export</p>
                <v-container fluid>
                  <!-- show the nicely formatted view of the full configuration -->
                  <v-tooltip open-delay="300" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        aria-label="Import new or additional solution configurations"
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
                    <span>
                      Import an individual/multiple solutions from a
                      backup
                    </span>
                  </v-tooltip>
                  <v-tooltip open-delay="300" bottom>
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
                    <span>
                      Copy the configuration for all solutions to
                      clipboard
                    </span>
                  </v-tooltip>
                  <v-tooltip open-delay="300" bottom>
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
                    <span>
                      Export the configuration for all solutions to a
                      file
                    </span>
                  </v-tooltip>
                  <v-tooltip open-delay="300" bottom>
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
                        <v-icon dark>
                          {{
                          displayFullSolutionConfig ? "mdi-eye" : "mdi-eye-off"
                          }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>
                      Toggle display of the configuration for all
                      solutions
                    </span>
                  </v-tooltip>
                  <v-tooltip open-delay="300" bottom>
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
                        <v-icon dark>mdi-comment-question</v-icon>
                      </v-btn>
                    </template>
                    <span>Help / Documentation</span>
                  </v-tooltip>
                </v-container>
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
                      <h3>Import Solution(s) Configurations</h3>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
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
                            <label for="uploadFile" class="v-btn primary upload-btn px-2 py-1 ml-2">
                              Browse
                              <v-icon small dark right>mdi-paperclip</v-icon>
                            </label>
                          </div>
                          <v-textarea
                            clearable
                            solo
                            outlined
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
                        small
                        @click="closeUploadDialog"
                      >Close</v-btn>
                      <v-btn
                        :disabled="getUploadConfig === ''"
                        small
                        class="mr-2"
                        color="green"
                        @click="saveUploadForm"
                      >
                        Import
                        <v-icon right dark>mdi-content-save-move</v-icon>
                      </v-btn>
                      <v-snackbar
                        v-if="uploadSnackbar"
                        absolute
                        color="#2F2869"
                        :timeout="globalSnackbarTimeout"
                        v-model="uploadSnackbar"
                      >{{ globalSnackbarMessage }}</v-snackbar>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#2F2869"
            dark
            small
            @click="$router.push('/')"
          >{{ $t("back.to.chat.button") }}</v-btn>
        </v-card-actions>
        <!-- global snackbar -->
        <v-snackbar
          absolute
          :timeout="globalSnackbarTimeout"
          v-model="globalSnackbar"
          :color="globalSnackbarColor"
        >{{ globalSnackbarMessage }}</v-snackbar>
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
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Config.vue");
import utils from "@/utils/utils";
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
      fullscreen: false,
      showSolutionButtons: true,
      refresh: false,
      snackbar: false,
      snackbarTimeout: 3000,
      globalSnackbarMessage: "",
      globalSnackbar: false,
      uploadSnackbar: false,
      globalSnackbarTimeout: 2000,
      globalSnackbarColor: "#2F2869",
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
  watch: {
    selectedSolution() {
      this.showSolutionButtons = false;
      setTimeout(() => {
        this.showSolutionButtons = true;
      }, 500);
    }
  },
  computed: {
    getSelectedSolutionName() {
      let solutionName = "None Selected";
      if (this.selectedSolution && this.selectedSolution.name) {
        solutionName = this.selectedSolution.name;
        logger.debug(`Current Solution Name`, solutionName);
      }
      return solutionName;
    },
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
      if (this.selectedSolution) {
        return `${location.protocol}//${location.host}${location.pathname}?dl=${this.selectedSolution.deepLink}`;
      } else {
        return `${location.protocol}//${location.host}${location.pathname}`;
      }
    },
    getActiveSolutionDeepLinkMobile() {
      sessionStorage.removeItem(STORAGE_KEY + "teneo-chat-history");
      if (this.selectedSolution) {
        return `${location.protocol}//${location.host}${location.pathname}mobile.html?dl=${this.selectedSolution.deepLink}`;
      } else {
        return `${location.protocol}//${location.host}${location.pathname}mobile.html`;
      }
    },
    getCurrentSelectedSolutionConfig() {
      const result = JSON.stringify(this.selectedSolution, null, 2);
      logger.debug(result);
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
    toggleFullscreen() {
      let modalElements = document.getElementsByClassName(
        "leopard-config-modal"
      );
      modalElements[0].setAttribute("style", "");
      this.fullscreen = !this.fullscreen;
    },
    fixSolution(solution) {
      if (!("animations" in solution)) {
        solution.animations = SOLUTION_DEFAULT.animations;
      }
      if (!("promptTriggers" in solution)) {
        solution.promptTriggers = SOLUTION_DEFAULT.promptTriggers;
      }
    },
    createShareLinkForSolution() {
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
        self.solution = utils.cloneObject(SOLUTION_DEFAULT);
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
        newSolution.deepLink =
          newSolution.deepLink + "-" + utils.generateRandomId();
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
        newSolution.deepLink =
          newSolution.deepLink + "-" + utils.generateRandomId();
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
    refreshBrowser() {
      if (this.selectedSolution) {
        this.refresh = true;
        sessionStorage.removeItem("teneo-chat-history"); // new config delete chat history
        let addtionalParams = "";
        if (utils.doesParameterExist("plugin_id")) {
          const params = new URLSearchParams(window.location.search);
          const pluginId = params.get("plugin_id");
          addtionalParams += `&plugin_id=${pluginId}`;
        }
        if (utils.doesParameterExist("embed")) {
          addtionalParams += "&embed";
        }
        if (utils.doesParameterExist("button")) {
          addtionalParams += "&button";
        }
        window.location = `${location.protocol}//${location.host}${location.pathname}?dl=${this.selectedSolution.deepLink}${addtionalParams}`;
      } else {
        window.location = `${location.protocol}//${location.host}${location.pathname}`;
      }
    },
    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
    },
    editSolution() {
      if (this.selectedSolution !== null) {
        this.dialogTitle = "Editing Solution";
        this.currentModeEdit = "edit";
        this.solution = utils.cloneObject(this.selectedSolution); // make a copy - we have a save button
        this.showAddEditDialog();
      }
    },
    setActiveSolution() {
      this.config.activeSolution = this.selectedSolution.name;
      this.saveToLocalStorage();
    },
    cloneSolution() {
      const newName = this.selectedSolution.name + " - Copy";
      let clonedSolution = utils.cloneObject(this.selectedSolution);
      clonedSolution.name = newName;
      const duplicateSolutions = this.config.solutions.filter(
        solution => solution.name === newName
      );
      if (duplicateSolutions.length > 0) {
        clonedSolution.name =
          clonedSolution.name + " [" + utils.generateRandomId() + "]";
      }
      clonedSolution.deepLink =
        clonedSolution.deepLink + "-" + utils.generateRandomId();
      this.config.solutions.push(clonedSolution);
      this.selectedSolution = utils.cloneObject(clonedSolution);
      this.displaySnackBar(
        "Solution was cloned. New name is " + clonedSolution.name,
        3000
      );
      this.saveToLocalStorage();
    },
    displayUploadSnackBar(message, timeout = 2000, color = "#2F2869") {
      this.uploadSnackbar = false;
      this.globalSnackbarMessage = message;
      this.uploadSnackbar = true;
      this.globalSnackbarTimeout = timeout;
      this.globalSnackbarColor = color;
    },
    displaySnackBar(message, timeout = 2000, color = "#2F2869") {
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
          this.selectedSolution = utils.cloneObject(this.config.solutions[0]);
        } else if (this.config.solutions.length > 1) {
          let self = this;
          this.selectedSolution = utils.cloneObject(
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
        this.displayUploadSnackBar(
          "Please provide a valid configuration",
          3000,
          "red"
        );
      }
    },
    addSolution() {
      this.dialogTitle = "Creating a new solution configuration";
      this.solution = utils.cloneObject(SOLUTION_DEFAULT);
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
    }
  }
};
</script>

<style>
.leopard-config-app-bar-fullscreen {
  -webkit-border-radius: 0 !important;
  -moz-border-radius: 0 !important;
  border-radius: 0 !important;
}
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
