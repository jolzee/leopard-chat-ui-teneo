<template>
  <v-row align="start" justify="start" class="mx-2 fill-height">
    <v-col cols="12">
      <p class="subheading font-weight-medium">
        Login with one of the following methods.
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
        class="white--text teneo-social-btn px-1 mb-1 mr-0"
        @click="loginSocial('github')"
      >
        <v-icon left light class="ml-1">mdi-github-circle</v-icon>
        GitHub
      </v-btn>
    </v-col>
    <v-col cols="12">
      <p class="subheading font-weight-medium">
        Alternatively use your email and password.
      </p>
    </v-col>
    <v-form
      ref="form"
      v-model="valid"
      @submit.prevent="loginUser"
      lazy-validation
    >
      <v-container fluid>
        <v-row>
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
          <v-col cols="12" class="ml-0">
            <v-btn @click="loginUser" color="success" type="submit">
              Login
            </v-btn>
          </v-col>
          <v-col v-if="errorMessage" cols="12">
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
export default {
  name: "login",
  components: {},
  data() {
    return {
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
    loginUser() {
      if (this.$refs.form.validate()) {
        this.$store
          .dispatch("loginUserWithUsernameEmailPassword", {
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
            try {
              setTimeout(this.hideErrorMessage, 2000);
            } catch (e) {
              this.$log.error(e);
            }
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
