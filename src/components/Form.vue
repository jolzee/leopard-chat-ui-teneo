<template>
  <ValidationObserver
    ref="observer"
    v-slot="{ invalid, validated, passes, validate }"
  >
    <v-row justify="center">
      <v-dialog
        v-model="dialog"
        persistent
        scrollable
        :fullscreen="fullscreen"
        :max-width="formConfig.maxWidth ? formConfig.maxWidth : 600"
        content-class="teneo-form"
      >
        <v-card class="mx-auto">
          <v-fade-transition>
            <v-overlay
              absolute
              :value="overlay"
              color="primary"
            >

              <v-alert
                border="left"
                light
                colored-border
                type="info"
                elevation="2"
                @click="overlay = false"
              >
                {{formConfig.validationFailedMessage ? formConfig.validationFailedMessage : "Please complete all required fields"}}
              </v-alert>
            </v-overlay>
          </v-fade-transition>
          <v-system-bar
            color="primary darken-2"
            dark
          >
            <v-spacer></v-spacer>

            <v-icon @click="fullscreen = !fullscreen">{{ fullscreen ? 'mdi-window-restore' : 'mdi-window-maximize' }}</v-icon>

            <v-icon @click="close">mdi-close</v-icon>
          </v-system-bar>

          <v-app-bar
            dark
            color="primary"
            dense
          >
            <v-toolbar-title>{{ formConfig.title }}</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-app-bar>

          <v-card-text
            style="height: 80%;"
            class="px-3 py-0"
          >

            <v-container fluid>
              <v-row
                align="center"
                justify="center"
              >
                <v-col
                  v-for="(field, index) in formConfig.fields"
                  :key="uuid + index"
                  cols="12"
                  class="pa-2"
                >

                  <v-img
                    v-if="field.fieldType === 'image'"
                    :src="field.src"
                    aspect-ratio="1"
                    :max-width="field.maxWidth ? field.maxWidth : '100%'"
                    :max-height="field.maxHeight ? field.maxHeight : '600'"
                    :alt="field.alt ? field.alt : 'Random Picture'"
                  ></v-img>

                  <div
                    v-if="field.fieldType === 'html'"
                    v-html="field.label"
                    :class="field.classes ? field.classes.join(' ') : ''"
                  ></div>

                  <header
                    v-if="field.fieldType === 'header'"
                    v-html="field.label"
                    :class="field.classes ? field.classes.join(' ') : ''"
                  ></header>

                  <hr v-if="field.fieldType === 'divider'" />

                  <v-alert
                    v-if="field.fieldType === 'alert'"
                    :v-model="true"
                    :type="field.type ? field.type : 'info'"
                    :border="field.border ? field.border : 'left'"
                    :elevation="field.elevation ? field.elevation : 2"
                    :colored-border="field.coloredBorder ? field.coloredBorder : true"
                    :icon="field.mdiIcon ? 'mdi-' + field.mdiIcon : false"
                    :dense="field.dense ? field.dense : false"
                    :prominent="field.prominent ? field.prominent : false"
                    :tile="field.tile ? field.tile : false"
                    :outlined="field.outlined ? field.outlined : false"
                    class="mb-0"
                  >
                    {{ field.text }}
                  </v-alert>

                  <ValidationProvider
                    v-if="field.fieldType === 'text'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-text-field
                      v-model="formData[field.name]"
                      :label="field.label ? field.label : ''"
                      :success="valid"
                      :error-messages="errors"
                      :hint="field.hint ? field.hint : ''"
                      :placeholder="field.placeholder ? field.placeholder : ''"
                      :value="field.initialValue ? field.initialValue : ''"
                      :solo="field.type && field.type === 'solo' ? true : false"
                      :filled="field.type && field.type === 'filled' ? true : false"
                      :outlined="field.type && field.type === 'outlined' ? true : false"
                      :clearable="field.clearable ? field.clearable : false"
                      :persistent-hint="field.persistantHint ? field.persistantHint : false"
                      :dense="field.dense ? field.dense : false"
                      :counter="field.counter ? field.counter : false"
                      :append-icon="field.icons && field.icons.append ? 'mdi-' + field.icons.append : ''"
                      :append-outer-icon="field.icons && field.icons.appendOuter ? 'mdi-' + field.icons.appendOuter : ''"
                      :prepend-icon="field.icons && field.icons.prepend ? 'mdi-' + field.icons.prepend : ''"
                      :prepend-inner-icon="field.icons && field.icons.prependInner ? 'mdi-' + field.icons.prependInner : ''"
                      :mask="field.mask ? field.mask : 100"
                      :prefix="field.prefix ? field.prefix : ''"
                      :suffix="field.suffix ? field.suffix : ''"
                    ></v-text-field>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'textarea'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-textarea
                      v-model="formData[field.name]"
                      :success="valid"
                      :error-messages="errors"
                      :auto-grow="field.autoGrow ? field.autoGrow : true"
                      :label="field.label ? field.label : ''"
                      :placeholder="field.placeholder ? field.placeholder : ''"
                      :value="field.initialValue ? field.initialValue : ''"
                      :hint="field.hint ? field.hint : ''"
                      :solo="field.type && field.type === 'solo' ? true : false"
                      :filled="field.type && field.type === 'filled' ? true : false"
                      :outlined="field.type && field.type === 'outlined' ? true : false"
                      :clearable="field.clearable ? field.clearable : false"
                      :persistent-hint="field.persistantHint ? field.persistantHint : false"
                      :dense="field.dense ? field.dense : false"
                      :rows="field.rows ? field.rows : false"
                      :counter="field.counter ? field.counter : false"
                      :append-icon="field.icons && field.icons.append ? 'mdi-' + field.icons.append : ''"
                      :append-outer-icon="field.icons && field.icons.appendOuter ? 'mdi-' + field.icons.appendOuter : ''"
                      :prepend-icon="field.icons && field.icons.prepend ? 'mdi-' + field.icons.prepend : ''"
                      :prepend-inner-icon="field.icons && field.icons.prependInner ? 'mdi-' + field.icons.prependInner : ''"
                      :mask="field.mask ? field.mask : 100"
                      :prefix="field.prefix ? field.prefix : ''"
                      :suffix="field.suffix ? field.suffix : ''"
                    ></v-textarea>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'comboBox'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-autocomplete
                      v-model="formData[field.name]"
                      :name="field.name"
                      :success="valid"
                      :error-messages="errors"
                      :items="field.items ? field.items : []"
                      :chips="field.chips ? field.chips : false"
                      :label="field.label ? field.label : ''"
                      :hint="field.hint ? field.hint : ''"
                      :value="field.initialValue ? field.initialValue : ''"
                      :multiple="field.multiple ? field.multiple : true"
                      :hide-selected="field.hideSelected ? field.hideSelected : true"
                      :clearable="field.clearable ? field.clearable : true"
                      :dense="field.dense ? field.dense : false"
                      :deletable-chips="field.deletableChips ? field.deletableChips : true"
                      :persistent-hint="field.persistantHint ? field.persistantHint : true"
                      :solo="field.type && field.type === 'solo' ? true : false"
                      :filled="field.type && field.type === 'filled' ? true : false"
                      :outlined="field.type && field.type === 'outlined' ? true : false"
                      :open-on-clear="field.openOnClear ? field.openOnClear : true"
                      :append-icon="field.icons && field.icons.append ? 'mdi-' + field.icons.append : ''"
                      :append-outer-icon="field.icons && field.icons.appendOuter ? 'mdi-' + field.icons.appendOuter : ''"
                      :prepend-icon="field.icons && field.icons.prepend ? 'mdi-' + field.icons.prepend : ''"
                      :prepend-inner-icon="field.icons && field.icons.prependInner ? 'mdi-' + field.icons.prependInner : ''"
                    >
                    </v-autocomplete>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'select'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-select
                      v-model="formData[field.name]"
                      :success="valid"
                      :error-messages="errors"
                      :items="field.items ? field.items : []"
                      :label="field.label ? field.label : ''"
                      :value="field.initialValue ? field.initialValue : ''"
                      :hint="field.hint ? field.hint : ''"
                      :chips="field.chips ? field.chips : false"
                      :multiple="field.multiple ? field.multiple : false"
                      :clearable="field.clearable ? field.clearable : true"
                      :deletable-chips="field.deletableChips ? field.deletableChips : true"
                      :persistent-hint="field.persistantHint ? field.persistantHint : true"
                      :dense="field.dense ? field.dense : false"
                      :solo="field.type && field.type === 'solo' ? true : false"
                      :filled="field.type && field.type === 'filled' ? true : false"
                      :outlined="field.type && field.type === 'outlined' ? true : false"
                      :append-icon="field.icons && field.icons.append ? 'mdi-' + field.icons.append : ''"
                      :append-outer-icon="field.icons && field.icons.appendOuter ? 'mdi-' + field.icons.appendOuter : ''"
                      :prepend-icon="field.icons && field.icons.prepend ? 'mdi-' + field.icons.prepend : ''"
                      :prepend-inner-icon="field.icons && field.icons.prependInner ? 'mdi-' + field.icons.prependInner : ''"
                    ></v-select>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'checkbox'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-checkbox
                      v-model="formData[field.name]"
                      :error-messages="errors"
                      :label="field.label ? field.label : ''"
                      :hint="field.hint ? field.hint : ''"
                      :dense="field.dense ? field.dense : false"
                      :persistent-hint="field.persistantHint ? field.persistantHint : true"
                      ripple
                    ></v-checkbox>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'switch'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-switch
                      v-model="formData[field.name]"
                      :error-messages="errors"
                      :color="field.color ? field.color : 'success'"
                      :label="field.label ? field.label : ''"
                      :hint="field.hint ? field.hint : ''"
                      :dense="field.dense ? field.dense : false"
                      :inset="field.inset ? field.inset : false"
                      :persistent-hint="field.persistantHint ? field.persistantHint : true"
                      ripple
                    ></v-switch>
                  </ValidationProvider>

                  <ValidationProvider
                    v-if="field.fieldType === 'radio'"
                    :rules="field.validations ? field.validations : ''"
                    v-slot="{ errors, valid }"
                  >
                    <v-radio-group
                      v-model="formData[field.name]"
                      :error-messages="errors"
                      :name="field.name ? field.name : 'radioGroup'"
                      :label="field.label ? field.label : 'dfdgdfhdfgdfhfgh'"
                      :hint="field.hint ? field.hint : ''"
                      :persistent-hint="field.persistantHint ? field.persistantHint : true"
                      :dense="field.dense ? field.dense : false"
                      :column="field.row && field.row === true ? false : true"
                      :row="field.row && field.row === true ? field.row : false"
                      :mandatory="field.mandatory ? field.mandatory : false"
                      :multiple="field.multiple ? field.multiple : false"
                      :append-icon="field.icons && field.icons.append ? 'mdi-' + field.icons.append : ''"
                      :prepend-icon="field.icons && field.icons.prepend ? 'mdi-' + field.icons.prepend : ''"
                    >

                      <v-radio
                        v-for="(item, index) in field.items"
                        :key="uuid + index"
                        :label="item.label"
                        :value="item.value"
                      ></v-radio>

                    </v-radio-group>
                  </ValidationProvider>
                </v-col>
              </v-row>
            </v-container>

          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>

            <v-btn @click="close">{{formConfig.button && formConfig.button.closeButtonText ? formConfig.button.closeButtonText : "Close"}}</v-btn>
            <v-btn @click="clear">{{formConfig.button && formConfig.button.clearButtonText ? formConfig.button.clearButtonText : "Clear"}}</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              v-if="formConfig.button"
              ripple
              @click="submit"
              :color="formConfig.button.color ? formConfig.button.color : ''"
            > {{ formConfig.button.text ? formConfig.button.text : "Submit" }} <v-icon
                v-if="formConfig.button.icon"
                right
                dark
              >{{ `mdi-${formConfig.button.icon}`}}</v-icon>
            </v-btn>
            <v-btn
              v-else
              color="primary"
              @click="submit"
              :disabled="invalid || !validated"
            >Submit</v-btn>
          </v-card-actions>
        </v-card>

      </v-dialog>

    </v-row>
  </ValidationObserver>
</template>
<script>
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { mask } from "vue-the-mask";
import { mapGetters } from "vuex";
export default {
  name: "Form",
  directives: { mask },
  components: {
    ValidationObserver,
    ValidationProvider
  },
  props: ["formConfig"],
  computed: {
    ...mapGetters(["uuid"])
  },
  mounted() {
    this.setDefaults();
  },
  data() {
    return {
      formData: {},
      dialog: true,
      fullscreen: false,
      overlay: false
    };
  },
  methods: {
    setDefaults() {
      this.formConfig.fields.forEach(field => {
        if (
          (field.fieldType === "switch" || field.fieldType === "checkbox") &&
          "initialValue" in field
        ) {
          this.formData[field.name] = field.initialValue;
        }
      });
    },
    close() {
      this.$emit("hideForm");
    },
    async clear() {
      this.formData = {};
      this.setDefaults();
      requestAnimationFrame(() => {
        this.$refs.observer.reset();
      });
    },
    async submit() {
      const isValid = await this.$refs.observer.validate();
      if (!isValid) {
        this.overlay = true;
        let that = this;
        setTimeout(function() {
          that.overlay = false;
        }, 1500);
      } else {
        // validated - good to go
        this.$store.commit("SHOW_PROGRESS_BAR");
        let params = "";
        if (this.formConfig.postback) {
          if (this.formConfig.postback.userInput) {
            this.$store.commit(
              "SET_USER_INPUT",
              this.formConfig.postback.userInput
            );
          }
          if (this.formConfig.postback.formDataUrlParam) {
            params = `&${this.formConfig.postback.formDataUrlParam}=`;
          } else {
            params = `&formData=`;
          }
          params += encodeURIComponent(JSON.stringify(this.formData));
        } else {
          this.$store.commit("SET_USER_INPUT", ""); // Clear user input
          params = `&formData=${encodeURIComponent(
            JSON.stringify(this.formData)
          )}`;
        }
        console.log(JSON.stringify(this.formData));
        this.$store.dispatch("sendUserInput", params).then(() => {
          this.$emit("completed");
          this.$emit("handleFocus");
          if (
            this.formConfig.postback &&
            this.formConfig.postback.confirmationAlert
          ) {
            this.$store.commit(
              "SHOW_MESSAGE_IN_CHAT",
              this.formConfig.postback.confirmationAlert
            );
          }
        });
      }
    }
  }
};
</script>
<style>
.teneo-form {
  overflow-x: hidden;
}
</style>
