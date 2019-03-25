<template>
  <v-layout>

    <v-dialog
      v-model="showModal"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar fixed>
          <v-flex>
            <v-btn
              icon
              dark
              @click="refreshBrowser"
              color="green"
              :loading="refresh"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
          </v-flex>
          <v-toolbar-title>Configuration</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip
            open-delay="600"
            bottom
          >
            <v-btn
              slot="activator"
              dark
              fab
              round
              small
              outline
              color="indigo"
              :href="getActiveSolutionDeepLinkMobile"
              target="_blank"
            >
              <v-icon dark>fa-mobile-alt</v-icon>
            </v-btn>
            <span>Deep Link Mobile</span>
          </v-tooltip>
          <v-tooltip
            open-delay="600"
            bottom
          >
            <v-btn
              slot="activator"
              fab
              dark
              round
              small
              outline
              color="indigo"
              :href="getActiveSolutionDeepLink"
              target="_blank"
            >
              <v-icon dark>fa-link</v-icon>
            </v-btn>
            <span>Deep Link Desktop</span>
          </v-tooltip>
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
            >fa-cogs</v-icon>
          </v-badge>
          <v-chip
            v-if="config.activeSolution"
            disabled
            color="green"
            text-color="white"
            class="mr-4"
          >
            <v-avatar class="green darken-4">
              <v-icon>check</v-icon>
            </v-avatar>
            {{ config.activeSolution }}
          </v-chip>
        </v-toolbar>

        <v-container class="mt-5 pt-5">
          <v-flex
            xs12
            md10
            offset-md1
          >

            <v-layout class="mb-2">

              <!-- global snackbar -->
              <v-snackbar
                :timeout="globalSnackbarTimeout"
                :value="globalSnackbar"
                :color="globalSnackbarColor"
              >
                {{ globalSnackbarMessage }}
              </v-snackbar>
              <v-container fluid>
                <v-layout
                  row
                  wrap
                >
                  <v-flex
                    xs12
                    sm12
                    md6
                    lg6
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
                      append-icon="fa-arrow-circle-down"
                    ></v-select>
                  </v-flex>
                  <v-flex
                    xs12
                    sm9
                    md8
                    lg6
                  >
                    <v-tooltip
                      open-delay="600"
                      bottom
                    >
                      <v-btn
                        slot="activator"
                        fab
                        dark
                        color="light-blue darken-1"
                        small
                        @click="setActiveSolution"
                        v-if="selectedSolution"
                      >
                        <v-icon dark>{{(selectedSolution && (config.activeSolution === selectedSolution.name)) ? "fa-check-square" : "fa-square"}}
                        </v-icon>
                      </v-btn>
                      <span>Active/Deactive</span>
                    </v-tooltip>
                    <span v-if="selectedSolution">
                      <v-tooltip
                        open-delay="600"
                        bottom
                      >
                        <v-btn
                          slot="activator"
                          fab
                          dark
                          small
                          color="pink darken-4"
                          @click="editSolution"
                        >
                          <v-icon dark>fa-cog</v-icon>
                        </v-btn>
                        <span>Edit</span>
                      </v-tooltip>
                      <v-tooltip
                        open-delay="600"
                        bottom
                      >
                        <v-btn
                          slot="activator"
                          fab
                          dark
                          small
                          @click="cloneSolution"
                          color="orange"
                        >
                          <v-icon dark>fa-clone</v-icon>
                        </v-btn>
                        <span>Clone</span>
                      </v-tooltip>
                      <v-tooltip
                        open-delay="600"
                        bottom
                      >
                        <v-btn
                          slot="activator"
                          fab
                          dark
                          small
                          @click="deleteSolutionConfig"
                          color="red"
                        >
                          <v-icon dark>fa-trash</v-icon>
                        </v-btn>
                        <span>Delete</span>
                      </v-tooltip>
                      <v-tooltip
                        open-delay="600"
                        bottom
                      >
                        <v-btn
                          slot="activator"
                          fab
                          dark
                          small
                          color="indigo"
                          @click="copySolutionToClipboard"
                        >
                          <v-icon dark>fa-clipboard</v-icon>
                        </v-btn>
                        <span>Copy selected solution config to clipboard</span>
                      </v-tooltip>
                      <v-tooltip
                        open-delay="600"
                        bottom
                      >
                        <v-btn
                          slot="activator"
                          fab
                          dark
                          small
                          color="teal darken-3"
                          @click="downloadSelectedSolutionConfig"
                        >
                          <v-icon dark>fa-download</v-icon>
                        </v-btn>
                        <span>Download selected solution's config as a file</span>
                      </v-tooltip>

                    </span>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-layout>

            <!-- show the nicely formatted view of the full configuration -->
            <v-tooltip
              open-delay="600"
              bottom
            >
              <v-btn
                slot="activator"
                fab
                dark
                small
                @click="addSolution"
                color="green"
              >
                <v-icon dark>add_circle</v-icon>
              </v-btn>
              <span>Create a new solution config</span>
            </v-tooltip>
            <v-tooltip
              open-delay="600"
              bottom
            >
              <v-btn
                slot="activator"
                fab
                dark
                small
                color="pink"
                @click="showUploadDialog"
              >
                <v-icon dark>cloud_upload</v-icon>
              </v-btn>
              <span>Upload an individual or full solution config</span>
            </v-tooltip>
            <v-tooltip
              open-delay="600"
              bottom
            >
              <v-btn
                slot="activator"
                fab
                dark
                small
                color="indigo"
                @click="copyWholeConfigClipboard"
              >
                <v-icon dark>fa-clipboard</v-icon>
              </v-btn>
              <span>Copy full solution config to clipboard</span>
            </v-tooltip>
            <v-tooltip
              open-delay="600"
              bottom
            >
              <v-btn
                slot="activator"
                fab
                dark
                small
                color="teal darken-3"
                @click="downloadSolutionConfig"
              >
                <v-icon dark>fa-download</v-icon>
              </v-btn>
              <span>Download all solutions configs as a file</span>
            </v-tooltip>
            <v-tooltip
              open-delay="600"
              bottom
            >
              <v-btn
                fab
                slot="activator"
                dark
                small
                color="brown darken-3"
                href="https://jolzee.gitbook.io/leopard/"
                target="_blank"
              >
                <v-icon dark>fa-question-circle</v-icon>
              </v-btn>
              <span>Help / Documentation</span>
            </v-tooltip>

            <prism language="json">{{ prettyPrintFullConfig }}</prism>

            <!-- upload new configuration -->
            <v-dialog
              v-model="uploadDialog"
              scrollable
              persistent
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

                  <v-layout row>
                    <v-flex xs12>
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
                          class="v-btn primary upload-btn"
                        >
                          Upload
                          <v-icon
                            dark
                            right
                          >publish</v-icon>
                        </label>
                      </div>
                      <v-textarea
                        v-model="getUploadConfig"
                        :loading="uploadTextAreaLoading"
                        ref="newConfig"
                        box
                        name="new-config"
                        label="Paste in full or partial configurations"
                        :value="getUploadConfig"
                        auto-grow
                        prepend-icon="fa-cog"
                        class="coding-font"
                      ></v-textarea>
                    </v-flex>
                  </v-layout>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue-grey lighten-5"
                    light
                    @click="closeUploadDialog"
                  >Close</v-btn>
                  <v-btn
                    color="green"
                    @click="saveUploadForm"
                  >Save
                    <v-icon
                      right
                      dark
                    >fa-save</v-icon>
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
                    <v-btn
                      color="light-blue darken-1"
                      href="https://fontawesome.com/icons?d=gallery&m=free"
                      target="_blank"
                    >Font Awesome
                    </v-btn>
                    <v-btn
                      color="light-blue darken-1"
                      href="https://material.io/tools/icons/?icon=supervised_user_circle&style=baseline"
                      target="_blank"
                    >Material
                    </v-btn>
                    <v-btn
                      color="light-blue darken-1"
                      href="https://htmlcolorcodes.com/color-names/"
                      target="_blank"
                    >HTML Color Names
                    </v-btn>

                    <v-container fluid>
                      <v-layout
                        row
                        wrap
                      >
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Solution Name</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            color="light-blue darken-1"
                            v-model.trim="solution.name"
                            validate-on-blur
                            :tabindex="getTabIndex"
                            label="Solution Name"
                            :rules="[ruleMustHaveValue]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Solution URL</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            color="light-blue darken-1"
                            v-model.trim="solution.url"
                            validate-on-blur
                            :tabindex="getTabIndex"
                            label="URL to Teneo Runtime - no parameters"
                            append-icon="link"
                            :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>IFRAME URL</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            color="light-blue darken-1"
                            v-model.trim="solution.iframeUrl"
                            validate-on-blur
                            :tabindex="getTabIndex"
                            label="Enter the IFRAME URL"
                            append-icon="link"
                            :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Chat Window Title</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            color="light-blue darken-1"
                            validate-on-blur
                            v-model.trim="solution.chatTitle"
                            :tabindex="getTabIndex"
                            label="Chat Window Title"
                            :rules="[ruleMustHaveValue]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Deep Link (?dl=[deep-link])
                          </v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            color="light-blue darken-1"
                            v-model.trim="solution.deepLink"
                            validate-on-blur
                            :tabindex="getTabIndex"
                            label="Deep links can be accessed with ?dl=<deep-link>"
                            :rules="[ruleMustHaveValue, ruleNoSpaces, ruleDeepLinkUnique]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Locale</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-select
                            :items="locales"
                            color="light-blue darken-1"
                            :menu-props="{contentClass:'select-options'}"
                            outline
                            :tabindex="getTabIndex"
                            v-model="solution.locale"
                            label="Specify Chat Locale"
                            append-icon="language"
                          ></v-select>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Response Icon</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            v-model.trim="solution.responseIcon"
                            validate-on-blur
                            color="light-blue darken-1"
                            :tabindex="getTabIndex"
                            label="Response Icon - Material Icons or FontAwesome (fa-)"
                            :append-icon="solution.responseIcon"
                            :rules="[ruleMustHaveValue]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>User Icon</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-text-field
                            v-model.trim="solution.userIcon"
                            validate-on-blur
                            color="light-blue darken-1"
                            :tabindex="getTabIndex"
                            label="User Icon - Material Icons or FontAwesome (fa-)"
                            :append-icon="solution.userIcon"
                            :rules="[ruleMustHaveValue]"
                          ></v-text-field>
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Enable Live Chat (livechat.inc)</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-select
                            :items="trueFalseOptions"
                            validate-on-blur
                            color="light-blue darken-1"
                            outline
                            hint="Enable Live Chat"
                            label="Enable Live Chat"
                            :menu-props="{contentClass:'select-options'}"
                            :tabindex="getTabIndex"
                            v-model="solution.enableLiveChat"
                            append-icon="contact_phone"
                          ></v-select>
                        </v-flex>
                        <v-divider></v-divider>
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>Float Chat Window</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-select
                            :items="trueFalseOptions"
                            validate-on-blur
                            color="light-blue darken-1"
                            outline
                            hint="Float Chat Window"
                            label="Float Chat Window"
                            :menu-props="{contentClass:'select-options'}"
                            :tabindex="getTabIndex"
                            v-model="solution.float"
                            append-icon="important_devices"
                          ></v-select>
                        </v-flex>

                        <v-divider></v-divider>
                        <v-flex
                          xs12
                          sm4
                        >
                          <v-subheader class="mb-2">Theme
                            <v-tooltip
                              open-delay="600"
                              bottom
                            >
                              <v-btn
                                slot="activator"
                                fab
                                dark
                                small
                                @click="resetColorsToDefault"
                                color="green"
                              >
                                <v-icon dark>fa-undo</v-icon>
                              </v-btn>
                              <span>Reset Colors to Default</span>
                            </v-tooltip>
                          </v-subheader>

                          <v-flex flex>
                            <v-layout
                              row
                              wrap
                            >
                              <v-flex d-flex>
                                <compact-picker
                                  v-model="colors"
                                  @input="updateColor"
                                  class="mb-3"
                                />
                              </v-flex>
                              <v-flex
                                xs12
                                d-flex
                              >
                                <v-chip
                                  @click="setActiveColor('primary')"
                                  :style="getBackGroundColor(solution.theme.primary)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  primary
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('secondary')"
                                  :style="getBackGroundColor(solution.theme.secondary)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  secondary
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('accent')"
                                  :style="getBackGroundColor(solution.theme.accent)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  accent
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('error')"
                                  :style="getBackGroundColor(solution.theme.error)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  erorr
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('info')"
                                  :style="getBackGroundColor(solution.theme.info)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  info
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('success')"
                                  :style="getBackGroundColor(solution.theme.success)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  success
                                </v-chip>
                              </v-flex>
                              <v-flex d-flex>
                                <v-chip
                                  @click="setActiveColor('warning')"
                                  :style="getBackGroundColor(solution.theme.warning)"
                                  text-color="white"
                                >
                                  <v-avatar>
                                    <v-icon>invert_colors</v-icon>
                                  </v-avatar>
                                  warning
                                </v-chip>
                              </v-flex>
                            </v-layout>
                          </v-flex>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-layout>
                            <v-flex d-flex>
                              <v-text-field
                                v-model.trim="solution.theme.primary"
                                @click="setActiveColor('primary')"
                                validate-on-blur
                                color="light-blue darken-1"
                                :v-text="solution.theme.primary"
                                :tabindex="getTabIndex"
                                label="primary"
                                :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                              ></v-text-field>
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
                            </v-flex>
                          </v-layout>

                          <v-layout>
                            <v-flex d-flex>
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
                            </v-flex>
                          </v-layout>

                          <v-layout>
                            <v-flex d-flex>
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
                            </v-flex>
                          </v-layout>
                          <v-text-field
                            v-model.trim="solution.theme.warning"
                            @click="setActiveColor('warning')"
                            validate-on-blur
                            color="light-blue darken-1"
                            :value="solution.theme.warning"
                            :tabindex="getTabIndex"
                            label="warning"
                            :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                          ></v-text-field>
                        </v-flex>
                        <v-divider></v-divider>
                        <!-- help -->
                        <v-flex
                          xs12
                          sm4
                        >
                          <v-btn
                            color="red"
                            class="white--text"
                            @click="addUserInput"
                          >
                            Help
                            <v-icon
                              right
                              dark
                            >add_circle</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <v-layout
                            v-for="(question, index) in solution.knowledgeData"
                            v-bind:key="index"
                            row
                            wrap
                          >
                            <v-flex xs11>
                              <v-text-field
                                v-model.trim="solution.knowledgeData[index]"
                                :value="question"
                                validate-on-blur
                                color="light-blue darken-1"
                                :tabindex="getTabIndex"
                                label="Example question"
                                append-icon="fa-question-circle"
                                :rules="[ruleMustHaveValue]"
                              ></v-text-field>
                            </v-flex>
                            <v-flex
                              xs1
                              class="pl-2 pt-3"
                            >
                              <!-- <v-btn @click="solution.knowledgeData.splice(index, 1)" fab dark small color="red"> -->
                              <v-icon
                                @click="solution.knowledgeData.splice(index, 1)"
                                color="red"
                                dark
                              >remove_circle</v-icon>
                              <!-- </v-btn> -->
                            </v-flex>
                          </v-layout>
                        </v-flex>
                        <v-divider></v-divider>
                        <!-- context parameters -->
                        <v-flex
                          xs12
                          sm4
                          class="hidden-xs-only"
                        >
                          <v-subheader>When to send CTX params</v-subheader>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
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
                        </v-flex>
                        <v-flex
                          xs12
                          sm4
                        >
                          <v-btn
                            color="red"
                            class="white--text"
                            @click="addContextParam"
                          >
                            CTX Param
                            <v-icon
                              right
                              dark
                            >add_circle</v-icon>
                          </v-btn>
                        </v-flex>
                        <v-flex
                          xs12
                          sm8
                        >
                          <!-- Itterate over all CTX parameters and their values -->
                          <v-layout
                            class="mb-3"
                            align-start
                            justify-start
                            v-for="(contextParam, index) in solution.contextParams"
                            v-bind:key="index"
                            row
                            wrap
                          >

                            <v-flex
                              xs10
                              sm11
                            >
                              <v-text-field
                                v-model.trim="contextParam.name"
                                validate-on-blur
                                color="light-blue darken-1"
                                :tabindex="getTabIndex"
                                label="Parameter Name"
                                append-icon="fa-key"
                                :rules="[ruleMustHaveValue]"
                              ></v-text-field>
                            </v-flex>
                            <v-flex
                              xs2
                              sm1
                            >
                              <v-tooltip top>
                                <v-icon
                                  slot="activator"
                                  @click="solution.contextParams.splice(index, 1)"
                                  color="red"
                                  dark
                                >remove_circle</v-icon>
                                <span>Remove CTX Parameter</span>
                              </v-tooltip>
                              <v-tooltip top>
                                <v-icon
                                  slot="activator"
                                  @click="addNewContextParameterValue(index)"
                                  color="green"
                                  dark
                                >fa-plus</v-icon>
                                <span>Add Parameter Value</span>
                              </v-tooltip>
                            </v-flex>

                            <!-- Show each ctx parameter value -->
                            <v-layout
                              align-space-around
                              justify-start
                              row
                              fluid
                              v-for="(value, valueIndex) in contextParam.values"
                              v-bind:key="valueIndex"
                            >
                              <v-flex class="elevation-5 pa-3 mb-2 mr-2">
                                <v-tooltip top>
                                  <v-icon
                                    slot="activator"
                                    @click="contextParam.values.splice(valueIndex, 1)"
                                    color="red"
                                    dark
                                  >remove_circle</v-icon>
                                  <span>Delete Parameter Value</span>
                                </v-tooltip>
                                <v-tooltip top>
                                  <v-icon
                                    slot="activator"
                                    @click="toggleActiveContextParameterValue(value.active, index, valueIndex)"
                                    :color="value.active ? 'green' : 'blue-grey lighten-4'"
                                    dark
                                  >{{ value.active ? 'fa-check-square': 'fa-square' }}</v-icon>
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
                              </v-flex>
                            </v-layout>
                          </v-layout>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue-grey lighten-5"
                    light
                    @click="closeAddNewSolutionDialog"
                  >Close</v-btn>
                  <v-btn
                    color="green"
                    @click="saveForm"
                  >Save
                    <v-icon
                      right
                      dark
                    >fa-save</v-icon>
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
          </v-flex>
        </v-container>
      </v-card>
    </v-dialog>
    <textarea
      id="copy-solution"
      readonly
      style="position:absolute;left:-9999px"
      v-text="getCurrentSelectedSolutionConfig"
    ></textarea>
    <textarea
      id="copy-whole-config"
      readonly
      style="position:absolute;left:-9999px"
      v-text="getFullSolutionConfig"
    ></textarea>
  </v-layout>
</template>

<script>
import { Compact } from "vue-color";
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
    "compact-picker": Compact,
    Prism
  },
  data() {
    return {
      refresh: false,
      snackbar: false,
      colors: "#D60270",
      snackbarTimeout: 3000,
      globalSnackbarMessage: "",
      globalSnackbar: false,
      globalSnackbarTimeout: 2000,
      globalSnackbarColor: "",
      uploadTextAreaLoading: false,
      showProgressUpload: false,
      activeColor: "",
      trueFalseOptions: ["true", "false"],
      locales: ["en", "fr", "es", "nl", "de"],
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
      return `${location.protocol}//${location.host}${location.pathname}?dl=${
        this.selectedSolution.deepLink
      }`;
    },
    getActiveSolutionDeepLinkMobile() {
      sessionStorage.removeItem(STORAGE_KEY + "teneo-chat-history");
      return `${location.protocol}//${location.host}${
        location.pathname
      }mobile.html?dl=${this.selectedSolution.deepLink}`;
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
    resetColorsToDefault() {
      this.solution.theme = Object.assign({}, SOLUTION_DEFAULT.theme);
    },
    setActiveColor(activeTheme) {
      this.activeColor = activeTheme;
      console.log(this.activeColor);
    },
    updateColor() {
      if (this.activeColor) {
        this.solution.theme[this.activeColor] = this.colors.hex;
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
        `leopard-all-config-${this.$dayjs().format("YYYYMMDD[-]H[-]mm")}.txt`
      );
    },
    downloadSelectedSolutionConfig() {
      this.download(
        JSON.stringify(this.selectedSolution, null, 2),
        `leopard-${this.selectedSolution.name
          .replace(/[|&;$%@"<>()+,]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()}-config-${this.$dayjs().format(
          "YYYYMMDD[-]H[-]mm"
        )}.txt`
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
      let el = document.getElementById("copy-whole-config");
      el.select();
      document.execCommand("copy");
      this.displaySnackBar("📋 Copied to clipboard");
      this.snackbarClipboard = true;
    },
    copySolutionToClipboard() {
      let el = document.getElementById("copy-solution");
      el.select();
      document.execCommand("copy");
      this.displaySnackBar("📋 Copied to clipboard");
    },
    setActiveSolutionAsSelected() {
      this.selectedSolution = this.config.solutions.find(
        solution => solution.name === this.config.activeSolution
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
    refreshBrowser() {
      this.refresh = true;
      sessionStorage.removeItem("teneo-chat-history"); // new config delete chat history
      window.location = `${location.protocol}//${location.host}${
        location.pathname
      }`;
      // window.location.reload(false);
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
      clonedSolution.deepLink = clonedSolution.deepLink + this.randId();
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
          this.config = newConfig;
          this.displaySnackBar("Imported a new full configuration", 3000);
        } else if (newConfig && "name" in newConfig) {
          // uploading a single config - add it to the current solution config
          let existingSolution = this.config.solutions.findIndex(
            solution => solution.name === newConfig.name
          );
          if (existingSolution < 0) {
            this.config.solutions.push(newConfig);
          } else {
            // there's another solution with the same name. Import this new config but make the name unique and the deep link
            newConfig.name = newConfig.name + " [imported]";
            newConfig.deepLink = newConfig.deepLink + this.randId();
            this.config.solutions.push(newConfig);
          }
          this.displaySnackBar("Imported as " + newConfig.name, 3000);
        }
        this.setActiveSolutionAsSelected();
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
        const resultIndex = COLOR_NAMES.findIndex(
          item => color.toLowerCase() === item.toLowerCase()
        );
        return resultIndex !== -1;
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
