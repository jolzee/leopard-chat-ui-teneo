<template>
  <div>
    <v-app :dark="$vuetify.theme.dark" v-if="showButtonOnly" class="application-button">
      <div id="chat-open-close-button-embed">
        <v-fab-transition>
          <v-btn
            v-show="showChatButton"
            id="leopard-embed-open-close-button"
            @click="openEmbedButton"
            fab
            dark
            color="primary"
            elevation="2"
            aria-roledescription="A Chat Interface with a Virtual Agent"
            accesskey="/"
            aria-label="Open Chat"
            tabindex="0"
            :class="`leopard-open-close-button embed-button-center pulse ${textColor('primary')}`"
            :style="customCssButtonToolbar"
          >
            <v-icon>mdi-message-text</v-icon>
          </v-btn>
        </v-fab-transition>
      </div>
    </v-app>
    <v-app v-else-if="['config'].indexOf($route.name) !== -1">
      <router-view v-if="['config'].indexOf($route.name) !== -1" />
    </v-app>
    <v-app
      v-else
      toolbar
      :class="{
        'elevation-2': !embed,
        'application-float': shouldFloat,
        'application-embed': embed,
        'application-mobile': isMobileDevice,
        'application-fullscreen': fullscreenEmbed
      }"
    >
      <vue-snotify></vue-snotify>
      <!-- <AssistiveText ref="assistiveText" v-model="accessibleAnnouncement"></AssistiveText> -->
      <transition
        name="system-bar-transition"
        enter-active-class="fadeInRightBig"
        leave-active-class="fadeOutRightBig"
      >
        <v-system-bar
          window
          tabindex="0"
          v-if="!maximizeChat"
          id="leopardSystemBarMinimized"
          color="primary"
          accesskey="+"
          :class="`elevation-4 leopard-system-bar ${textColor('primary')}`"
          style="
            border-right: 4px solid yellowgreen !important;
            border-left: 4px solid yellowgreen !important;
          "
          @click="maximizeChat = true"
          v-on:keydown.enter.prevent="maximizeChat = true"
        >
          <v-icon color="secondary">mdi-message-text</v-icon>
          <span>Continue conversation..</span>
          <v-spacer></v-spacer>
          <v-icon color="secondary">mdi-arrow-expand-all</v-icon>
        </v-system-bar>
      </transition>
      <template v-if="maximizeChat">
        <div id="chat-open-close-button" v-if="!embed">
          <v-fab-transition>
            <v-btn
              fab
              dark
              accesskey="/"
              color="primary"
              aria-roledescription="A Chat Interface with a Virtual Agent"
              :aria-label="isChatOpen ? 'Close Chat' : 'Open Chat'"
              elevation="2"
              @click="toggleChat"
              v-show="showChatButton && !isChatOpen"
              tabindex="0"
              :class="`leopard-open-close-button ${textColor('primary')} ${
                pulseButton && !isChatOpen ? 'pulse' : ''
              }`"
              :style="customCssButtonToolbar"
            >
              <v-icon v-text="isChatOpen ? 'mdi-close' : 'mdi-message-text'"></v-icon>
            </v-btn>
          </v-fab-transition>
        </div>

        <!-- start menu -->
        <transition
          name="menu-transition"
          enter-active-class="slideInRight"
          leave-active-class="slideOutRight"
        >
          <v-navigation-drawer
            app
            :clipped="clipped"
            v-if="drawer && isChatOpen"
            v-model="drawer"
            class="application-mobile"
            role="navigation"
            aria-label="Main Chat Bot Menu"
            enable-resize-watcher
            overlay-opacity="0.07"
            temporary
            right
            width="250"
          >
            <v-row align="center" justify="center">
              <v-col class="primary darken-2 pa-0 ma-0 elevation-2" style="height: 64px">
                <div class="text-center pa-5 pt-4">
                  <h1
                    tabindex="-1"
                    class="headline white--text font-weight-medium"
                    id="leopard-first-drawer-item"
                  >
                    {{ $t("menu.title") }}
                  </h1>
                </div>
              </v-col>
            </v-row>

            <v-list role="list" class="px-2 mt-1" v-model="navigationDrawerModel">
              <div role="listitem">
                <v-list-item
                  ripple
                  tag="a"
                  aria-label="Back to Chat Bot"
                  value="true"
                  key="menuBackToChat"
                  @click="backToChat"
                >
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">mdi-comment-arrow-left-outline</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">{{
                      $t("menu.back.to.chat")
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <div role="listitem" v-for="(menuItem, i) in activeMenuItems" :key="i + 'menuItem'">
                <v-list-item ripple :aria-label="menuItem.ariaLabel" :to="menuItem.route">
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">{{ menuItem.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">
                      {{ $t(menuItem.titleKey) }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <!-- toggle brightness -->
              <div role="listitem">
                <v-list-item
                  ripple
                  tag="a"
                  value="true"
                  key="menuItemTheme"
                  :aria-label="$vuetify.theme.dark ? 'Light Mode' : 'Dark Mode'"
                  @click="toggleBrightness"
                >
                  <v-list-item-action>
                    <v-icon
                      medium
                      :class="menuClass"
                      v-text="$vuetify.theme.dark ? 'mdi-brightness-5' : 'mdi-brightness-4'"
                    ></v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">{{
                      $vuetify.theme.dark ? $t("menu.light.mode") : $t("menu.dark.mode")
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <!-- close button -->
              <div role="listitem">
                <v-list-item
                  tag="a"
                  ripple
                  aria-label="Close menu"
                  value="true"
                  key="menuCloseChatMenu"
                  @click="drawer = false"
                >
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">mdi-backburger</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">{{
                      $t("menu.close")
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>

              <!-- logout -->
              <v-list-item
                ripple
                v-if="authenticated"
                role="listitem"
                aria-label="Logout of chat bot"
                value="true"
                key="menuChatLogout"
                @click="logout()"
              >
                <v-list-item-action>
                  <v-icon medium :class="menuClass">mdi-logout-variant</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="subheading" :class="menuClassText">
                    {{ $t("menu.logout") }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <template v-slot:append>
              <v-row
                v-if="keepBranding()"
                align="center"
                justify="center"
                style="height: 90px; background-color: #2f286e"
              >
                <div class="pa-2">
                  <a
                    href="https://www.artificial-solutions.com/teneo"
                    class="leopard-img"
                    target="_blank"
                    aria-label="Artificial Solutions information will open in a new window"
                  >
                    <img
                      src="@/assets/powered-by-teneo.png"
                      :alt="$t('menu.powered.by')"
                      class="text-center"
                      width="150"
                    />
                  </a>
                </div>
              </v-row>
            </template>
          </v-navigation-drawer>
        </transition>
        <!-- end menu -->

        <transition
          name="chat-window-transition"
          :aria-hidden="drawer || hide508"
          :enter-active-class="getAnimatedIn"
          :leave-active-class="getAnimatedOut"
        >
          <div
            id="teneo"
            :aria-hidden="drawer || hide508"
            :inert="drawer || (embed && hide508)"
            v-if="isChatOpen"
            :class="{
              'elevation-2': !embed,
              'application-float': float,
              'application-embed': embed,
              'teneo-light-bg': !$vuetify.theme.dark,
              'teneo-dark-bg': $vuetify.theme.dark,
              'application-mobile': isMobileDevice
            }"
          >
            <div style="height: inherit; border-radius: inherit">
              <v-app-bar
                elevation="2"
                max-height="64"
                min-height="64"
                height="64"
                :color="toolbarColor"
                dark
                app
                :class="{
                  'teneo-toolbar-float': float && !embed,
                  'teneo-toolbar-embed': embed && !fullscreenEmbed,
                  'teneo-toolbar-embed-fullscreen': fullscreenEmbed
                }"
                class="teneo-leopard-header"
                :style="toolbarStyle"
              >
                <nav>
                  <v-fab-transition>
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      :color="isLightColor('primary') ? 'black' : 'white'"
                      id="leopardNavMenuButton"
                      accesskey="m"
                      :aria-label="drawer ? 'Hide Chat Bot Menu' : 'Chat Bot Menu'"
                      @click.stop="drawer = !drawer"
                      class="embed-button-center ml-0"
                    >
                      <v-icon>{{ drawer ? "mdi-menu-open" : "mdi-menu" }}</v-icon>
                    </v-btn>
                  </v-fab-transition>
                </nav>

                <h1
                  id="leopard-chat-toolbar-title"
                  tabindex="-1"
                  class="ml-2 subtitle-1 pl-0"
                  v-html="toolbarTitle"
                ></h1>

                <v-spacer></v-spacer>
                <!-- Handle close button on production embedded sites -->
                <span v-if="$router.currentRoute.path !== '/'">
                  <v-fab-transition>
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      :color="isLightColor('primary') ? 'black' : 'white'"
                      to="/"
                      aria-label="Back to Chat"
                      class="mr-2"
                    >
                      <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                  </v-fab-transition>
                </span>
                <v-fab-transition v-if="emergencyConfig">
                  <v-btn
                    icon
                    text
                    tile
                    small
                    ripple
                    accesskey="."
                    :color="
                      emergencyConfig.color
                        ? emergencyConfig.color
                        : isLightColor('primary')
                        ? 'black'
                        : 'white'
                    "
                    aria-label="Minimize Chat"
                    class="embed-button-center mr-1"
                    @click="sendEmergencyCode"
                  >
                    <v-icon>{{ `mdi-${emergencyConfig.icon}` }}</v-icon>
                  </v-btn>
                </v-fab-transition>
                <template v-if="embedAndShowClose">
                  <span @click="closeChatEmbedded">
                    <v-fab-transition>
                      <v-btn
                        icon
                        text
                        tile
                        small
                        ripple
                        :color="isLightColor('primary') ? 'black' : 'white'"
                        aria-label="Close Chat"
                        class="embed-button-center mr-0"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-fab-transition>
                  </span>
                </template>
                <template v-else-if="embed"></template>
                <!-- Handle close button in demo mode -->
                <template v-else>
                  <v-fab-transition v-if="!embed || isLiveAgentAssist">
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      accesskey="."
                      :color="isLightColor('primary') ? 'black' : 'white'"
                      aria-label="Minimize Chat"
                      class="embed-button-center mr-1"
                      @click="minimizeChat"
                    >
                      <v-icon>mdi-image-size-select-small</v-icon>
                    </v-btn>
                  </v-fab-transition>
                  <v-fab-transition>
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      :color="isLightColor('primary') ? 'black' : 'white'"
                      accesskey="/"
                      aria-label="Close Chat"
                      class="embed-button-center mr-0"
                      @click="toggleChat"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-fab-transition>
                </template>
              </v-app-bar>

              <v-main app id="scrolling-techniques content-area" class="pt-0">
                <OverlayAlert />
                <router-view
                  :drawer="drawer"
                  @closeMenu="drawer = false"
                  v-if="['config'].indexOf($route.name) === -1"
                />
                <teneo-modal></teneo-modal>
              </v-main>
            </div>
          </div>
        </transition>
        <Dialog
          v-if="importDialog"
          title="Solution Import"
          :show="importDialog"
          width="800px"
          @close="importDialog = false"
        >
          {{ importDialogMessages.message }}
          <br />
          <br />
          <v-alert
            v-if="importDialogMessages.hasConflictingSolution"
            text
            outlined
            border="left"
            color="deep-orange"
            icon="mdi-fire"
            class="ma-0 elevation-3"
            >You already have a solution with the same name or deep link.</v-alert
          >

          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Key</th>
                  <th class="text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(value, name, index) in importDialogMessages.solution">
                  <tr :key="`${index}${name}`">
                    <td style="vertical-align: top" class>
                      <code class="leopard-import">{{ name }}</code>
                    </td>
                    <td>
                      <prism
                        language="json"
                        class="leopard-import"
                        style="background-color: unset; display: block"
                        >{{ JSON.stringify(value, null, 2) }}</prism
                      >
                    </td>
                  </tr>
                </template>
              </tbody>
            </template>
          </v-simple-table>

          <template v-slot:buttons>
            <v-btn small color="green lighten-4 black--text" @click="importDialog = false"
              >Cancel</v-btn
            >
            <v-btn
              v-if="!importDialogMessages.hasConflictingSolution"
              small
              color="green black--text"
              @click="importNewSolutionFromUrl"
            >
              Import
              <v-icon right>mdi-database-import</v-icon>
            </v-btn>
            <template v-else>
              <v-btn small color="green black--text" @click="importNewUniqueSolutionFromUrl">
                Import as Copy
                <v-icon right>mdi-database-import</v-icon>
              </v-btn>
              <v-btn small color="green black--text" @click="importReplacementSolutionFromUrl">
                Replace
                <v-icon right>mdi-database-import</v-icon>
              </v-btn>
            </template>
          </template>
        </Dialog>
      </template>
    </v-app>
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("App.vue");
import "wicg-inert/dist/inert.min";
import { mapGetters } from "vuex";
import { STORAGE_KEY } from "@/constants/solution-config-default";
import {
  debounce,
  sendMessageToParent,
  isLight,
  isDark,
  hasConflictingSolution,
  makeSolutionUnique,
  uuid
} from "@/utils/utils";
import "prismjs/prism";
import "prismjs/themes/prism-coy.css";
import "prismjs/components/prism-json.min";
// import AssistiveText from "@/components/AssistiveText.vue";
import jsonpack from "jsonpack/main";

// import { createDetailsWidget } from "@livechat/agent-app-sdk";
// import { createMessageBoxWidget } from "@livechat/agent-app-sdk";

export default {
  components: {
    OverlayAlert: () => import("@/components/OverlayAlert"),
    Dialog: () => import("@/components/Dialog"),
    Prism: () => import("vue-prism-component")
  },
  data() {
    return {
      liveChatAccessToken: null,
      liveChatAgentAssistLastMessage: null,
      importDialog: false,
      parentHeight: "",
      navigationDrawerModel: true,
      loginPerformed: false,
      maximizeChat: true,
      importedSolution: {},
      importDialogMessages: {},
      clipped: false,
      drawer: false,
      menuItems: [
        {
          icon: "mdi-cog-outline",
          titleKey: "menu.config",
          ariaLabel: "Chat Bot Configuration",
          route: "config"
        },
        {
          icon: "mdi-lifebuoy",
          titleKey: "menu.help",
          ariaLabel: "Help with Chat Bot",
          route: "help"
        },
        {
          icon: "mdi-history",
          titleKey: "menu.history",
          ariaLabel: "Chat History",
          route: "history",
          when: this.hasDifferentHistory
        },
        {
          icon: "mdi-information-variant",
          titleKey: "menu.about",
          ariaLabel: "About Chat Bot",
          route: "about",
          when: this.keepBranding()
        },
        {
          icon: "mdi-account-plus",
          titleKey: "menu.register",
          ariaLabel: "Chat Bot Register",
          route: "register",
          when: "notAuthenticated"
        },
        {
          icon: "mdi-login-variant",
          titleKey: "menu.login",
          ariaLabel: "Chat Bot Login",
          route: "login",
          when: "notAuthenticated"
        }
      ],
      miniVariant: true,
      rightDrawer: false
    };
  },
  watch: {
    snotify: function (snotifyConfig) {
      if (snotifyConfig) {
        if (snotifyConfig instanceof Array) {
          for (let i = 0; i <= snotifyConfig.length; i++) {
            let conf = snotifyConfig[i];
            let that = this;
            if (conf != null) {
              setTimeout(function () {
                if (conf.title && conf.type) {
                  that.$snotify[conf.type](conf.body, conf.title, conf.config);
                } else if (conf.type) {
                  that.$snotify[conf.type](conf.body, conf.config);
                }
              }, i * 2000);
            }
          }
        } else if (snotifyConfig.title && snotifyConfig.type) {
          this.$snotify[snotifyConfig.type](
            snotifyConfig.body,
            snotifyConfig.title,
            snotifyConfig.config
          );
        } else if (snotifyConfig.type) {
          this.$snotify[snotifyConfig.type](snotifyConfig.body, snotifyConfig.config);
        }
      }
    },
    isChatOpen: function (isOpenNew) {
      if (isOpenNew) {
        const element = this.$el.querySelector("#teneo-input-field");
        if (element) {
          if (!this.isMobileDevice) {
            element.focus();
            this.$nextTick(() => {
              // this.$refs.userInput.focus(); // possibly duplicated below
              element.addEventListener("focusin", e => e.stopPropagation()); // to stop flickering
              element.focus();
              try {
                element.click();
              } catch (e) {
                // ignore
              }
            });
          } else {
            element.addEventListener("focusin", e => e.stopPropagation()); // to stop flickering
            document.activeElement.blur();
          }
        }
      }
    },
    mustCloseBecauseOfEscape: function (mustClose) {
      if (mustClose) {
        if (this.embed) {
          this.closeChatEmbedded();
        } else if (this.isChatOpen) {
          logger.debug(`Must close because of ESC`);
          this.toggleChat();
        }
        this.$store.commit("RESET_MUST_CLOSE");
      }
    },
    drawer: function (isDrawerOpen) {
      if (isDrawerOpen) {
        this.$nextTick(() => {
          document.getElementById("leopard-first-drawer-item").focus();
        });
      } else {
        logger.debug("Nav drawer has just closed");
        if (this.$refs.userInput) {
          this.$refs.userInput.focus();
        } else {
          // let navButton = document.getElementById("leopardNavMenuButton");
          // if (navButton) {
          //   navButton.focus();
          // }
        }
      }
    }
  },
  updated() {},
  created() {
    this.setupChatHoverColor();
    this.$store.dispatch("setupFirebase");
    this.$store.dispatch("setupLiveChatAgentAssist"); // only enabled in certain scenario
  },
  mounted() {
    logger.info("In production: ", this.embed);
    if (this.embed) {
      this.isChatOpenLocalStorage();
      // window.addEventListener("keyup", debounce(this.handleKeyUpEmbed, 200, false), false);
      window.addEventListener("keyup", this.handleKeyUpEmbed, true);
    }
    this.$nextTick(function () {
      if (this.isMobileDevice) {
        window.addEventListener("resize", this.onResizeOrEmbed, false);
      } else {
        window.addEventListener("resize", debounce(this.onResizeOrEmbed, 200, false), false);
      }
    });

    // Looks for deeplink ?question=Hello there
    const urlParams = new URLSearchParams(window.location.search);
    const initialUserInput = urlParams.get("question");
    if (initialUserInput && !this.isChatOpen) {
      this.toggleChat();
      setTimeout(() => {
        this.$store.commit("SET_USER_INPUT", initialUserInput);
        this.$store.commit("USER_INPUT_READY_FOR_SENDING");
      }, 2000);
    }

    // deal with import of solution
    const solConfig = urlParams.get("import");
    if (solConfig) {
      this.importedSolution = jsonpack.unpack(solConfig);
      this.importDialogMessages.message = `Do you want to import this solution?`;
      this.importDialogMessages.solution = this.importedSolution;
      this.importDialogMessages.hasConflictingSolution = hasConflictingSolution(
        this.importedSolution,
        this.config
      );

      logger.debug(`Importing the following solution config`, solConfig);
      this.importDialog = true;
    }
    // this.toggleChat(); // will automatically open the chat window on load
    if (!this.showButtonOnly) {
      if (window.innerWidth <= 480 || this.embed) {
        this.onResizeOrEmbed();
      }
      this.$store.dispatch("setUserInformation");
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResizeOrEmbed);
  },
  computed: {
    ...mapGetters([
      "emergencyConfig",
      "isLiveAgentAssist",
      "accessibleAnnouncement",
      "mustCloseBecauseOfEscape",
      "accentStyling",
      "authenticated",
      "snotify",
      "hide508",
      "theme",
      "textColor",
      "isPromptPollingActive",
      "fullscreenEmbed",
      "getPromptPollingIntervalInMilliseconds",
      "config",
      "isMobileDevice",
      "getActivePromptInterval",
      "getLatestDialogHistory",
      "dialogs",
      "chatTitle",
      "customCssButtonToolbar",
      "getAnimatedIn",
      "getAnimatedOut",
      "embed",
      "float",
      "firebase",
      "hideConfigMenu",
      "overlayChat",
      "progressBar",
      "pulseButton",
      "showButtonOnly",
      "showChatButton",
      "isChatOpen",
      "socialAuthEnabled"
    ]),
    embedAndShowClose() {
      let showCloseButton = this.embed && window.leopardConfig.embed.showCloseButton;
      logger.debug("EMBED: Show close button?", showCloseButton);
      return showCloseButton;
    },
    hasDifferentHistory() {
      if (this.getLatestDialogHistory.length !== this.dialogs.length) {
        logger.debug(`Should show 'History' menu option`);
        return true;
      } else {
        logger.debug(`Should not show 'History' menu option`);
        return false;
      }
    },
    shouldFloat() {
      logger.debug(`Show Leopard floating?`, this.float);
      if (this.float && this.$router.currentRoute.path !== "/config") {
        return true;
      } else {
        return false;
      }
    },
    activeMenuItems() {
      if (this.authenticated) {
        return this.menuItems.filter(menuItem => {
          if (menuItem.route === this.$router.currentRoute.name) {
            return false;
          }
          if (
            "when" in menuItem &&
            typeof menuItem.when === "string" &&
            menuItem.when === "authenticated"
          ) {
            return true;
          } else if ("when" in menuItem && typeof menuItem.when === "boolean") {
            return menuItem.when;
          } else if ("when" in menuItem && typeof menuItem.when === "function") {
            return menuItem.when();
          } else if (menuItem.route === "config") {
            return this.hideConfigMenu ? false : true;
          } else if (!("when" in menuItem)) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        // anonymous

        return this.menuItems.filter(menuItem => {
          if (menuItem.route === this.$route.name) {
            return false;
          }
          if (
            this.socialAuthEnabled &&
            "when" in menuItem &&
            typeof menuItem.when === "string" &&
            menuItem.when === "notAuthenticated"
          ) {
            return true;
          } else if ("when" in menuItem && typeof menuItem.when === "boolean") {
            return menuItem.when;
          } else if ("when" in menuItem && typeof menuItem.when === "function") {
            return menuItem.when();
          } else if (menuItem.route === "config") {
            return this.hideConfigMenu ? false : true;
          } else if (!("when" in menuItem)) {
            return true;
          } else {
            return false;
          }
        });
      }
    },
    toolbarStyle() {
      let result = this.customCssButtonToolbar;
      return result + this.accentStyling;
    },
    menuClass() {
      if (!this.$vuetify.theme.dark) {
        return "grey--text text--darken-1";
      }
      return "grey--text text--lighten-2";
    },
    menuClassText() {
      if (!this.$vuetify.theme.dark) {
        return "grey--text text--darken-4 font-weight-bold";
      }
      return "grey--text text--lighten-2";
    },
    toolbarTitle() {
      const screenReader = `<span class="sr-only">Chat Bot </span>`;
      if (this.$route.name === "history") {
        return screenReader + this.$t("menu.history");
      } else if (this.$route.name === "help") {
        return screenReader + this.$t("menu.help");
      } else if (this.$route.name === "about") {
        return screenReader + this.$t("menu.about");
      } else if (this.$route.name === "register") {
        return screenReader + this.$t("menu.register");
      } else if (this.$route.name === "login") {
        return screenReader + this.$t("menu.login");
      } else {
        return this.chatTitle;
      }
    },
    toolbarColor() {
      return !this.$vuetify.theme.dark
        ? `primary ${isLight(this.theme.primary) ? "black" : "white"}--text`
        : `primary white--text`;
    }
  },
  methods: {
    sendEmergencyCode() {
      if (this.$router.currentRoute.path !== "/") {
        this.$router.push({ name: "chat" }); // make sure we show the main chat window
      }
      this.$store
        .dispatch("sendUserInput", this.emergencyConfig.payload)
        .then(() => {
          logger.debug("Emergency code sent to Teneo: ", this.emergencyConfig.payload);
        })
        .catch(err => {
          logger.error("Error sending emergency code", err);
        });
    },
    handleKeyUpEmbed(e) {
      if (this.showButtonOnly && this.showChatButton) {
        if (e.shiftKey && e.key === "Tab") {
          let embedButton = document.getElementById("leopard-embed-open-close-button");
          if (embedButton !== document.activeElement) {
            // alert("SHIFT+TAB: INNER");
            this.sendMessageToParent("shiftTabLeopard");
          }
        } else if (e.key === "Tab") {
          // let embedButton = document.getElementById("leopard-embed-open-close-button");
          // if (document.body === document.activeElement) {
          //   let embedButton = document.getElementById("leopard-embed-open-close-button");
          //   embedButton.focus();
          // } else if (embedButton === document.activeElement) {
          //   this.sendMessageToParent("tabLeopard");
          // }
        }
      }
    },
    setupChatHoverColor() {
      if (this.$vuetify.theme.dark) {
        document.documentElement.style.setProperty("--leopard-chat-button-color", "#C6FF00");
      } else {
        if (isDark(this.$vuetify.theme.themes.light.secondary)) {
          document.documentElement.style.setProperty(
            "--leopard-chat-button-color",
            this.$vuetify.theme.parsedTheme.secondary.lighten3
          );
        } else {
          document.documentElement.style.setProperty(
            "--leopard-chat-button-color",
            this.$vuetify.theme.parsedTheme.secondary.darken3
          );
        }
      }
    },
    keepBranding() {
      return !window.leopardConfig.hideArtificialSolutionsBranding;
    },
    isLightColor(themeColorName) {
      if (!this.$vuetify.theme.dark) {
        let hexColor = this.theme[themeColorName];
        logger.debug(`Checking ${themeColorName} color: ${hexColor}`, this.theme);
        return isLight(hexColor);
      } else {
        return false;
      }
    },
    backToChat() {
      this.drawer = false;
      if (this.$router.currentRoute.path !== "/") {
        this.$router.push({ name: "chat" }); // make sure we show the main chat window
      }
    },
    minimizeChat() {
      let siteFrame;
      if (!this.embed && !this.showButtonOnly) {
        siteFrame = document.getElementById("site-frame");
      }

      if (siteFrame) {
        siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
      }

      this.maximizeChat = false;

      setTimeout(
        function () {
          let systemBarElement = document.getElementById("leopardSystemBarMinimized");
          if (systemBarElement) {
            systemBarElement.focus();
          }
          let appElement = document.getElementById("app");
          appElement.setAttribute("style", "");
        }.bind(this),
        1500
      );
    },
    isChatOpenLocalStorage() {
      let isChatOpen = localStorage.getItem("isChatOpen");
      if (isChatOpen === null) {
        isChatOpen = false;
      } else {
        isChatOpen = JSON.parse(isChatOpen);
      }

      if (window.leopardConfig.embed.isInitialStateOpen) {
        isChatOpen = true;
      }

      let result = false;
      logger.debug(`isChatOpenLocalStorage: ${isChatOpen}`);
      if (isChatOpen) {
        this.$store.commit("SHOW_CHAT_WINDOW");
        // this.$store.commit("HIDE_CHAT_LOADING");
        this.sendMessageToParent("showLeopard");
        logger.debug("Leopard Sent Parent Message to OPEN");
        result = true;
      } else {
        this.$store.commit("HIDE_CHAT_WINDOW");
        this.$store.commit("HIDE_CHAT_LOADING");
        localStorage.setItem("isChatOpen", "false");
        this.sendMessageToParent("hideLeopard");
        logger.debug("Leopard Sent Parent Message to HIDE");
        result = false;
      }
      logger.debug(`Local Storage Thinks "isChatOpenLocalStorage": ${result}`);
      return result;
    },
    sendMessageToParent(message) {
      const trustedDomains = window.leopardConfig.embed.leopardTrustedDomains;
      if (
        !parent ||
        (parent && trustedDomains.length > 0 && !trustedDomains.includes(parent.location.origin))
      ) {
        return;
      }
      parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specify origin for each post.
      logger.debug("Message from Leopard >> Embed : " + message);
    },
    importNewSolutionFromUrl() {
      this.importDialog = false;
      this.importedSolution.id = uuid();
      this.config.solutions.push(this.importedSolution); // no conflicts
      let deepLinkUrl = `${location.protocol}//${location.host}${location.pathname}?dl=${this.importedSolution.deepLink}`;
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
      logger.debug(`Deep Link Url: `, deepLinkUrl);
      window.location.href = deepLinkUrl;
    },
    importNewUniqueSolutionFromUrl() {
      this.importDialog = false;
      this.importSolution = makeSolutionUnique(this.importedSolution);
      this.config.solutions.push(this.importedSolution); // no conflicts
      let deepLinkUrl = `${location.protocol}//${location.host}${location.pathname}?dl=${this.importedSolution.deepLink}`;
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
      logger.debug(`Deep Link Url: `, deepLinkUrl);
      window.location.href = deepLinkUrl;
    },
    importReplacementSolutionFromUrl() {
      this.importDialog = false;

      let existingSolutionsWithName = this.config.solutions.findIndex(
        solution => solution.name === this.importedSolution.name
      );
      let existingSolutionsWithDeepLink = this.config.solutions.findIndex(
        solution => solution.deepLink === this.importedSolution.deepLink
      );

      if (existingSolutionsWithName < 0 && existingSolutionsWithDeepLink < 0) {
        // no clashes in name or deep link
        this.config.solutions.push(this.importedSolution); // no conflicts
      } else if (existingSolutionsWithName >= 0 || existingSolutionsWithDeepLink >= 0) {
        // name and deep link clash - replace
        this.config.solutions.splice(existingSolutionsWithDeepLink, 1);
        existingSolutionsWithName = this.config.solutions.findIndex(
          solution => solution.name === this.importedSolution.name
        );
        if (existingSolutionsWithName > 0) {
          this.config.solutions.splice(existingSolutionsWithName, 1);
        }
        this.config.solutions.push(this.importedSolution);
      }
      this.config.activeSolution = this.importedSolution.id;
      let deepLinkUrl = `${location.protocol}//${location.host}${location.pathname}?dl=${this.importedSolution.deepLink}`;
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
      logger.debug(`Deep Link Url: `, deepLinkUrl);
      window.location.href = deepLinkUrl;
    },
    closeChatEmbedded() {
      localStorage.setItem("isChatOpen", "false");
      sendMessageToParent("hideLeopard");
      this.calculateMobileHeight(); // only called on mobile devices
      if (window.leopardConfig.embed.killSessionOnCloseEmbed) {
        this.loginPerformed = false;
      }
      logger.debug("Close Chat Embedded");
      this.$store.commit("HIDE_CHAT_BUTTON");
    },
    openEmbedButton() {
      this.calculateMobileHeight(); // only called on mobile devices
      logger.debug("Open Chat Window from Embed Button");
      this.$store.commit("HIDE_CHAT_BUTTON");
      setTimeout(
        function () {
          this.$store.commit("OPEN_CHAT_WINDOW_DISPLAY_EMBED");
        }.bind(this),
        800
      );
    },
    logout() {
      this.drawer = false;
      // document.activeElement.blur();
      if (this.embed) {
        this.closeChatEmbedded();
        this.$store.dispatch("logoutSocial");
      } else {
        let chatButton = document.getElementById("chat-open-close-button");
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }
        this.drawer = false;
        this.$store.commit("HIDE_CHAT_MODAL");
        this.$store.dispatch("logoutSocial");

        // hide chat window - button clicked - logout

        if (!this.embed && !this.overlayChat && siteFrame) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }
        setTimeout(
          function () {
            this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // close the chat window - i want the iframe to resize first and then the chat window to close
            if (chatButton) {
              chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
            }
          }.bind(this),
          1000
        );
      }

      // this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // was removed
      this.loginPerformed = false;
      // now end the Teneo Session - user clicked the close button - intention is clear
      this.$store.dispatch("endTeneoSession").then(() => {
        setTimeout(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY");
        }, 1000);
        // clear the dialogs once we have successfully ended the session

        // show the loading gif as the window is closing. Although delay a bit
        // setTimeout(
        //   function() {
        //     this.$store.commit("SHOW_CHAT_LOADING");
        //   }.bind(this),
        //   400
        // );

        // setTimeout(
        //   function() {
        //     this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the open chat button once the session has ended
        //   }.bind(this),
        //   1500
        // );
      });
    },
    calculateMobileHeight() {
      if (this.isMobileDevice) {
        // on mobile devices open the chat window automatically
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        logger.debug("Mobile device - Calculating the View Height in JS");
        let vh = null;
        vh = window.innerHeight * 0.01;
        // if (this.embed && parent) {
        //   let parentHeightLeopard = parent.getLeopardElementHeight();
        //   logger.debug(`Frame Height: ${parentHeightLeopard}`);
        //   vh = parentHeightLeopard * 0.01;
        //   this.parentHeight = parentHeightLeopard;
        // } else {
        //   vh = window.innerHeight * 0.01;
        // }

        // let vh = 640 * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    },
    onResizeOrEmbed() {
      this.calculateMobileHeight();

      if (this.dialogs.length > 0) {
        this.loginPerformed = true;
      }

      if (
        (window.innerWidth <= 480 &&
          !this.loginPerformed &&
          !this.embed &&
          this.dialogs.length === 0) ||
        (!this.showButtonOnly &&
          this.embed &&
          this.isChatOpenLocalStorage() &&
          !this.loginPerformed &&
          this.dialogs.length === 0)
      ) {
        logger.debug("Window width is narrow. Determined that we need to send login");
        logger.debug(`onResizeOrEmbed: Has Login Been Performed? ${this.loginPerformed}`);
        this.loginPerformed = true;
        let that = this;
        this.$store
          .dispatch("beginTeneoSession")
          .then(() => {
            that.loginPerformed = true;
            logger.debug("Successfully established chat session");
          })
          .catch(err => {
            logger.debug("ERROR LOGGING IN TO CHAT - Could not login to: ", err.teneoUrl);
          });
      } else {
        this.$store.commit("HIDE_CHAT_LOADING");
      }
      logger.debug(`AGAIN Has Login Been Performed? ${this.loginPerformed}`);
      if (this.$router.currentRoute.path === "/config") {
        return;
      }
      if (
        (window.innerWidth <= 480 && !this.embed) ||
        (this.embed && this.isChatOpenLocalStorage())
      ) {
        logger.debug(`window.innerWidth <= 480 && !this.embed`);
        this.$store.commit("HIDE_CHAT_BUTTON");
        this.$store.commit("SHOW_CHAT_WINDOW"); // show the chat window
        //animate the IFrame
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }
        let chatButton = document.getElementById("chat-open-close-button");

        if (this.$router.currentRoute.path !== "/") {
          this.$router.push({ name: "chat" }); // make sure we show the main chat window
        }

        // this.$store.commit("SHOW_CHAT_LOADING"); // display the loading spinner
        let isChatUiFloating = this.float;
        setTimeout(
          function () {
            logger.debug(`In move button left: ${isChatUiFloating}`);
            // wait just a bit before animating things - need the chat button to hide first
            if (chatButton && !this.embed) {
              if (isChatUiFloating) {
                chatButton.setAttribute("class", "move-button-left-float"); // reposition the chat button
              } else {
                chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
              }
            }

            if (!this.embed && !this.overlayChat && siteFrame) {
              siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
            }
          }.bind(this),
          400
        );
      } else if (window.innerWidth > 480 && this.isChatOpen) {
        this.$store.commit("SHOW_CHAT_BUTTON");
      }
    },
    toggleBrightness() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      // this.$store.commit("CHANGE_THEME");
    },
    toggleChat() {
      if (!this.$store.state.chatConfig || !this.$store.state.chatConfig.activeSolution) {
        this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY");
        this.$router.push({ name: "config" });
        return;
      }

      this.$store.commit("HIDE_CHAT_BUTTON"); // toggle the chat button visibility
      this.$store.commit("STOP_TTS"); // always reset audio to not speak when chat button is clicked
      let siteFrame;
      //animate the IFrame

      if (!this.embed && !this.overlayChat) {
        siteFrame = document.getElementById("site-frame");
      }

      // show chat window - button clicked - login
      if (!this.isChatOpen) {
        logger.debug("Toggle Chat: Send Login");
        this.$store
          .dispatch("openChatWindow", true)
          .then(() => {
            logger.debug("Successfully logged into chat");
            setTimeout(
              function () {
                this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
              }.bind(this),
              1500
            ); // only show the chat button after a successful login
          })
          .catch(err => {
            logger.error("ERROR OPENING AND LOGGING IN TO CHAT: ", err);
          });
      } else {
        let chatButton = document.getElementById("chat-open-close-button");
        // hide chat window - button clicked - logout
        this.$store.commit("HIDE_CHAT_MODAL");
        if (!this.embed && !this.overlayChat && siteFrame) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }

        this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // close the chat window - i want the iframe to resize first and then the chat window to close
        if (chatButton) {
          chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
        }
        this.loginPerformed = false;
        // now end the Teneo Session - user clicked the close button - intention is clear
        this.$store.dispatch("endTeneoSession").then(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session
          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function () {
              this.$store.commit("SHOW_CHAT_LOADING");
            }.bind(this),
            100
          );

          setTimeout(
            function () {
              let appElement = document.getElementById("app");
              appElement.setAttribute("style", "");
              this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
            }.bind(this),
            1500
          );
        });

        setTimeout(() => {
          document.getElementsByClassName("leopard-open-close-button")[0].focus();
        }, 1700);
      }
    }
  }
};
</script>

<style>
@import "~vue-snotify/styles/material.css";
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css";

.leopard-alert-border {
  border-style: solid;
  /* border-width: 4px; */
  content: "";
  position: absolute;
  opacity: 0.8;
}

.leopard-alert-border-left,
.leopard-alert-border-right {
  bottom: 0;
  top: 0;
}

.leopard-alert-border-left {
  border-top-left-radius: unset !important;
  border-top-right-radius: unset !important;
  border-bottom-right-radius: unset !important;
  border-bottom-left-radius: inherit !important;
  left: 0;
}

.leopard-alert-border-right {
  border-top-left-radius: initial !important;
  border-top-right-radius: unset !important;
  right: 0;
}

.v-application code {
  display: block !important;
  padding: 10px !important;
  font-size: 100% !important;
  font-weight: normal !important;
  color: whitesmoke !important;
  background-color: black !important;
  margin-top: 10px;
  margin-bottom: 10px;
}

.v-application code:after,
.v-application code:before {
  content: normal !important;
  letter-spacing: -1px;
}

code.leopard-import,
pre.leopard-import code {
  background: #f8f8f8 !important;
  color: black !important;
}

.teneo-icon {
  opacity: 0.7 !important;
}

code.language-json {
  display: block !important;
}

.theme--dark.v-icon {
  opacity: 1 !important;
}

.theme--light.v-icon {
  opacity: 1 !important;
}

.sr-only {
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
}

.leopard-alternative-views {
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(80vh - 64px);
}

.chat-card {
  cursor: default;
}

#leopardSystemBarMinimized:focus {
  outline: 0;
  box-shadow: 0 0 0 3px rgba(17, 18, 25, 0.4) !important;
}

.leopard-open-close-button.v-btn--fab:hover {
  color: var(--leopard-chat-button-color, "#FFFFFF") !important;
}

/* Edge Styling */
@supports (-ms-ime-align: auto) {
  .leopard-open-close-button.v-btn--fab:hover {
    color: rgb(173, 170, 170) !important;
  }

  #leopard-chat-toolbar-title:focus,
  div.v-input__slot:focus,
  .v-btn--fab:focus,
  button:focus,
  a:focus,
  div.v-list-item:focus,
  div.chat-card:focus,
  .leopard-open-close-button.v-btn--fab:focus,
  .v-input__icon--clear:focus {
    outline: 0 !important;
    -webkit-box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.421) !important;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.421) !important;
  }

  a.leopard-img:focus {
    display: flex;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    outline: 0;
    background: rgba(255, 255, 255, 0.19);
    -webkit-box-shadow: 0 0 0 3px rgb(76, 77, 108) !important;
    box-shadow: 0 0 0 3px rgb(76, 77, 108) !important;
  }

  #leopard-chat-toolbar-title:focus {
    padding: 5px !important;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    outline: 0;
    background: rgba(255, 255, 255, 0.19);
    box-shadow: 0 0 0 3px red !important;
  }

  .pulse::before {
    display: block;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: rgba(116, 116, 116, 0.069) !important;
    content: "";
    -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, transform 0.3s;
    transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s;
    -webkit-animation: pulse-animation 1s cubic-bezier(0.24, 0, 0.38, 1) infinite;
    animation: pulse-animation 4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }
}

/* IE 11 styling */
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  .leopard-open-close-button.v-btn--fab:hover {
    color: rgb(173, 170, 170) !important;
  }

  #leopard-chat-toolbar-title:focus,
  div.v-input__slot:focus,
  .v-btn--fab:focus,
  button:focus,
  a:focus,
  div.v-list-item:focus,
  div.chat-card:focus,
  .leopard-open-close-button.v-btn--fab:focus,
  .v-input__icon--clear:focus {
    outline: 0 !important;
    -webkit-box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.421) !important;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.421) !important;
  }

  a.leopard-img:focus {
    display: flex;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    outline: 0;
    background: rgba(255, 255, 255, 0.19);
    -webkit-box-shadow: 0 0 0 3px rgb(76, 77, 108) !important;
    box-shadow: 0 0 0 3px rgb(76, 77, 108) !important;
  }

  #leopard-chat-toolbar-title:focus {
    padding: 5px !important;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    outline: 0;
    background: rgba(255, 255, 255, 0.19);
    box-shadow: 0 0 0 3px red !important;
  }

  .pulse::before {
    display: block;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: rgba(116, 116, 116, 0.069) !important;
    content: "";
    -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, -webkit-transform 0.3s;
    transition: opacity 0.3s, transform 0.3s;
    transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s;
    -webkit-animation: pulse-animation 1s cubic-bezier(0.24, 0, 0.38, 1) infinite;
    animation: pulse-animation 4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }
}

.leopard-font-xs {
  font-size: 13px;
}
.leopard-font-small {
  font-size: 14px;
}
.leopard-font-medium {
  font-size: 15px;
}
.leopard-font-normal {
  font-size: 16px;
}
.leopard-font-large {
  font-size: 17px;
}
.leopard-font-xl {
  font-size: 18px;
}
.leopard-font-xxl {
  font-size: 19px;
}

/* .leopard-code {
  padding-right: 3px;
  padding-left: 3px;
  color: #fafafa;
  background-color: #000000;
  font-family: Fira Code, Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
    Bitstream Vera Sans Mono, Courier New;
} */

p {
  white-space: normal;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

.leopard-system-bar {
  position: fixed;
  right: 50px;
  bottom: 30px;
  width: 240px;
  border-radius: 0.5em;
  cursor: pointer;
}

.v-overlay--active {
  border-radius: 0px !important;
}

.teneo-leopard-header {
  position: relative !important;
}

#app {
  background-color: transparent;
}

#app input {
  caret-color: auto;
}

.application-button {
  width: 100%;
  background: transparent !important;
}

#chat-open-close-button-embed {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.teneo-light-bg {
  background-color: #fafafa;
}

.teneo-dark-bg {
  background-color: #313131;
}

hr {
  height: 3px;
  margin-bottom: 4px;
  border: 0;
  border-top: 1px dashed #8c8b8b;
  background: #d7d7d7;
}

blockquote {
  margin: 0.5em 0px;
  padding: 0.5em 10px;
  border-left: 6px solid #d7d7d7;
  quotes: "\201C""\201D""\2018""\2019";
}
blockquote:before {
  margin-right: 0.25em;
  color: #d7d7d7;
  font-size: 4em;
  line-height: 0.1em;
  vertical-align: -0.4em;
  /* content: open-quote; */
}
blockquote p {
  display: inline;
}

#leopard-chat-toolbar-title:focus,
div.v-input__slot:focus,
.v-btn--fab:focus-within:before,
button:focus-within:focus,
a:focus-within,
div.v-list-item:focus-within,
div.chat-card:focus-within,
.v-input__icon--clear:focus-within {
  outline: 0 !important;
  -webkit-box-shadow: 0 0 0 3px #9d99987d !important;
  box-shadow: 0 0 0 3px #9d99987d !important;
}

a.leopard-img:focus {
  display: flex;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  outline: 0;
  background: rgba(115, 13, 13, 0.19);
  -webkit-box-shadow: 0 0 0 3px #9d99987d !important;
  box-shadow: 0 0 0 3px #9d99987d !important;
}

#leopard-chat-toolbar-title:focus {
  padding: 5px !important;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  outline: 0;
  background: rgba(255, 255, 255, 0.19);
  -webkit-box-shadow: 0 0 0 3px #9d99987d !important;
  box-shadow: 0 0 0 3px #9d99987d !important;
}

.v-input__icon--clear i {
  outline: 0;
}

div.teneo-footer:focus-within {
  outline: 0;
  -webkit-box-shadow: 0px 2px 11px 0px rgba(0, 0, 0, 0.23);
  box-shadow: 0px 2px 11px 0px rgba(0, 0, 0, 0.23);
}

.pulse {
  overflow: visible;
  position: relative;
}

.pulse::before {
  display: block;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background-color: rgba(17, 18, 25, 0.4) !important;
  content: "";
  -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, transform 0.3s;
  transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s;
  -webkit-animation: pulse-animation 1s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  animation: pulse-animation 4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@-webkit-keyframes pulse-animation {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  10%,
  100% {
    opacity: 0;
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}

@keyframes pulse-animation {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  10%,
  100% {
    opacity: 0;
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}

.light-scroll::-webkit-scrollbar {
  width: 10px;
  height: 14px;
  background: #f5f5f5;
}

.dark-scroll::-webkit-scrollbar {
  width: 10px;
  height: 14px;
  background: #424242;
}

.dark-scroll::-webkit-scrollbar-thumb {
  background: #262626;
}

::-webkit-scrollbar-thumb {
  background: #d8d8d8;
}

::-webkit-scrollbar-corner {
  background: black;
}

.headline {
  font-size: 1.4em !important;
}

#chat-open-close-button {
  position: fixed;
  right: 60px;
  bottom: 60px;
}

.move-button-left-float {
  right: calc(390px + 5%) !important;
}

.move-button-left {
  right: 390px !important;
}

#teneo {
  position: initial !important;
  width: 360px;
  word-break: break-word;
}

.teneo-toolbar-float {
  border: 0px solid #000000;
  -moz-border-radius: 13px 13px 0px 0px !important;
  -webkit-border-radius: 13px 13px 0px 0px !important;
  border-radius: 13px 13px 0px 0px !important;
}

.teneo-toolbar-embed {
  -moz-border-radius: 13px 13px 0 0 !important;
  -webkit-border-radius: 13px 13px 0 0 !important;
  border-radius: 13px 13px 0 0 !important;
}

.show-the-chat {
  right: 0 !important;
}

.application-float {
  position: fixed;
  top: 10%;
  right: 5% !important;
  height: 80vh !important;
  max-height: 80vh !important;
  -moz-border-radius: 13px !important;
  -webkit-border-radius: 13px !important;
  border-radius: 13px !important;
}

.footer-float {
  z-index: 1 !important;
  -moz-border-bottom-right-radius: 13px;
  -webkit-border-bottom-right-radius: 13px;
  border-bottom-right-radius: 13px;
  -moz-border-bottom-left-radius: 13px;
  -webkit-border-bottom-left-radius: 13px;
  border-bottom-left-radius: 13px;
}

.v-application {
  overflow: inherit;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  max-width: 360px;
  height: 100vh !important;
  max-height: 100vh;
  margin: auto;
}

.v-application--wrap {
  min-height: inherit !important;
}

.content-area {
  /* height: calc(100% - 64px); */
  padding: unset;
}

.v-navigation-drawer {
  left: auto !important;
}

iframe#site-frame {
  overflow: hidden;
  position: absolute;
  z-index: -100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.contract-iframe {
  width: calc(100% - 360px) !important;
  transition: width 1500ms;
  /* transition-delay: 3s; */
  /* transition-property: all; */
  /* transition-timing-function: linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|steps(int,start|end)|cubic-bezier(n,n,n,n)|initial|inherit; */
  transition-timing-function: ease-out;
}

.v-expansion-panel__header {
  height: auto !important;
  padding-right: 1.5em;
  padding-left: 1.5em;
}

@media only screen and (max-height: 480px) {
  .leopard-alternative-views {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(100vh - 64px);
  }

  .v-application {
    max-width: 360px !important;
    height: 100% !important;
    max-height: 100% !important;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
    border-radius: unset;
  }

  .application-float {
    top: 0;
    right: 5% !important;
    height: 100vh !important;
    max-height: 100vh !important;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
    border-radius: unset;
  }

  .application-mobile {
    height: calc(var(--vh, 1vh) * 100) !important;
    min-height: calc(var(--vh, 1vh) * 100) !important;
  }

  .application-embed {
    -moz-border-radius: 13px !important;
    -webkit-border-radius: 13px !important;
    border-radius: 13px !important;
  }

  .teneo-toolbar-float,
  .v-system-bar {
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
    border-radius: unset !important;
  }

  .teneo-toolbar-embed-fullscreen {
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset 0 0 !important;
    border-radius: unset !important;
  }
}

@media only screen and (max-width: 480px) {
  .leopard-alternative-views {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: calc(100vh - 64px);
  }

  #teneo,
  .v-toolbar,
  .v-overlay {
    width: 100% !important;
  }

  .v-application {
    position: fixed;
    top: 0;
    right: 0 !important;
    bottom: 0;
    max-width: 100% !important;
    height: 100% !important;
    max-height: 100% !important;
    margin: auto;
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
    border-radius: unset !important;
  }

  .application-float {
    top: 0;
    right: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
    border-radius: unset !important;
  }

  .application-mobile {
    height: calc(var(--vh, 1vh) * 100) !important;
    min-height: calc(var(--vh, 1vh) * 100) !important;
  }

  .application-embed {
    -moz-border-radius: 13px !important;
    -webkit-border-radius: 13px !important;
    border-radius: 13px !important;
  }

  .teneo-toolbar-float,
  .v-system-bar {
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
    border-radius: unset !important;
  }
}
</style>
