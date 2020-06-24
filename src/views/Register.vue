<template>
  <v-row
    no-gutters
    align="start"
    justify="start"
    class="px-3 mx-0 fill-height leopard-alternative-views"
  >
    <v-col cols="12" class="mt-2">
      <p class="subheading font-weight-medium">{{ $t("social.register.title") }}</p>
    </v-col>
    <v-col cols="12" class="d-flex justify-center flex-wrap mb-6">
      <v-btn
        v-if="isAuthProviderEnabled('microsoft')"
        color="#375A9A"
        class="white--text teneo-social-btn px-1 mr-1 mb-1"
        @click="loginSocial('microsoft')"
        aria-label="Microsoft opens in a new window"
      >
        <v-icon left light class="ml-1">mdi-microsoft</v-icon>Microsoft
      </v-btn>
      <v-btn
        v-if="isAuthProviderEnabled('facebook')"
        color="#375A9A"
        aria-label="Facebook opens in a new window"
        class="white--text teneo-social-btn px-1 mr-1 mb-1"
        @click="loginSocial('facebook')"
      >
        <v-icon left light class="ml-1">mdi-facebook</v-icon>Facebook
      </v-btn>
      <v-btn
        v-if="isAuthProviderEnabled('google')"
        color="#EE4036"
        aria-label="Google opens in a new window"
        class="white--text teneo-social-btn px-1 mr-1 mb-1"
        @click="loginSocial('google')"
      >
        <v-icon left light class="ml-1">mdi-google</v-icon>Google+
      </v-btn>
      <v-btn
        v-if="isAuthProviderEnabled('facebook')"
        color="#464646"
        aria-label="Github opens in a new window"
        class="white--text teneo-social-btn px-1 mr-0 mb-1"
        @click="loginSocial('facebook')"
      >
        <v-icon left light class="ml-1">mdi-github</v-icon>GitHub
      </v-btn>
    </v-col>
    <!-- <v-col cols="12" class="mt-2">
      <p
        class="subheading font-weight-medium"
      >Or sign up using your email address. (All fields required)</p>
    </v-col>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="registerUser">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="displayName"
              :rules="[rules.required]"
              label="Name"
              clearable
              autocomplete="off"
              required
              append-icon="mdi-account-card-details-outline"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="[rules.emailRules]"
              label="E-mail"
              clearable
              autocomplete="off"
              required
              append-icon="mdi-at"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="[rules.required, rules.min]"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              clearable
              autocomplete="off"
              label="Password (Min 6 characters)"
              hint="At least 6 characters"
              counter
              @click:append="showPassword = !showPassword"
            ></v-text-field>
          </v-col>
          <v-col v-if="errorMessage" cols="12">
            <v-alert :value="true" type="info">{{ errorMessage }}</v-alert>
          </v-col>
          <v-col cols="12" class="my-0 py-0">
            <v-btn type="submit" @click="registerUser" color="success" class="mr-3">Sign Up</v-btn>
            <v-btn
              color="primary"
              aria-label="Back to Chat Bot"
              ripple
              to="/"
            >{{ $t('back.to.chat.button') }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>-->
    <v-col cols="12" class="d-flex justify-center flex-wrap">
      <v-btn color="primary" aria-label="Back to Chat Bot" ripple to="/">
        {{
        $t("back.to.chat.button")
        }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Register.vue");
import { mapGetters } from "vuex";
export default {
  name: "register",
  components: {},
  data() {
    return {
      displayName: "",
      email: "",
      errorMessage: "",
      password: "",
      valid: false,
      showPassword: false,
      rules: {
        required: value => !!value || "Error: Required",
        min: value => (value && value.length >= 6) || "Error: Min 6 characters",
        emailRules: value => {
          if (value) {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || "Error: Invalid e-mail";
          }
          return "Error: Email is required";
        }
      }
    };
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        let element = document.getElementById("leopard-chat-toolbar-title");
        if (element) {
          element.focus();
        }
      }, 100);
    });
  },
  beforeRouteLeave(from, to, next) {
    this.$emit("closeMenu");
    next();
  },
  updated() {
    let elements = document.getElementsByClassName("v-messages__message");
    elements.forEach(element => {
      element.setAttribute("aria-live", "polite");
    });
  },
  methods: {
    hideErrorMessage() {
      this.errorMessage = "";
    },
    loginSocial(socialProvider) {
      this.$store
        .dispatch("loginSocial", socialProvider)
        .then(() => {
          if (this.$router.currentRoute.path !== "/") {
            this.$router.push("/"); // make sure we show the main chat window
          }
        })
        .catch(message => {
          this.errorMessage = message;
          setTimeout(this.hideErrorMessage, 2000);
        });
    },
    registerUser() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch("registerUserWithUsernameEmailPassword", {
            displayName: this.displayName,
            email: this.email,
            password: this.password
          })
          .then(() => {
            if (this.$router.currentRoute.path !== "/") {
              this.$router.push("/"); // make sure we show the main chat window
            }
          })
          .catch(message => {
            this.errorMessage = message;
            setTimeout(this.hideErrorMessage, 2000);
          });
      }
    }
  },
  computed: {
    ...mapGetters([
      "isAuthProviderEnabled"
    ])
  }
};
</script>

<style>
.teneo-social-btn {
  justify-content: left !important;
  text-transform: unset;
}

.teneo-social-btn .v-btn__content {
  justify-content: left !important;
}
</style>
