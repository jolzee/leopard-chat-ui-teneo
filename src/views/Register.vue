<template>
  <v-row no-gutters align="start" justify="start" class="mx-3 fill-height">
    <v-col cols="12" class="mt-2">
      <p class="subheading font-weight-medium">
        Choose one of the following sign up methods.
      </p>
    </v-col>
    <v-col cols="12">
      <v-btn
        color="#375A9A"
        class="white--text teneo-social-btn px-1 mr-1 mb-1"
        @click="loginSocial('facebook')"
      >
        <v-icon left light class="ml-1">mdi-facebook-box</v-icon>
        Facebook
      </v-btn>
      <v-btn
        color="#EE4036"
        class="white--text teneo-social-btn px-1 mr-1 mb-1"
        @click="loginSocial('google')"
      >
        <v-icon left light class="ml-1">mdi-google-plus</v-icon>
        Google+
      </v-btn>
      <v-btn
        color="#464646"
        class="white--text teneo-social-btn px-1 mr-0 mb-1"
        @click="loginSocial('facebook')"
      >
        <v-icon left light class="ml-1">mdi-github-circle</v-icon>
        GitHub
      </v-btn>
    </v-col>
    <v-col cols="12" class="mt-2">
      <p class="subheading font-weight-medium">
        Or signup using your email address.
      </p>
    </v-col>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent="registerUser"
    >
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
              label="Password"
              hint="At least 6 characters"
              counter
              @click:append="showPassword = !showPassword"
            ></v-text-field>
          </v-col>
          <v-col cols="6" class="my-0 py-0">
            <v-btn type="submit" @click="registerUser" color="success">
              Sign Up
            </v-btn>
          </v-col>
          <v-col v-if="errorMessage" cols="6">
            <v-alert :value="true" type="info">
              {{ errorMessage }}
            </v-alert>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Register.vue");
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
        required: value => !!value || "Required",
        min: value => (value && value.length >= 6) || "Min 6 characters",
        emailRules: value => {
          if (value) {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || "Invalid e-mail";
          }
          return "Email is required";
        }
      }
    };
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
  computed: {}
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
