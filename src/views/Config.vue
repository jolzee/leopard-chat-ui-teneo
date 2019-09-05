<template>
  <v-dialog
    v-model="showModal"
    fullscreen
    full-width
    hide-overlay
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
              color="green"
              :loading="refresh"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-tooltip
              open-delay="600"
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  class="mr-2"
                  v-on="on"
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
              <template v-slot:activator="{ on }">
                <v-btn
                  class="mr-2"
                  v-on="on"
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
          color="blue"
          class="mr-2"
        >
          <span slot="badge">{{config.solutions.length}}</span>
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
                              label="Select Teneo Solution"
                              append-icon="mdi-chevron-double-down"
                            ></v-select>
                          </v-col>
                          <v-col
                            class="ma2"
                            cols="12"
                          >
                            <v-tooltip
                              open-delay="600"
                              bottom
                            >
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  class="mr-2"
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
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  class="mr-2"
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
                            <span v-if="selectedSolution">
                              <v-tooltip
                                open-delay="600"
                                bottom
                              >
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    class="mr-2"
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
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    class="mr-2"
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
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    class="mr-2"
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
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    class="mr-2"
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
                                <template v-slot:activator="{ on }">
                                  <v-btn
                                    class="mr-2"
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
                            </span>
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
                        <template v-slot:activator="{ on }">
                          <v-btn
                            class="mr-2"
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
                        <template v-slot:activator="{ on }">
                          <v-btn
                            class="mr-2"
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
                        <template v-slot:activator="{ on }">
                          <v-btn
                            class="mr-2"
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
                        <template v-slot:activator="{ on }">
                          <v-btn
                            class="mr-2"
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
                        <template v-slot:activator="{ on }">
                          <v-btn
                            class="mr-2"
                            fab
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
          <v-row class="mb-2">

            <!-- global snackbar -->
            <v-snackbar
              :timeout="globalSnackbarTimeout"
              :value="globalSnackbar"
              :color="globalSnackbarColor"
            >
              {{ globalSnackbarMessage }}
            </v-snackbar>

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

          <!-- Add Edit Dialog -->
          <v-dialog
            v-model="displayAddEditDialog"
            scrollable
            persistent
            light
            max-width="calc(1200px - 10vw)"
          >
            <v-card>
              <v-card-title>
                <h3>{{ dialogTitle }}</h3>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text
                style="height: 90vh"
                id="add-edit"
              >
                <v-form ref="form">
                  <div class="d-none d-sm-inline-block">
                    <v-btn
                      class="mr-2 mt-2"
                      color="light-blue darken-1"
                      href="https://materialdesignicons.com/"
                      target="_blank"
                    >MDI Icons (mdi-icon-name)
                    </v-btn>
                  </div>

                  <v-container fluid>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Solution Name</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-text-field
                          color="light-blue darken-1"
                          v-model.trim="solution.name"
                          validate-on-blur
                          :tabindex="getTabIndex"
                          label="Solution Name"
                          :rules="[ruleMustHaveValue]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Solution URL</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-text-field
                          color="light-blue darken-1"
                          v-model.trim="solution.url"
                          validate-on-blur
                          :tabindex="getTabIndex"
                          label="URL to Teneo Runtime - no parameters"
                          append-icon="mdi-link-variant"
                          :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>IFRAME URL</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-text-field
                          color="light-blue darken-1"
                          v-model.trim="solution.iframeUrl"
                          validate-on-blur
                          :tabindex="getTabIndex"
                          label="Enter the IFRAME URL"
                          append-icon="mdi-link-variant"
                          :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Chat Window Title</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-text-field
                          color="light-blue darken-1"
                          validate-on-blur
                          v-model.trim="solution.chatTitle"
                          :tabindex="getTabIndex"
                          label="Chat Window Title"
                          :rules="[ruleMustHaveValue]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Deep Link (?dl=[deep-link])
                        </v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-text-field
                          color="light-blue darken-1"
                          v-model.trim="solution.deepLink"
                          validate-on-blur
                          :tabindex="getTabIndex"
                          label="Deep links can be accessed with ?dl=<deep-link>"
                          :rules="[ruleMustHaveValue, ruleNoSpaces, ruleDeepLinkUnique]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Locale</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="locales"
                          color="light-blue darken-1"
                          :menu-props="{contentClass:'select-options'}"
                          outlined
                          :tabindex="getTabIndex"
                          v-model="solution.locale"
                          label="Specify Chat Locale"
                          append-icon="mdi-translate"
                        ></v-select>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Response Icon</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                        class="pb-0"
                      >
                        <v-text-field
                          v-model.trim="solution.responseIcon"
                          validate-on-blur
                          color="light-blue darken-1"
                          :tabindex="getTabIndex"
                          label="Response Icon - MDI Icons (mdi-icon-name)"
                          :append-icon="solution.responseIcon"
                          :rules="[ruleMustHaveValue]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                        class="py-0"
                      >

                        <v-btn
                          v-for="(icon, index) in chatIcons"
                          :key="index + 'icons'"
                          @click="solution.responseIcon = icon"
                          text
                          icon
                          color="indigo"
                        >
                          <v-icon>{{icon}}</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>User Icon</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                        class="pb-0"
                      >
                        <v-text-field
                          v-model.trim="solution.userIcon"
                          validate-on-blur
                          color="light-blue darken-1"
                          :tabindex="getTabIndex"
                          label="User Icon - MDI Icons (mdi-icon-name)"
                          :append-icon="solution.userIcon"
                          :rules="[ruleMustHaveValue]"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                        class="py-0"
                      >

                        <v-btn
                          v-for="(icon, index) in chatIcons"
                          :key="index + 'icons'"
                          @click="solution.userIcon = icon"
                          text
                          icon
                          color="indigo"
                        >
                          <v-icon>{{icon}}</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Enable Live Chat (livechat.inc)</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Enable Live Chat"
                          label="Enable Live Chat"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.enableLiveChat"
                          append-icon="mdi-face-agent"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Float Chat Window</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Float Chat Window"
                          label="Float Chat Window"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.float"
                          append-icon="mdi-stretch-to-page-outline"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Show Pulsing Chat Button</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Show Pulse Button"
                          label="Show Pulse Button"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.pulseButton"
                          append-icon="mdi-pulse"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Show Long Teneo Responses in Modal</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Show Long Response in Modal"
                          label="Show Long Response in Modal"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.longResponsesInModal"
                          append-icon="mdi-arrange-bring-forward"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Show Chat Icons</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Show Chat Icons"
                          label="Show Chat Icons"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.showChatIcons"
                          append-icon="mdi-eye-off"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Show Accent in Chat UI</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-select
                          :items="trueFalseOptions"
                          validate-on-blur
                          color="light-blue darken-1"
                          outlined
                          hint="Show Accent"
                          label="Show Accent"
                          :menu-props="{contentClass:'select-options'}"
                          :tabindex="getTabIndex"
                          v-model="solution.displayAccent"
                          append-icon="mdi-border-top-variant"
                        ></v-select>
                      </v-col>
                      <v-divider></v-divider>
                      <v-col
                        cols="12"
                        sm="4"
                      >
                        <v-subheader class="mb-2">Theme
                          <v-tooltip
                            open-delay="600"
                            bottom
                          >
                            <template v-slot:activator="{ on }">
                              <v-btn
                                class="mx-2"
                                v-on="on"
                                icon
                                dark
                                small
                                @click="resetColorsToDefault"
                                color="green"
                              >
                                <v-icon dark>mdi-undo-variant</v-icon>
                              </v-btn>
                            </template>
                            <span>Reset Colors to Default</span>
                          </v-tooltip>
                        </v-subheader>

                        <v-col class="flex">
                          <v-row no-gutters>
                            <v-col
                              cols="12"
                              class="pt-0"
                            >
                              <v-color-picker
                                class="pt-0 mt-0"
                                :hide-canvas="false"
                                :hide-inputs="true"
                                :hide-mode-switch="true"
                                :show-swatches="true"
                                swatches-max-height="120"
                                v-model="color"
                                @input="updateColor"
                              ></v-color-picker>
                            </v-col>

                          </v-row>
                        </v-col>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-row>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('primary')"
                                :color="solution.theme.primary"
                              >
                                <v-icon v-if="activeColor === 'primary'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.primary"
                                @click="setActiveColor('primary')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.primary"
                                :tabindex="getTabIndex"
                                label="primary"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>

                            </v-row>

                          </v-col>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('secondary')"
                                :color="solution.theme.secondary"
                              >
                                <v-icon v-if="activeColor === 'secondary'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.secondary"
                                @click="setActiveColor('secondary')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.secondary"
                                :tabindex="getTabIndex"
                                label="secondary"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('accent')"
                                :color="solution.theme.accent"
                              >
                                <v-icon v-if="activeColor === 'accent'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.accent"
                                @click="setActiveColor('accent')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.accent"
                                :tabindex="getTabIndex"
                                label="accent"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('error')"
                                :color="solution.theme.error"
                              >
                                <v-icon v-if="activeColor === 'error'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.error"
                                @click="setActiveColor('error')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.error"
                                :tabindex="getTabIndex"
                                label="error"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('info')"
                                :color="solution.theme.info"
                              >
                                <v-icon v-if="activeColor === 'info'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.info"
                                @click="setActiveColor('info')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.info"
                                :tabindex="getTabIndex"
                                label="info"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                          <v-col cols="6">
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('success')"
                                :color="solution.theme.success"
                              >
                                <v-icon v-if="activeColor === 'success'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.success"
                                @click="setActiveColor('success')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :value="solution.theme.success"
                                :tabindex="getTabIndex"
                                label="success"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-row>
                              <v-btn
                                class="mx-2"
                                fab
                                dark
                                small
                                elevation="2"
                                @click="setActiveColor('warning')"
                                :color="solution.theme.warning"
                              >
                                <v-icon v-if="activeColor === 'warning'">mdi-star</v-icon>
                              </v-btn>
                              <v-text-field
                                v-model.trim="solution.theme.warning"
                                @click="setActiveColor('warning')"
                                validate-on-blur
                                :value="solution.theme.warning"
                                :tabindex="getTabIndex"
                                label="warning"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
                            </v-row>
                          </v-col>
                        </v-row>

                      </v-col>
                      <v-divider></v-divider>
                      <!-- ASR Corrections -->
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>Button and Toolbar Custom CSS</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-textarea
                          outlined
                          color="light-blue darken-1"
                          name="input-7-4"
                          :tabindex="getTabIndex"
                          label="Custom CSS"
                          v-model.trim="solution.customCssButtonToolbar"
                        ></v-textarea>
                      </v-col>
                      <v-divider></v-divider>
                      <!-- ASR Corrections -->
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>ASR Corrections</v-subheader>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-textarea
                          outlined
                          color="light-blue darken-1"
                          name="input-7-4"
                          :tabindex="getTabIndex"
                          label="ASR Corrections"
                          v-model.trim="solution.asrCorrections"
                        ></v-textarea>
                      </v-col>
                      <!-- help -->
                      <v-col
                        cols="12"
                        sm="4"
                      >
                        <v-btn
                          color="red"
                          class="white--text mr-2"
                          @click="addUserInput"
                        >
                          Help
                          <v-icon
                            right
                            dark
                          >mdi-plus-circle</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-row
                          v-for="(question, index) in solution.knowledgeData"
                          v-bind:key="index"
                        >
                          <v-col cols="11">
                            <v-text-field
                              v-model.trim="solution.knowledgeData[index]"
                              :value="question"
                              validate-on-blur
                              color="light-blue darken-1"
                              :tabindex="getTabIndex"
                              label="Example question"
                              append-icon="mdi-android-messages"
                              :rules="[ruleMustHaveValue]"
                            ></v-text-field>
                          </v-col>
                          <v-col
                            cols="1"
                            class="pl-2 pt-3"
                          >
                            <!-- <v-btn class="mr-2" @click="solution.knowledgeData.splice(index, 1)" fab dark small color="red"> -->
                            <v-icon
                              @click="solution.knowledgeData.splice(index, 1)"
                              color="red"
                              dark
                            >mdi-minus-circle</v-icon>
                            <!-- </v-btn> -->
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-divider></v-divider>
                      <!-- context parameters -->
                      <v-col
                        cols="12"
                        sm="4"
                        class="hidden-xs-only"
                      >
                        <v-subheader>When to send CTX params</v-subheader>
                      </v-col>

                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <v-radio-group
                          :tabindex="getTabIndex"
                          label="When to send CTX params"
                          v-model="solution.sendContextParams"
                          mandatory
                        >
                          <v-radio
                            label="At login"
                            value="login"
                          ></v-radio>
                          <v-radio
                            label="All requests"
                            value="all"
                          ></v-radio>
                        </v-radio-group>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="4"
                      >
                        <v-btn
                          color="red"
                          class="white--text mr-2"
                          @click="addContextParam"
                        >
                          CTX Param
                          <v-icon
                            right
                            dark
                          >mdi-plus-circle</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col
                        cols="12"
                        sm="8"
                      >
                        <!-- Itterate over all CTX parameters and their values -->
                        <v-row
                          class="mb-4 grey lighten-5 pa-2 elevation-2"
                          align="start"
                          justify="start"
                          v-for="(contextParam, index) in solution.contextParams"
                          v-bind:key="index"
                        >

                          <v-col
                            cols="10"
                            sm="11"
                          >
                            <v-text-field
                              v-model.trim="contextParam.name"
                              validate-on-blur
                              color="light-blue darken-1"
                              :tabindex="getTabIndex"
                              label="Parameter Name"
                              append-icon="mdi-key-variant"
                              :rules="[ruleMustHaveValue]"
                            ></v-text-field>
                          </v-col>
                          <v-col
                            cols="2"
                            sm="1"
                          >
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-icon
                                  v-on="on"
                                  @click="solution.contextParams.splice(index, 1)"
                                  color="red"
                                  dark
                                >mdi-minus-circle</v-icon>
                              </template>
                              <span>Remove CTX Parameter</span>
                            </v-tooltip>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-icon
                                  v-on="on"
                                  @click="addNewContextParameterValue(index)"
                                  color="green"
                                  dark
                                >mdi-plus-circle</v-icon>
                              </template>
                              <span>Add Parameter Value</span>
                            </v-tooltip>
                          </v-col>

                          <!-- Show each ctx parameter value -->
                          <v-row
                            v-for="(value, valueIndex) in contextParam.values"
                            v-bind:key="valueIndex"
                            no-gutters
                          >
                            <v-col class="elevation-2 pa-3 mb-2 mr-2 white">
                              <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                  <v-icon
                                    v-on="on"
                                    @click="contextParam.values.splice(valueIndex, 1)"
                                    color="red"
                                    dark
                                  >mdi-minus-circle</v-icon>
                                </template>
                                <span>Delete Parameter Value</span>
                              </v-tooltip>
                              <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                  <v-icon
                                    v-on="on"
                                    @click="toggleActiveContextParameterValue(value.active, index, valueIndex)"
                                    :color="value.active ? 'green' : 'blue-grey lighten-4'"
                                    dark
                                  >{{ value.active ? 'mdi-checkbox-marked': 'mdi-checkbox-blank-outline' }}</v-icon>
                                </template>
                                <span>Enable/Disable</span>
                              </v-tooltip>
                              <!-- show input box for context parameter value -->
                              <v-text-field
                                v-model.trim="value.text"
                                validate-on-blur
                                color="light-blue darken-1"
                                label="Parameter Value"
                                :tabindex="getTabIndex"
                                :rules="[ruleMustHaveValue]"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  class="mr-2"
                  color="blue-grey lighten-5"
                  light
                  @click="closeAddNewSolutionDialog"
                >Close</v-btn>
                <v-btn
                  class="mr-2"
                  color="green"
                  @click="saveForm"
                >Save
                  <v-icon
                    right
                    dark
                  >mdi-content-save</v-icon>
                </v-btn>
                <v-snackbar
                  :timeout="snackbarTimeout"
                  v-model="snackbar"
                  class="mb-5"
                >
                  🧟‍ Please fix all form validation errors.
                </v-snackbar>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import dayjs from "dayjs";
import copy from "copy-to-clipboard";
import urlRegex from "url-regex";
import { COLOR_NAMES } from "../constants/color-names.js";
import {
  STORAGE_KEY,
  SOLUTION_DEFAULT
} from "../constants/solution-config-default.js";
import "prismjs/prism";
import "prismjs/themes/prism-funky.css";
import "prismjs/components/prism-json.min.js";
import Prism from "vue-prism-component";

export default {
  components: {
    Prism
  },
  data() {
    return {
      refresh: false,
      snackbar: false,
      color: "#D60270",
      snackbarTimeout: 3000,
      globalSnackbarMessage: "",
      globalSnackbar: false,
      globalSnackbarTimeout: 2000,
      globalSnackbarColor: "",
      uploadTextAreaLoading: false,
      displayFullSolutionConfig: false,
      showProgressUpload: false,
      activeColor: "",
      trueFalseOptions: ["true", "false"],
      locales: [
        "en-us-male",
        "en-us-female",
        "en-uk-male",
        "en-uk-female",
        "fr",
        "es",
        "nl",
        "de",
        "ru",
        "sv",
        "no",
        "da",
        "jp",
        "cn",
        "cn(hk)",
        "id"
      ],
      chatIcons: [
        "mdi-message-text",
        "mdi-message-outline",
        "mdi-message",
        "mdi-chat-outline",
        "mdi-chat",
        "mdi-message-reply",
        "mdi-message-reply-text",
        "mdi-android-messages",
        "mdi-account",
        "mdi-account-arrow-right",
        "mdi-account-arrow-left",
        "mdi-account-box",
        "mdi-account-circle",
        "mdi-account-supervisor-circle",
        "mdi-account-tie",
        "mdi-comment-account",
        "mdi-tooltip-account",
        "mdi-face",
        "mdi-face-profile",
        "mdi-face-profile-woman",
        "mdi-face-woman",
        "mdi-emoticon-outline",
        "mdi-comment-arrow-left",
        "mdi-comment-arrow-right",
        "mdi-cowboy",
        "mdi-cow",
        "mdi-doctor",
        "mdi-human-greeting",
        "mdi-pirate",
        "mdi-robot"
      ],
      displayAddEditDialog: false,
      currentModeEdit: "",
      dialogTitle: "",
      showModal: true,
      saveLoading: false,
      uploadDialog: false,
      uploadConfig: "",
      selectedSolution: null,
      solution: {},
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
        console.log(`New Value is: ${newValue}`);
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
    this.solution = Object.assign({}, SOLUTION_DEFAULT);
    this.setActiveSolutionAsSelected();
  },
  methods: {
    toggleDisplayOfSolutionConfig() {
      this.displayFullSolutionConfig = !this.displayFullSolutionConfig;
    },
    importSolution(newSolution) {
      let existingSolutionsWithName = this.config.solutions.findIndex(
        solution => solution.name === newSolution.name
      );
      let existingSolutionsWithDeepLink = this.config.solutions.findIndex(
        solution => solution.deepLink === newSolution.deepLink
      );

      if (existingSolutionsWithName < 0 && existingSolutionsWithDeepLink < 0) {
        // no clashes in name or deep link
        this.config.solutions.push(newSolution); // no conflicts
        console.log("no clashes");
      } else if (
        existingSolutionsWithName >= 0 &&
        existingSolutionsWithDeepLink >= 0
      ) {
        // name and deep link clash
        console.log("name and deep link clash");
        newSolution.name = newSolution.name + " [imported]";
        newSolution.deepLink = newSolution.deepLink + "-" + this.randId();
        this.config.solutions.push(newSolution);
      } else if (
        existingSolutionsWithName >= 0 &&
        existingSolutionsWithDeepLink < 0
      ) {
        // name clash only
        console.log("name clash only");
        newSolution.name = newSolution.name + " [imported]";
        this.config.solutions.push(newSolution);
      } else if (
        existingSolutionsWithDeepLink >= 0 &&
        existingSolutionsWithName < 0
      ) {
        // deeplink clash only
        console.log("deep link clash only");
        newSolution.deepLink = newSolution.deepLink + "-" + this.randId();
        this.config.solutions.push(newSolution);
      }
    },
    resetColorsToDefault() {
      this.solution.theme = Object.assign({}, SOLUTION_DEFAULT.theme);
    },
    setActiveColor(activeTheme) {
      this.activeColor = activeTheme;
      this.color = this.solution.theme[activeTheme];
      console.log(this.activeColor);
    },
    updateColor() {
      if (this.activeColor) {
        this.solution.theme[this.activeColor] = this.color;
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
      this.displaySnackBar("📋 Copied to clipboard");
      this.snackbarClipboard = true;
    },
    copySolutionToClipboard() {
      copy(JSON.stringify(this.selectedSolution, null, 2));
      this.displaySnackBar("📋 Copied to clipboard");
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
    failsValidation() {
      // console.log(this.$refs.form);
      if (!this.$refs.form.validate()) {
        this.snackbar = true;
        return true;
      }
      return false;
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
    displaySnackBar(message, timeout = 2000, color = "") {
      this.globalSnackbarMessage = message;
      this.globalSnackbar = true;
      this.globalSnackbarTimeout = timeout;
      this.globalSnackbarColor = color;
    },
    saveForm() {
      if (this.failsValidation()) {
        return;
      }
      if (this.currentModeEdit === "edit") {
        for (let index = 0; index < this.config.solutions.length; index++) {
          if (
            JSON.stringify(this.config.solutions[index]) ===
            JSON.stringify(this.selectedSolution)
          ) {
            if (this.config.activeSolution === this.selectedSolution.name) {
              this.config.activeSolution = this.solution.name;
            }
            this.config.solutions.splice(
              index,
              1,
              this.cloneObject(this.solution)
            );

            this.currentModeEdit = "";
            this.selectedSolution = this.cloneObject(this.solution);
            break;
          }
        }
        // adding a new solution config
      } else {
        // console.log("About to add a new solution");
        this.config.solutions.push(this.cloneObject(this.solution));
        this.selectedSolution = this.cloneObject(this.solution);
        if (this.config.solutions.length === 1) {
          // first one added. Make it active
          this.config.activeSolution = this.solution.name;
        }
      }
      this.closeAddNewSolutionDialog();
      this.saveToLocalStorage();
    },
    ruleDeepLinkUnique(value) {
      if (!this.currentModeEdit) {
        // adding a new solution
        const foundSolutions = this.config.solutions.filter(
          solution => solution.deepLink === value
        );
        if (foundSolutions && foundSolutions.length > 0) {
          return "That deep link is already taken";
        } else {
          return true;
        }
      } else {
        // editing and existing solution config
        // console.log("Editing solution: checking deep link validity");
        const foundSolution = this.config.solutions.find(
          solution => solution.deepLink === value
        );
        // console.log(foundSolution);
        if (
          foundSolution &&
          foundSolution.name !== this.selectedSolution.name
        ) {
          return "That deep link is already taken!!";
        } else {
          return true;
        }
      }
    },
    ruleMustBeUrl(value) {
      if (
        urlRegex({
          strict: true
        }).test(value)
      ) {
        return true;
      }
      return "Please provide a well-formed URL";
    },
    ruleNoSpaces(value) {
      if (value && value.indexOf(" ") > -1) {
        return "no spaces allowed";
      } else {
        return true;
      }
    },
    ruleMustHaveColor(color) {
      if (this.isValidColor(color)) {
        return true;
      } else {
        return "Must be HEX #8A2BE2 or named html name color";
      }
    },
    ruleMustHaveValue(value) {
      // console.log(value);
      if (/\S/.test(value)) {
        return true;
      }
      return "You must provide a value";
    },
    isValidColor(color) {
      if (color && color.charAt(0) === "#") {
        color = color.substring(1);
        return (
          [3, 4, 6, 8].indexOf(color.length) > -1 && !isNaN(parseInt(color, 16))
        );
      } else if (color) {
        if (color.toLowerCase() in COLOR_NAMES) {
          return true;
        } else {
          return false;
        }
      }
    },
    getTabIndex() {
      this.taxIndexCount = this.taxIndexCount + 1;
      return this.taxIndexCount;
    },
    addNewContextParameterValue(index) {
      this.solution.contextParams[index].values.push({
        text: "",
        active: false
      });
    },
    toggleActiveContextParameterValue(active, index, valueIndex) {
      if (active) {
        this.solution.contextParams[index].values[valueIndex].active = false;
      } else {
        this.solution.contextParams[index].values.forEach(function(value) {
          if (value.active) {
            value.active = false;
          }
        });

        this.solution.contextParams[index].values[valueIndex].active = true;
      }
    },
    addContextParam() {
      this.solution.contextParams.push({
        name: "",
        values: [
          {
            text: "",
            active: false
          }
        ]
      });
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
      // you have to wait just a bit for the scroll to work
      setTimeout(function() {
        document.getElementById("add-edit").scrollTop = 0;
      }, 100);
    },
    showUploadDialog() {
      this.uploadDialog = true;
    },
    closeAddNewSolutionDialog() {
      this.displayAddEditDialog = false;
      this.$refs.form.reset();
      const self = this;
      setTimeout(function() {
        self.solution = self.cloneObject(SOLUTION_DEFAULT);
      }, 1000);
    },
    addUserInput() {
      this.solution.knowledgeData.push("");
    },
    getBackGroundColor(color) {
      return "background-color:" + color;
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
