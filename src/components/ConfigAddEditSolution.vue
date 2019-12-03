<template>
  <v-dialog
    v-model="showDialog"
    scrollable
    :persistent="true"
    max-width="calc(1200px - 10vw)"
    no-click-animation
    :fullscreen="
      $vuetify.breakpoint.xs || $vuetify.breakpoint.sm || $vuetify.breakpoint.md
    "
  >
    <v-card>
      <v-card-title>
        <h3>{{ dialogTitle }}</h3>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text
        style="height: 90vh"
        id="add-edit"
        class="teneo-hide-scroll-x"
      >
        <v-form ref="form">
          <div class="d-none d-sm-inline-block">
            <v-btn
              aria-label="Open Marterial Design Icons in a new window"
              class="mr-2 mt-2"
              color="light-blue darken-1"
              href="https://materialdesignicons.com/"
              target="_blank"
              >MDI Icons (mdi-icon-name)
            </v-btn>
          </div>

          <v-container fluid>
            <v-row>
              <v-col :cols="12" :sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Solution Name</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-text-field
                  color="light-blue darken-1"
                  v-model.trim="solution.name"
                  validate-on-blur
                  label="Solution Name"
                  :rules="[ruleMustHaveValue]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Solution URL</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-text-field
                  color="light-blue darken-1"
                  v-model.trim="solution.url"
                  validate-on-blur
                  label="URL to Teneo Runtime - no parameters"
                  append-icon="mdi-link-variant"
                  :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>IFRAME URL</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-switch
                  v-model="solution.useInProduction"
                  label="Use in production"
                ></v-switch>
                <v-text-field
                  v-if="
                    ('useInProduction' in solution &&
                      !solution.useInProduction) ||
                      !('useInProduction' in solution)
                  "
                  color="light-blue darken-1"
                  v-model.trim="solution.iframeUrl"
                  validate-on-blur
                  label="Enter the IFRAME URL"
                  append-icon="mdi-link-variant"
                  :rules="[ruleMustHaveValue, ruleMustBeUrl]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Prompt Triggers</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-switch
                  v-model="solution.promptTriggers.enabled"
                  label="Poll for Prompt Triggers"
                ></v-switch>
                <v-alert
                  border="top"
                  colored-border
                  type="info"
                  elevation="2"
                  v-if="solution.promptTriggers.enabled"
                >
                  You must return the number of active flows from Teneo in each
                  response.
                  <a
                    target="_blank"
                    href="https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling"
                    >Leopard Documentation</a
                  >
                </v-alert>
                <v-text-field
                  v-if="solution.promptTriggers.enabled"
                  color="light-blue darken-1"
                  v-model.trim="solution.promptTriggers.pollSeconds"
                  validate-on-blur
                  label="How often should Leopard poll in seconds?"
                  append-icon="mdi-repeat"
                  :rules="[ruleMustHaveValue, ruleMustBeInteger]"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Chat Window Title</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-text-field
                  color="light-blue darken-1"
                  validate-on-blur
                  v-model.trim="solution.chatTitle"
                  label="Chat Window Title"
                  :rules="[ruleMustHaveValue]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Deep Link (?dl=[deep-link]) </v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-text-field
                  color="light-blue darken-1"
                  v-model.trim="solution.deepLink"
                  validate-on-blur
                  label="Deep links can be accessed with ?dl=<deep-link>"
                  :rules="[ruleMustHaveValue, ruleNoSpaces, ruleDeepLinkUnique]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Locale</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-select
                  :items="locales"
                  color="light-blue darken-1"
                  :menu-props="{ contentClass: 'select-options' }"
                  outlined
                  v-model="solution.locale"
                  label="Specify Chat Locale"
                  append-icon="mdi-translate"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Demo Animation</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-row
                  align="center"
                  justify="center"
                  style="min-height: 300px; height: 300px;"
                >
                  <transition
                    name="leoaprd-transition"
                    :enter-active-class="'animated ' + solution.animations.in"
                    :leave-active-class="'animated ' + solution.animations.out"
                  >
                    <v-img
                      v-if="showLeopardAnimationImage"
                      src="../../public/static/leopard-small.png"
                      lazy-src="../../public/static/leopard-small.png"
                      max-height="300"
                      @click="toggleDisplayAnimationImage()"
                      style="z-index: 20"
                      contain
                    ></v-img>
                  </transition>
                </v-row>
              </v-col>

              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Enter Animation</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-select
                  :items="animations.in"
                  color="light-blue darken-1"
                  :menu-props="{ contentClass: 'select-options' }"
                  outlined
                  v-model="solution.animations.in"
                  label="Specify Enter Animation"
                  append-icon="mdi-expand-all"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Exit Animation</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-select
                  :items="animations.out"
                  color="light-blue darken-1"
                  :menu-props="{ contentClass: 'select-options' }"
                  outlined
                  v-model="solution.animations.out"
                  label="Specify Exit Animation"
                  append-icon="mdi-collapse-all"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Response Icon</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8" class="pb-0">
                <v-text-field
                  v-model.trim="solution.responseIcon"
                  validate-on-blur
                  color="light-blue darken-1"
                  label="Response Icon - MDI Icons (mdi-icon-name)"
                  :append-icon="solution.responseIcon"
                  :rules="[ruleMustHaveValue]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-sm-none d-md-block"> </v-col>
              <v-col :cols="12" :md="8" class="py-0">
                <v-btn
                  v-for="(icon, index) in chatIcons"
                  :key="index + 'response-icons'"
                  @click="solution.responseIcon = icon"
                  :aria-label="`Set the virtual assistant icon to ${icon}`"
                  text
                  icon
                  color="indigo"
                >
                  <v-icon>{{ icon }}</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>User Icon</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8" class="pb-0">
                <v-text-field
                  v-model.trim="solution.userIcon"
                  validate-on-blur
                  color="light-blue darken-1"
                  label="User Icon - MDI Icons (mdi-icon-name)"
                  :aria-label="
                    `Set the icon representing the customer in the chat UI`
                  "
                  :append-icon="solution.userIcon"
                  :rules="[ruleMustHaveValue]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="d-sm-none d-md-block"> </v-col>
              <v-col :cols="12" :md="8" class="py-0">
                <v-btn
                  v-for="(icon, index) in chatIcons"
                  :key="index + 'user-icons'"
                  :aria-label="
                    `Set the icon representing the customer to ${icon}`
                  "
                  @click="solution.userIcon = icon"
                  text
                  icon
                  color="indigo"
                >
                  <v-icon>{{ icon }}</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Features</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-row no-gutters>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.enableLiveChat"
                      label="Live Chat"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.float"
                      label="Float UI"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.pulseButton"
                      label="Pulse Button"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.longResponsesInModal"
                      label="Long Answers in Modal"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.showChatIcons"
                      label="Chat Icons"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" :lg="4" :sm="6">
                    <v-switch
                      v-model="solution.displayAccent"
                      label="Show Accent"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider></v-divider>
              <v-col :cols="12" :lg="4">
                <v-subheader class="mb-2"
                  >Theme
                  <v-tooltip open-delay="300" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="mx-2"
                        :aria-label="`Reset theme colors to default`"
                        v-bind="attrs"
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
                    <v-col cols="12" class="pt-0">
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
              <v-col :cols="12" :lg="8">
                <v-row>
                  <v-col
                    :cols="12"
                    :sm="6"
                    :md="4"
                    :lg="3"
                    v-for="color in themeColors"
                    :key="color"
                  >
                    <v-btn
                      class="mr-2"
                      :aria-label="
                        `Set the active color for editing to ${color}`
                      "
                      fab
                      dark
                      small
                      @click="setActiveColor(color)"
                      :color="solution.theme[color]"
                    >
                      <v-icon v-if="activeColor === color">mdi-star</v-icon>
                    </v-btn>
                    <v-text-field
                      v-model.trim="solution.theme[color]"
                      @click="setActiveColor(color)"
                      validate-on-blur
                      color="light-blue darken-1"
                      :value="solution.theme[color]"
                      :label="color"
                      :rules="[ruleMustHaveValue, ruleMustHaveColor]"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider></v-divider>
              <!-- ASR Corrections -->
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>Button and Toolbar Custom CSS</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-textarea
                  outlined
                  color="light-blue darken-1"
                  name="input-7-4"
                  label="Custom CSS"
                  v-model.trim="solution.customCssButtonToolbar"
                ></v-textarea>
              </v-col>
              <v-divider></v-divider>
              <!-- ASR Corrections -->
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>ASR Corrections</v-subheader>
              </v-col>
              <v-col :cols="12" :md="8">
                <v-textarea
                  outlined
                  color="light-blue darken-1"
                  name="input-7-4"
                  label="ASR Corrections"
                  v-model.trim="solution.asrCorrections"
                ></v-textarea>
              </v-col>
              <!-- help -->
              <v-col cols="12" :md="4">
                <v-btn
                  color="red"
                  :aria-label="`Add a help question`"
                  class="white--text mr-2"
                  @click="addUserInput"
                >
                  Help
                  <v-icon right dark>mdi-plus-circle</v-icon>
                </v-btn>
              </v-col>
              <v-col :cols="12" :md="8">
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
                      label="Example question"
                      append-icon="mdi-android-messages"
                      :rules="[ruleMustHaveValue]"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1" class="pl-2 pt-3">
                    <v-icon
                      @click="solution.knowledgeData.splice(index, 1)"
                      color="red"
                      dark
                      >mdi-minus-circle</v-icon
                    >
                  </v-col>
                </v-row>
              </v-col>
              <v-divider></v-divider>
              <!-- context parameters -->
              <v-col cols="12" sm="4" class="d-none d-sm-none d-md-inline">
                <v-subheader>When to send CTX params</v-subheader>
              </v-col>

              <v-col :cols="12" :md="8">
                <v-radio-group
                  label="When to send CTX params"
                  v-model="solution.sendContextParams"
                  mandatory
                >
                  <v-radio label="At login" value="login"></v-radio>
                  <v-radio label="All requests" value="all"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col :cols="12" :lg="4">
                <v-btn
                  color="red"
                  :aria-label="`Add a new context parameter`"
                  class="white--text mr-2"
                  @click="addContextParam"
                >
                  CTX Param
                  <v-icon right dark>mdi-plus-circle</v-icon>
                </v-btn>
              </v-col>
              <v-col :cols="12" :lg="8">
                <!-- Itterate over all CTX parameters and their values -->
                <v-row
                  class="mb-4 grey lighten-5 pa-2 elevation-2"
                  align="start"
                  justify="start"
                  v-for="(contextParam, index) in solution.contextParams"
                  v-bind:key="index"
                >
                  <v-col :cols="10">
                    <v-text-field
                      v-model.trim="contextParam.name"
                      validate-on-blur
                      color="light-blue darken-1"
                      label="Parameter Name"
                      append-icon="mdi-key-variant"
                      :rules="[ruleMustHaveValue]"
                    ></v-text-field>
                  </v-col>
                  <v-col :cols="2">
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          v-bind="attrs"
                          v-on="on"
                          @click="solution.contextParams.splice(index, 1)"
                          color="red"
                          dark
                          >mdi-minus-circle</v-icon
                        >
                      </template>
                      <span>Remove CTX Parameter</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          v-bind="attrs"
                          v-on="on"
                          @click="addNewContextParameterValue(index)"
                          color="green"
                          dark
                          >mdi-plus-circle</v-icon
                        >
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
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            @click="contextParam.values.splice(valueIndex, 1)"
                            color="red"
                            dark
                            >mdi-minus-circle</v-icon
                          >
                        </template>
                        <span>Delete Parameter Value</span>
                      </v-tooltip>
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            v-bind="attrs"
                            v-on="on"
                            @click="
                              toggleActiveContextParameterValue(
                                value.active,
                                index,
                                valueIndex
                              )
                            "
                            :color="
                              value.active ? 'green' : 'blue-grey lighten-4'
                            "
                            dark
                            >{{
                              value.active
                                ? "mdi-checkbox-marked"
                                : "mdi-checkbox-blank-outline"
                            }}</v-icon
                          >
                        </template>
                        <span>Enable/Disable</span>
                      </v-tooltip>
                      <!-- show input box for context parameter value -->
                      <v-text-field
                        v-model.trim="value.text"
                        validate-on-blur
                        color="light-blue darken-1"
                        label="Parameter Value"
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
          :aria-label="`Close the solution editing dialog`"
          color="blue-grey lighten-5"
          light
          @click="closeAddNewSolutionDialog"
          >Close</v-btn
        >
        <v-btn
          class="mr-2"
          color="green"
          :aria-label="`Save edits to the solution`"
          @click="saveForm"
          >Save
          <v-icon right dark>mdi-content-save</v-icon>
        </v-btn>
        <v-snackbar :timeout="snackbarTimeout" v-model="snackbar" class="mb-5">
          🧟‍ Please fix all form validation errors.
        </v-snackbar>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
const logger = require("@/utils/logging").getLogger("ChatAddEditSolution.vue");
import utils from "@/utils/utils";
import urlRegex from "url-regex";
import { COLOR_NAMES } from "../constants/color-names.js";
import { SOLUTION_DEFAULT } from "../constants/solution-config-default.js";
export default {
  name: "ConfigAddEditSolution",
  components: {},
  props: ["config", "currentModeEdit", "selectedSolution"],
  data() {
    return {
      showLeopardAnimationImage: true,
      dialogTitle:
        this.currentModeEdit === "edit"
          ? "Editing Solution"
          : "Adding Solution",
      solution:
        this.currentModeEdit === "edit"
          ? utils.cloneObject(this.selectedSolution)
          : Object.assign({}, SOLUTION_DEFAULT),
      animations: {
        in: [
          "none",
          "bounce",
          "flash",
          "pulse",
          "rubberBand",
          "shake",
          "headShake",
          "swing",
          "tada",
          "wobble",
          "jello",
          "bounceIn",
          "bounceInDown",
          "bounceInLeft",
          "bounceInRight",
          "bounceInUp",
          "fadeIn",
          "fadeInDown",
          "fadeInDownBig",
          "fadeInLeft",
          "fadeInLeftBig",
          "fadeInRight",
          "fadeInRightBig",
          "fadeInUp",
          "fadeInUpBig",
          "flipInX",
          "flipInY",
          "lightSpeedIn",
          "rotateIn",
          "rotateInDownLeft",
          "rotateInDownRight",
          "rotateInUpLeft",
          "rotateInUpRight",
          "hinge",
          "jackInTheBox",
          "rollIn",
          "zoomIn",
          "zoomInDown",
          "zoomInLeft",
          "zoomInRight",
          "zoomInUp",
          "slideInDown",
          "slideInLeft",
          "slideInRight",
          "slideInUp",
          "heartBeat"
        ],
        out: [
          "none",
          "bounce",
          "flash",
          "pulse",
          "rubberBand",
          "shake",
          "headShake",
          "swing",
          "tada",
          "wobble",
          "jello",
          "bounceOut",
          "bounceOutDown",
          "bounceOutLeft",
          "bounceOutRight",
          "bounceOutUp",
          "fadeOut",
          "fadeOutDown",
          "fadeOutDownBig",
          "fadeOutLeft",
          "fadeOutLeftBig",
          "fadeOutRight",
          "fadeOutRightBig",
          "fadeOutUp",
          "fadeOutUpBig",
          "flipOutX",
          "flipOutY",
          "lightSpeedOut",
          "rotateOut",
          "rotateOutDownLeft",
          "rotateOutDownRight",
          "rotateOutUpLeft",
          "rotateOutUpRight",
          "hinge",
          "jackInTheBox",
          "rollOut",
          "zoomOut",
          "zoomOutDown",
          "zoomOutLeft",
          "zoomOutRight",
          "zoomOutUp",
          "slideOutDown",
          "slideOutLeft",
          "slideOutRight",
          "slideOutUp",
          "heartBeat"
        ]
      },
      snackbar: false,
      showDialog: true,
      snackbarTimeout: 3000,
      globalSnackbarMessage: "",
      globalSnackbar: false,
      globalSnackbarTimeout: 2000,
      globalSnackbarColor: "",
      tabIndex: 1,
      activeColor: "",
      color: "#D60270",
      themeColors: [
        "primary",
        "secondary",
        "accent",
        "error",
        "info",
        "success",
        "warning"
      ],
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
        "mdi-comment-arrow-left",
        "mdi-comment-arrow-left-outline",
        "mdi-comment-arrow-right",
        "mdi-comment-arrow-right-outline ",
        "mdi-comment-question",
        "mdi-comment-question-outline",
        "mdi-comment-quote",
        "mdi-comment-quote-outline",
        "mdi-comment-text-outline",
        "mdi-message-text",
        "mdi-message-outline",
        "mdi-message",
        "mdi-chat-outline",
        "mdi-chat",
        "mdi-message-reply",
        "mdi-message-reply-text",
        "mdi-android-messages",
        "mdi-assistant",
        "mdi-bullseye-arrow",
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
        "mdi-robot",
        "mdi-alien",
        "mdi-space-invaders",
        "mdi-teach",
        "mdi-ninja",
        "mdi-owl"
      ]
    };
  },
  computed: {},
  updated() {
    // you have to wait just a bit for the scroll to work
    setTimeout(function() {
      // document.getElementById("add-edit").scrollTop = 0;
    }, 100);
  },
  methods: {
    toggleDisplayAnimationImage() {
      this.showLeopardAnimationImage = false;
      let that = this;
      setTimeout(function() {
        that.showLeopardAnimationImage = true;
      }, 1500);
    },
    displaySnackBar(message, timeout = 2000, color = "") {
      this.globalSnackbarMessage = message;
      this.globalSnackbar = true;
      this.globalSnackbarTimeout = timeout;
      this.globalSnackbarColor = color;
    },
    failsValidation() {
      logger.debug(this.$refs.form);
      if (!this.$refs.form.validate()) {
        this.snackbar = true;
        return true;
      }
      return false;
    },
    cloneObject(obj) {
      // this is a deep clone
      return JSON.parse(JSON.stringify(obj));
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
              utils.cloneObject(this.solution)
            );
            break;
          }
        }
        // adding a new solution config
      } else {
        logger.debug("About to add a new solution");
        this.config.solutions.push(utils.cloneObject(this.solution));
        // this.selectedSolution = utils.cloneObject(this.solution);
        if (this.config.solutions.length === 1) {
          // first one added. Make it active
          this.config.activeSolution = this.solution.name;
        }
      }
      this.saveAndCloseAddNewSolutionDialog();
    },
    closeAddNewSolutionDialog() {
      this.$refs.form.reset();
      this.$emit("result");
    },
    saveAndCloseAddNewSolutionDialog() {
      this.$emit("result", {
        config: this.config,
        selectedSolutionName: this.solution.name
      });
      this.$refs.form.reset();
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
    addUserInput() {
      this.solution.knowledgeData.push("");
    },
    getBackGroundColor(color) {
      return "background-color:" + color;
    },
    resetColorsToDefault() {
      this.solution.theme = Object.assign({}, SOLUTION_DEFAULT.theme);
    },
    setActiveColor(activeTheme) {
      this.activeColor = activeTheme;
      this.color = this.solution.theme[activeTheme];
    },
    updateColor() {
      if (this.activeColor) {
        this.solution.theme[this.activeColor] = this.color;
      }
    },
    getTabIndex() {
      this.tabIndexCount = this.tabIndexCount + 1;
      return this.tabIndexCount;
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
        logger.debug("Editing solution: checking deep link validity");
        const foundSolution = this.config.solutions.find(
          solution => solution.deepLink === value
        );
        logger.debug(foundSolution);
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
    ruleMustBeInteger(value) {
      logger.debug(`The value is ${Number(value)}`);
      if (Number.isInteger(Number(value))) {
        return true;
      } else {
        return "Value must be an integer";
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
      logger.debug(value);
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
    }
  }
};
</script>

<style scoped>
.teneo-hide-scroll-x {
  overflow-x: hidden;
}
</style>
