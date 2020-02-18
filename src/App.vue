<template>
  <div>
    <v-app v-if="showButtonOnly" :dark="$vuetify.theme.dark" class="application-button">
      <div id="chat-open-close-button-embed" @click="openEmbedButton">
        <v-fab-transition>
          <v-btn
            v-show="showChatButton"
            id="leopard-embed-open-close-button"
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
      <!-- <AssistiveText ref="assistiveText" v-model="accessibleAnouncement"></AssistiveText> -->
      <transition
        name="system-bar-transition"
        enter-active-class="animated fadeInRightBig"
        leave-active-class="animated fadeOutRightBig"
      >
        <v-system-bar
          v-if="!maximizeChat"
          id="leopard-system-bar-minimized"
          window
          tabindex="0"
          color="primary"
          accesskey="+"
          :class="`elevation-4 leopard-system-bar ${textColor('primary')}`"
          style=" border-right: 4px solid yellowgreen !important;border-left: 4px solid yellowgreen !important;"
          @click="maximizeChat = true"
          @keydown.enter.prevent="maximizeChat = true"
        >
          <v-icon color="secondary">mdi-message-text</v-icon>
          <span>Continue conversation..</span>
          <v-spacer></v-spacer>
          <v-icon color="secondary">mdi-arrow-expand-all</v-icon>
        </v-system-bar>
      </transition>
      <template v-if="maximizeChat">
        <div v-if="!embed" id="chat-open-close-button">
          <v-fab-transition>
            <v-btn
              v-show="showChatButton && !isChatOpen"
              fab
              dark
              accesskey="/"
              color="primary"
              aria-roledescription="A Chat Interface with a Virtual Agent"
              :aria-label="isChatOpen ? 'Close Chat' : 'Open Chat'"
              elevation="2"
              tabindex="0"
              :class="
                `leopard-open-close-button ${textColor('primary')} ${
                  pulseButton && !isChatOpen ? 'pulse' : ''
                }`
              "
              :style="customCssButtonToolbar"
              @click="toggleChat"
            >
              <v-icon v-text="isChatOpen ? 'mdi-close' : 'mdi-message-text'"></v-icon>
            </v-btn>
          </v-fab-transition>
        </div>

        <!-- start menu -->
        <transition
          name="menu-transition"
          enter-active-class="animated slideInRight"
          leave-active-class="animated slideOutRight"
        >
          <v-navigation-drawer
            v-if="drawer && isChatOpen"
            v-model="drawer"
            app
            :clipped="clipped"
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
              <v-col class="primary darken-2 pa-0 ma-0 elevation-2" style="height:64px">
                <div class="text-center pa-5 pt-4">
                  <h1
                    id="leopard-first-drawer-item"
                    tabindex="-1"
                    class="headline white--text font-weight-medium"
                  >Chat Menu</h1>
                </div>
              </v-col>
            </v-row>

            <v-list v-model="navigationDrawerModel" role="list" class="px-2 mt-1">
              <div role="listitem">
                <v-list-item
                  key="menuBackToChat"
                  ripple
                  tag="a"
                  aria-label="Back to Chat Bot"
                  value="true"
                  @click="backToChat"
                >
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">mdi-comment-arrow-left-outline</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">Back to chat</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <div v-for="(menuItem, i) in activeMenuItems" :key="i + 'menuItem'" role="listitem">
                <v-list-item ripple :aria-label="menuItem.ariaLabel" :to="menuItem.route">
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">{{ menuItem.icon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title
                      class="subheading"
                      :class="menuClassText"
                    >{{ $t(menuItem.titleKey) }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <!-- toggle brightness -->
              <div role="listitem">
                <v-list-item
                  key="menuItemTheme"
                  ripple
                  tag="a"
                  value="true"
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
                    <v-list-item-title class="subheading" :class="menuClassText">
                      {{
                      $vuetify.theme.dark ? "Light Mode" : "Dark Mode"
                      }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>
              <!-- close button -->
              <div role="listitem">
                <v-list-item
                  key="menuCloseChatMenu"
                  tag="a"
                  ripple
                  aria-label="Close menu"
                  value="true"
                  @click="drawer = false"
                >
                  <v-list-item-action>
                    <v-icon medium :class="menuClass">mdi-backburger</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title class="subheading" :class="menuClassText">Close</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </div>

              <!-- logout -->
              <v-list-item
                v-if="authenticated"
                key="menuChatLogout"
                ripple
                role="listitem"
                aria-label="Logout of chat bot"
                value="true"
                @click="logout()"
              >
                <v-list-item-action>
                  <v-icon medium :class="menuClass">mdi-logout-variant</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title
                    class="subheading"
                    :class="menuClassText"
                  >{{ $t("menu.logout") }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <template v-slot:append>
              <v-row
                v-if="keepBranding()"
                align="center"
                justify="center"
                class="primary darken-2"
                style="height:67px"
              >
                <div class="pa-2">
                  <a
                    href="https://www.artificial-solutions.com/"
                    class="leopard-img"
                    target="_blank"
                    aria-label="Artificial Solutions information will open in a new window"
                  >
                    <img
                      src="@/assets/as-logo.png"
                      alt="Artificial Solutions logo"
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
            v-if="isChatOpen"
            id="teneo"
            :aria-hidden="drawer || hide508"
            :inert="drawer || (embed && hide508)"
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
                      id="leopardNavMenuButton"
                      icon
                      text
                      tile
                      small
                      ripple
                      :color="isLightColor('primary') ? 'black' : 'white'"
                      accesskey="m"
                      :aria-label="drawer ? 'Hide Chat Bot Menu' : 'Chat Bot Menu'"
                      class="embed-button-center ml-0"
                      @click.stop="drawer = !drawer"
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

                <template v-if="embed">
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

              <v-content id="scrolling-techniques content-area" app class="pt-0">
                <OverlayAlert />
                <router-view
                  v-if="['config'].indexOf($route.name) === -1"
                  :drawer="drawer"
                  @closeMenu="drawer = false"
                />
                <teneo-modal></teneo-modal>
              </v-content>
            </div>
          </div>
        </transition>
        <v-row v-if="importDialog" justify="center">
          <v-dialog v-model="importDialog" persistent max-width="600">
            <v-card>
              <v-card-title class="headline">Solution Import</v-card-title>
              <v-card-text>
                {{ importDialogMessages.message }}
                <br />
                <br />
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Name</th>
                        <th class="text-left">Deep Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{ importDialogMessages.name }}</td>
                        <td>{{ importDialogMessages.deepLink }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <br />
                <v-alert border="top" colored-border type="warning" elevation="2">
                  Accepting will overwrite other solutions with the same name or deep
                  link.
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="grey lighten-5" @click="importDialog = false">Cancel</v-btn>
                <v-btn color="green lighten-2" @click="importSolutionFromUrl">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </template>
    </v-app>
  </div>
</template>

<script>
import "wicg-inert/dist/inert.min";
import { mapGetters } from "vuex";
import { STORAGE_KEY } from "@/constants/solution-config-default";
import { debounce, sendMessageToParent, isLight } from "@/utils/utils";
// import AssistiveText from "@/components/AssistiveText.vue";
import jsonpack from "jsonpack/main";

const logger = require("@/utils/logging").getLogger("App.vue");

// import { createDetailsWidget } from "@livechat/agent-app-sdk";
// import { createMessageBoxWidget } from "@livechat/agent-app-sdk";

export default {
  components: { OverlayAlert: () => import("@/components/OverlayAlert") },
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
          icon: "mdi-message-settings-variant",
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
  computed: {
    ...mapGetters([
      "isLiveAgentAssist",
      "accessibleAnouncement",
      "accentStyling",
      "authenticated",
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

    hasDifferentHistory() {
      if (this.getLatestDialogHistory.length !== this.dialogs.length) {
        logger.debug(`Should show 'History' menu option`);
        return true;
      }
      logger.debug(`Should not show 'History' menu option`);
      return false;
    },
    shouldFloat() {
      logger.debug(`Show Leopard floating?`, this.float);
      if (this.float && this.$router.currentRoute.path !== "/config") {
        return true;
      }
      return false;
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
          }
          if ("when" in menuItem && typeof menuItem.when === "boolean") {
            return menuItem.when;
          }
          if ("when" in menuItem && typeof menuItem.when === "function") {
            return menuItem.when();
          }
          if (menuItem.route === "config") {
            return !this.hideConfigMenu;
          }
          if (!("when" in menuItem)) {
            return true;
          }
          return false;
        });
      }
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
        }
        if ("when" in menuItem && typeof menuItem.when === "boolean") {
          return menuItem.when;
        }
        if ("when" in menuItem && typeof menuItem.when === "function") {
          return menuItem.when();
        }
        if (menuItem.route === "config") {
          return !this.hideConfigMenu;
        }
        if (!("when" in menuItem)) {
          return true;
        }
        return false;
      });
    },
    toolbarStyle() {
      const result = this.customCssButtonToolbar;
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
      }
      if (this.$route.name === "help") {
        return screenReader + this.$t("menu.help");
      }
      if (this.$route.name === "about") {
        return screenReader + this.$t("menu.about");
      }
      if (this.$route.name === "register") {
        return screenReader + this.$t("menu.register");
      }
      if (this.$route.name === "login") {
        return screenReader + this.$t("menu.login");
      }
      return this.chatTitle;
    },
    toolbarColor() {
      return !this.$vuetify.theme.dark
        ? `primary ${isLight(this.theme.primary) ? "black" : "white"}--text`
        : `primary white--text`;
    }
  },
  watch: {
    drawer(isDrawerOpen) {
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
    this.$store.dispatch("setupFirebase");
    this.$store.dispatch("setupLiveChatAgentAssist"); // only enabled in certain scenario
  },
  mounted() {
    logger.info("In production: ", this.embed);
    if (this.embed) {
      this.isChatOpenLocalStorage();
    }
    this.$nextTick(function addResizeListeners() {
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
      this.importDialogMessages.name = this.importedSolution.name;
      this.importDialogMessages.deepLink = this.importedSolution.deepLink;
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

  methods: {
    keepBranding() {
      return !window.leopardConfig.hideArtificalSolutionsBranding;
    },
    isLightColor(themeColorName) {
      if (!this.$vuetify.theme.dark) {
        const hexColor = this.theme[themeColorName];
        logger.debug(`Checking ${themeColorName} color: ${hexColor}`, this.theme);
        return isLight(hexColor);
      }
      return false;
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

      setTimeout(function setFocusOnSystemBar() {
        document.getElementById("leopard-system-bar-minimized").focus();
        const appElement = document.getElementById("app");
        appElement.setAttribute("style", "");
      }, 1500);
    },
    isChatOpenLocalStorage() {
      let isChatOpen = localStorage.getItem("isChatOpen");
      if (isChatOpen === null) {
        isChatOpen = false;
      } else {
        isChatOpen = JSON.parse(isChatOpen);
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
      if (window.parent) {
        window.parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specifiy origin for each post.
        logger.debug(`Message from Leopard >> Embed : ${message}`);
      }
      return true;
    },
    importSolutionFromUrl() {
      this.importDialog = false;

      let existingSolutionsWithName = this.config.solutions.findIndex(
        solution => solution.name === this.importedSolution.name
      );
      const existingSolutionsWithDeepLink = this.config.solutions.findIndex(
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
      this.config.activeSolution = this.importedSolution.name;
      const deepLinkUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?dl=${this.importedSolution.deepLink}`;
      localStorage.setItem(`${STORAGE_KEY}config`, JSON.stringify(this.config));
      logger.debug(`Deep Link Url: `, deepLinkUrl);
      window.location.href = deepLinkUrl;
    },
    closeChatEmbedded() {
      localStorage.setItem("isChatOpen", "false");
      sendMessageToParent("hideLeopard");
      this.calculateMobileHeight(); // only called on mobile devices
      if (window.leopardConfig.killSessionOnCloseEmbed) {
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
        function openChatWindow() {
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
        const chatButton = document.getElementById("chat-open-close-button");
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
          function toggleChatDisplay() {
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
      this.$store.dispatch("endSession").then(() => {
        this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session

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
        if (this.embed && window.parent) {
          const parentHeight = window.parent.getLeopardElementHeight();
          // let parentHeight = localStorage.getItem(STORAGE_KEY + "parentHeight");
          logger.debug(`Frame Height: ${parentHeight}`);
          vh = parentHeight * 0.01;
          this.parentHeight = parentHeight;
          logger.debug(`Parent Height: ${parentHeight}`);
        } else {
          vh = window.innerHeight * 0.01;
        }

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
        const that = this;
        this.$store
          .dispatch("login")
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
        // animate the IFrame
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }
        const chatButton = document.getElementById("chat-open-close-button");

        if (this.$router.currentRoute.path !== "/") {
          this.$router.push({ name: "chat" }); // make sure we show the main chat window
        }

        // this.$store.commit("SHOW_CHAT_LOADING"); // display the loading spinner
        const isChatUiFloating = this.float;
        setTimeout(
          function handleButtonAndFrameMovement() {
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
      // animate the IFrame

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
              function showChatButton() {
                this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
              }.bind(this),
              1500
            ); // only show the chat button after a successful login
          })
          .catch(err => {
            logger.error("ERROR OPENING AND LOGGING IN TO CHAT: ", err);
          });
      } else {
        const chatButton = document.getElementById("chat-open-close-button");
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
        this.$store.dispatch("endSession").then(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session
          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function showChatLoadingAnimation() {
              this.$store.commit("SHOW_CHAT_LOADING");
            }.bind(this),
            100
          );

          setTimeout(
            function hideChatShowButton() {
              const appElement = document.getElementById("app");
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
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.2/animate.min.css";

.teneo-icon {
  opacity: 0.7 !important;
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
  cursor: defaul;
}

#leopard-system-bar-minimized:focus {
  outline: 0;
  box-shadow: 0 0 0 3px rgba(17, 18, 25, 0.4) !important;
}

.leopard-open-close-button.v-btn--fab:hover {
  color: rgba(12, 161, 22, 0.552) !important;
}

@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  .leopard-open-close-button.v-btn--fab:hover {
    color: rgb(185, 33, 6) !important;
  }

  #leopard-chat-toolbar-title:focus,
  div.v-input__slot:focus,
  .v-btn--fab:focus-within::before,
  button:focus-within:focus,
  a:focus-within,
  div.v-list-item:focus-within,
  div.chat-card:focus-within,
  .v-input__icon--clear:focus-within {
    outline: 0 !important;
    -webkit-box-shadow: 0 0 0 3px black !important;
    box-shadow: 0 0 0 3px black !important;
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
    background-color: rgb(139, 139, 214) !important;
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

.leopard-code {
  padding-right: 3px;
  padding-left: 3px;
  color: #fafafa;
  background-color: #000;
  font-family: "Fira Code", Consolas, Monaco, "Lucida Console", "Liberation Mono",
    "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New";
}

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
  border-radius: 0 !important;
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
  margin: 0.5em 0;
  padding: 0.5em 10px;
  border-left: 6px solid #d7d7d7;
  quotes: "\201C""\201D""\2018""\2019";
}
blockquote::before {
  margin-right: 0.25em;
  color: #d7d7d7;
  font-size: 4em;
  line-height: 0.1;
  vertical-align: -0.4em;
  content: open-quote;
}
blockquote p {
  display: inline;
}

#leopard-chat-toolbar-title:focus,
div.v-input__slot:focus,
.v-btn--fab:focus-within::before,
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
  -webkit-box-shadow: 0 2px 11px 0 rgba(0, 0, 0, 0.23);
  box-shadow: 0 2px 11px 0 rgba(0, 0, 0, 0.23);
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
  border: 0 solid #000;
  -moz-border-radius: 13px 13px 0 0 !important;
  -webkit-border-radius: 13px 13px 0 0 !important;
  border-radius: 13px 13px 0 0 !important;
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
