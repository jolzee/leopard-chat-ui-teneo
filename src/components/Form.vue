<template>
  <ValidationObserver ref="observer" v-slot="{ invalid, validated }">
    <v-row align="start" justify="start" v-if="dialog">
      <v-dialog
        v-model="dialog"
        persistent
        scrollable
        :fullscreen="fullscreen || $vuetify.breakpoint.mdAndDown"
        :max-width="formConfig.maxWidth ? formConfig.maxWidth : 600"
        content-class="teneo-form resizable"
      >
        <v-card class="mx-auto">
          <v-fade-transition>
            <v-overlay absolute opacity="0.7" :value="overlay">
              <v-alert
                border="left"
                light
                colored-border
                type="info"
                elevation="2"
                @click="overlay = false"
              >
                {{
                formConfig.validationFailedMessage
                ? formConfig.validationFailedMessage
                : "Please complete all required fields"
                }}
              </v-alert>
            </v-overlay>
          </v-fade-transition>
          <v-system-bar color="primary darken-2" :class="{ 'popup-header': !fullscreen }" dark>
            <v-spacer></v-spacer>

            <v-icon @click="fullscreen = !fullscreen">
              {{
              fullscreen ? "mdi-window-restore" : "mdi-window-maximize"
              }}
            </v-icon>

            <v-icon @click="close">mdi-close</v-icon>
          </v-system-bar>

          <v-app-bar dark color="primary" dense>
            <v-toolbar-title>{{ formConfig.title }}</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-app-bar>

          <v-card-text
            style="height: 90%;"
            class="px-3 py-0"
            :class="{ 'dark-scroll': dark, 'light-scroll': !dark }"
          >
            <v-container fluid>
              <v-row align="start" justify="start">
                <v-col
                  v-for="(field, index) in formConfig.fields"
                  :key="uuid + index"
                  cols="12"
                  class="pa-2"
                >
                  <v-row class="mx-1">
                    <v-col
                      v-if="hasColumnDescription(field)"
                      cols="12"
                      :sm="hasColumnDescription(field) ? 4 : 12"
                      class="pl-0"
                    >
                      <v-subheader v-html="getColumnDescription(field)" class="pa-0"></v-subheader>
                    </v-col>
                    <v-col cols="12" :sm="hasColumnDescription(field) ? 8 : 12" class="pa-0">
                      <v-img
                        v-if="field.image"
                        :src="field.image.src"
                        contain
                        :max-width="
                          field.image.maxWidth ? field.image.maxWidth : '100%'
                        "
                        :max-height="
                          field.image.maxHeight ? field.image.maxHeight : '600'
                        "
                        :alt="
                          field.image.alt ? field.image.alt : 'Random Picture'
                        "
                      >
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular :size="50" indeterminate color="primary"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>

                      <div
                        v-if="field.html"
                        v-html="field.html.label"
                        :class="
                          field.html.classes ? field.html.classes.join(' ') : ''
                        "
                      ></div>

                      <header
                        v-if="field.header"
                        v-html="field.header.label"
                        :class="
                          field.header.classes
                            ? field.header.classes.join(' ')
                            : ''
                        "
                      ></header>

                      <hr v-if="field.divider" />

                      <v-alert
                        v-if="field.alert"
                        :type="field.alert.type ? field.alert.type : 'info'"
                        :border="
                          field.alert.border ? field.alert.border : 'left'
                        "
                        :elevation="
                          field.alert.elevation ? field.alert.elevation : 2
                        "
                        :colored-border="
                          field.alert.coloredBorder
                            ? field.alert.coloredBorder
                            : true
                        "
                        :icon="
                          field.alert.icon
                            ? 'mdi-' + field.alert.icon
                            : 'mdi-information'
                        "
                        :dense="field.alert.dense ? field.alert.dense : false"
                        :prominent="
                          field.alert.prominent ? field.alert.prominent : false
                        "
                        :tile="field.alert.tile ? field.alert.tile : false"
                        :outlined="
                          field.alert.outlined ? field.alert.outlined : false
                        "
                        class="mb-0"
                      >{{ field.alert.text }}</v-alert>

                      <ValidationProvider
                        v-if="field.textInput"
                        :rules="
                          field.textInput.validations
                            ? field.textInput.validations
                            : ''
                        "
                        v-slot="{ errors, valid }"
                      >
                        <v-text-field
                          v-model="formData[field.textInput.name]"
                          :name="field.textInput.name"
                          :label="
                            field.textInput.label ? field.textInput.label : ''
                          "
                          :success="valid"
                          :error-messages="errors"
                          :hint="
                            field.textInput.hint ? field.textInput.hint : ''
                          "
                          :placeholder="
                            field.textInput.placeholder
                              ? field.textInput.placeholder
                              : ''
                          "
                          :value="
                            field.textInput.initialValue
                              ? field.textInput.initialValue
                              : ''
                          "
                          :solo="
                            field.textInput.style && field.textInput.style.solo
                              ? true
                              : false
                          "
                          :filled="
                            field.textInput.style &&
                            field.textInput.style.filled
                              ? true
                              : false
                          "
                          :outlined="
                            field.textInput.style &&
                            field.textInput.style.outlined
                              ? true
                              : false
                          "
                          :flat="
                            field.textInput.style && field.textInput.style.flat
                              ? true
                              : false
                          "
                          :rounded="
                            field.textInput.style &&
                            field.textInput.style.rounded
                              ? true
                              : false
                          "
                          :shaped="
                            field.textInput.style &&
                            field.textInput.style.shaped
                              ? true
                              : false
                          "
                          :solo-inverted="
                            field.textInput.style &&
                            field.textInput.style.soloInverted
                              ? true
                              : false
                          "
                          :clearable="
                            field.textInput.clearable
                              ? field.textInput.clearable
                              : false
                          "
                          :persistent-hint="
                            field.textInput.persistentHint
                              ? field.textInput.persistentHint
                              : false
                          "
                          :dense="
                            field.textInput.dense
                              ? field.textInput.dense
                              : false
                          "
                          :counter="
                            field.textInput.counter
                              ? field.textInput.counter
                              : false
                          "
                          :append-icon="
                            field.textInput.icons &&
                            field.textInput.icons.append
                              ? 'mdi-' + field.textInput.icons.append
                              : ''
                          "
                          :append-outer-icon="
                            field.textInput.icons &&
                            field.textInput.icons.appendOuter
                              ? 'mdi-' + field.textInput.icons.appendOuter
                              : ''
                          "
                          :prepend-icon="
                            field.textInput.icons &&
                            field.textInput.icons.prepend
                              ? 'mdi-' + field.textInput.icons.prepend
                              : ''
                          "
                          :prepend-inner-icon="
                            field.textInput.icons &&
                            field.textInput.icons.prependInner
                              ? 'mdi-' + field.textInput.icons.prependInner
                              : ''
                          "
                          :mask="
                            field.textInput.mask ? field.textInput.mask : 100
                          "
                          :prefix="
                            field.textInput.prefix ? field.textInput.prefix : ''
                          "
                          :suffix="
                            field.textInput.suffix ? field.textInput.suffix : ''
                          "
                        ></v-text-field>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.textarea"
                        :rules="
                          field.textarea.validations
                            ? field.textarea.validations
                            : ''
                        "
                        v-slot="{ errors, valid }"
                      >
                        <v-textarea
                          v-model="formData[field.textarea.name]"
                          :name="field.textarea.name"
                          :success="valid"
                          :error-messages="errors"
                          :auto-grow="
                            field.textarea.autoGrow
                              ? field.textarea.autoGrow
                              : true
                          "
                          :label="
                            field.textarea.label ? field.textarea.label : ''
                          "
                          :placeholder="
                            field.textarea.placeholder
                              ? field.textarea.placeholder
                              : ''
                          "
                          :value="
                            field.textarea.initialValue
                              ? field.textarea.initialValue
                              : ''
                          "
                          :hint="field.textarea.hint ? field.textarea.hint : ''"
                          :solo="
                            field.textarea.style && field.textarea.style.solo
                              ? true
                              : false
                          "
                          :filled="
                            field.textarea.style && field.textarea.style.filled
                              ? true
                              : false
                          "
                          :outlined="
                            field.textarea.style &&
                            field.textarea.style.outlined
                              ? true
                              : false
                          "
                          :flat="
                            field.textarea.style && field.textarea.style.flat
                              ? true
                              : false
                          "
                          :rounded="
                            field.textarea.style && field.textarea.style.rounded
                              ? true
                              : false
                          "
                          :shaped="
                            field.textarea.style && field.textarea.style.shaped
                              ? true
                              : false
                          "
                          :solo-inverted="
                            field.textarea.style &&
                            field.textarea.style.soloInverted
                              ? true
                              : false
                          "
                          :clearable="
                            field.textarea.clearable
                              ? field.textarea.clearable
                              : false
                          "
                          :persistent-hint="
                            field.textarea.persistentHint
                              ? field.textarea.persistentHint
                              : false
                          "
                          :dense="
                            field.textarea.dense ? field.textarea.dense : false
                          "
                          :rows="field.textarea.rows ? field.textarea.rows : 5"
                          :counter="
                            field.textarea.counter
                              ? field.textarea.counter
                              : false
                          "
                          :append-icon="
                            field.textarea.icons && field.textarea.icons.append
                              ? 'mdi-' + field.textarea.icons.append
                              : ''
                          "
                          :append-outer-icon="
                            field.textarea.icons &&
                            field.textarea.icons.appendOuter
                              ? 'mdi-' + field.textarea.icons.appendOuter
                              : ''
                          "
                          :prepend-icon="
                            field.textarea.icons && field.textarea.icons.prepend
                              ? 'mdi-' + field.textarea.icons.prepend
                              : ''
                          "
                          :prepend-inner-icon="
                            field.textarea.icons &&
                            field.textarea.icons.prependInner
                              ? 'mdi-' + field.textarea.icons.prependInner
                              : ''
                          "
                          :mask="
                            field.textarea.mask ? field.textarea.mask : 100
                          "
                          :prefix="
                            field.textarea.prefix ? field.textarea.prefix : ''
                          "
                          :suffix="
                            field.textarea.suffix ? field.textarea.suffix : ''
                          "
                        ></v-textarea>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.comboBox"
                        :rules="
                          field.comboBox.validations
                            ? field.comboBox.validations
                            : ''
                        "
                        v-slot="{ errors, valid }"
                      >
                        <v-autocomplete
                          v-model="formData[field.comboBox.name]"
                          :name="field.comboBox.name"
                          :success="valid"
                          :error-messages="errors"
                          :items="
                            field.comboBox.items ? field.comboBox.items : []
                          "
                          :chips="
                            field.comboBox.chips ? field.comboBox.chips : false
                          "
                          :label="
                            field.comboBox.label ? field.comboBox.label : ''
                          "
                          :hint="field.comboBox.hint ? field.comboBox.hint : ''"
                          :value="
                            field.comboBox.initialValue
                              ? field.comboBox.initialValue
                              : ''
                          "
                          :multiple="
                            field.comboBox.multiple
                              ? field.comboBox.multiple
                              : true
                          "
                          :hide-selected="
                            field.comboBox.hideSelected
                              ? field.comboBox.hideSelected
                              : true
                          "
                          :clearable="
                            field.comboBox.clearable
                              ? field.comboBox.clearable
                              : true
                          "
                          :dense="
                            field.comboBox.dense ? field.comboBox.dense : false
                          "
                          :deletable-chips="
                            field.comboBox.deletableChips
                              ? field.comboBox.deletableChips
                              : true
                          "
                          :persistent-hint="
                            field.comboBox.persistentHint
                              ? field.comboBox.persistentHint
                              : true
                          "
                          :solo="
                            field.comboBox.style && field.comboBox.style.solo
                              ? true
                              : false
                          "
                          :filled="
                            field.comboBox.style && field.comboBox.style.filled
                              ? true
                              : false
                          "
                          :outlined="
                            field.comboBox.style &&
                            field.comboBox.style.outlined
                              ? true
                              : false
                          "
                          :flat="
                            field.comboBox.style && field.comboBox.style.flat
                              ? true
                              : false
                          "
                          :rounded="
                            field.comboBox.style && field.comboBox.style.rounded
                              ? true
                              : false
                          "
                          :shaped="
                            field.comboBox.style && field.comboBox.style.shaped
                              ? true
                              : false
                          "
                          :solo-inverted="
                            field.comboBox.style &&
                            field.comboBox.style.soloInverted
                              ? true
                              : false
                          "
                          :open-on-clear="
                            field.comboBox.openOnClear
                              ? field.comboBox.openOnClear
                              : false
                          "
                          :append-icon="
                            field.comboBox.icons && field.comboBox.icons.append
                              ? 'mdi-' + field.comboBox.icons.append
                              : ''
                          "
                          :append-outer-icon="
                            field.comboBox.icons &&
                            field.comboBox.icons.appendOuter
                              ? 'mdi-' + field.comboBox.icons.appendOuter
                              : ''
                          "
                          :prepend-icon="
                            field.comboBox.icons && field.comboBox.icons.prepend
                              ? 'mdi-' + field.comboBox.icons.prepend
                              : ''
                          "
                          :prepend-inner-icon="
                            field.comboBox.icons &&
                            field.comboBox.icons.prependInner
                              ? 'mdi-' + field.comboBox.icons.prependInner
                              : ''
                          "
                        ></v-autocomplete>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.select"
                        :rules="
                          field.select.validations
                            ? field.select.validations
                            : ''
                        "
                        v-slot="{ errors, valid }"
                      >
                        <v-select
                          v-model="formData[field.select.name]"
                          :name="field.select.name"
                          :success="valid"
                          :error-messages="errors"
                          :items="field.select.items ? field.select.items : []"
                          :label="field.select.label ? field.select.label : ''"
                          :value="
                            field.select.initialValue
                              ? field.select.initialValue
                              : ''
                          "
                          :hint="field.select.hint ? field.select.hint : ''"
                          :chips="
                            field.select.chips ? field.select.chips : false
                          "
                          :multiple="
                            field.select.multiple
                              ? field.select.multiple
                              : false
                          "
                          :clearable="
                            field.select.clearable
                              ? field.select.clearable
                              : true
                          "
                          :deletable-chips="
                            field.select.deletableChips
                              ? field.select.deletableChips
                              : true
                          "
                          :persistent-hint="
                            field.select.persistentHint
                              ? field.select.persistentHint
                              : true
                          "
                          :dense="
                            field.select.dense ? field.select.dense : false
                          "
                          :solo="
                            field.select.style && field.select.style.solo
                              ? true
                              : false
                          "
                          :filled="
                            field.select.style && field.select.style.filled
                              ? true
                              : false
                          "
                          :outlined="
                            field.select.style && field.select.style.outlined
                              ? true
                              : false
                          "
                          :flat="
                            field.select.style && field.select.style.flat
                              ? true
                              : false
                          "
                          :rounded="
                            field.select.style && field.select.style.rounded
                              ? true
                              : false
                          "
                          :shaped="
                            field.select.style && field.select.style.shaped
                              ? true
                              : false
                          "
                          :hide-selected="
                            field.select.hideSelected
                              ? field.select.hideSelected
                              : true
                          "
                          :solo-inverted="
                            field.select.style &&
                            field.select.style.soloInverted
                              ? true
                              : false
                          "
                          :append-icon="
                            field.select.icons && field.select.icons.append
                              ? 'mdi-' + field.select.icons.append
                              : ''
                          "
                          :append-outer-icon="
                            field.select.icons && field.select.icons.appendOuter
                              ? 'mdi-' + field.select.icons.appendOuter
                              : ''
                          "
                          :prepend-icon="
                            field.select.icons && field.select.icons.prepend
                              ? 'mdi-' + field.select.icons.prepend
                              : ''
                          "
                          :prepend-inner-icon="
                            field.select.icons &&
                            field.select.icons.prependInner
                              ? 'mdi-' + field.select.icons.prependInner
                              : ''
                          "
                        ></v-select>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.checkbox"
                        :rules="
                          field.checkbox.mustBeChecked
                            ? { required: { allowFalse: false } }
                            : ''
                        "
                        v-slot="{ errors }"
                      >
                        <v-checkbox
                          v-model="formData[field.checkbox.name]"
                          :name="field.checkbox.name"
                          :error-messages="errors"
                          :label="
                            field.checkbox.label ? field.checkbox.label : ''
                          "
                          :hint="field.checkbox.hint ? field.checkbox.hint : ''"
                          :dense="
                            field.checkbox.dense ? field.checkbox.dense : false
                          "
                          :persistent-hint="
                            field.checkbox.persistentHint
                              ? field.checkbox.persistentHint
                              : true
                          "
                          :color="
                            field.checkbox.color
                              ? field.checkbox.color
                              : 'success'
                          "
                          ripple
                        ></v-checkbox>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.switch"
                        :rules="
                          field.switch.validations
                            ? field.switch.validations
                            : ''
                        "
                        v-slot="{ errors }"
                      >
                        <v-switch
                          v-model="formData[field.switch.name]"
                          :name="field.switch.name"
                          :error-messages="errors"
                          :color="
                            field.switch.color ? field.switch.color : 'success'
                          "
                          :label="field.switch.label ? field.switch.label : ''"
                          :hint="field.switch.hint ? field.switch.hint : ''"
                          :dense="
                            field.switch.dense ? field.switch.dense : false
                          "
                          :inset="
                            field.switch.inset ? field.switch.inset : false
                          "
                          :persistent-hint="
                            field.switch.persistentHint
                              ? field.switch.persistentHint
                              : true
                          "
                          ripple
                        ></v-switch>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.radio"
                        :rules="
                          field.radio.validations ? field.radio.validations : ''
                        "
                        v-slot="{ errors }"
                      >
                        <v-radio-group
                          v-model="formData[field.radio.name]"
                          :error-messages="errors"
                          :name="field.radio.name"
                          :label="field.radio.label ? field.radio.label : ''"
                          :hint="field.radio.hint ? field.radio.hint : ''"
                          :persistent-hint="
                            field.radio.persistentHint
                              ? field.radio.persistentHint
                              : true
                          "
                          :dense="field.radio.dense ? field.radio.dense : false"
                          :column="
                            field.radio.row && field.radio.row === true
                              ? false
                              : true
                          "
                          :row="
                            field.radio.row && field.radio.row === true
                              ? field.radio.row
                              : false
                          "
                          :mandatory="
                            field.radio.mandatory
                              ? field.radio.mandatory
                              : false
                          "
                          :multiple="
                            field.radio.multiple ? field.radio.multiple : false
                          "
                          :append-icon="
                            field.radio.icons && field.radio.icons.append
                              ? 'mdi-' + field.radio.icons.append
                              : ''
                          "
                          :prepend-icon="
                            field.radio.icons && field.radio.icons.prepend
                              ? 'mdi-' + field.radio.icons.prepend
                              : ''
                          "
                        >
                          <v-radio
                            v-for="(item, index) in field.radio.items"
                            :key="uuid + index"
                            :label="item.label"
                            :value="item.value"
                            :color="
                              field.radio.color ? field.radio.color : 'success'
                            "
                          ></v-radio>
                        </v-radio-group>
                      </ValidationProvider>

                      <ValidationProvider
                        v-if="field.slider"
                        :rules="
                          field.slider.validations
                            ? field.slider.validations
                            : ''
                        "
                        v-slot="{ errors }"
                      >
                        <v-slider
                          v-if="!field.slider.range"
                          v-model="formData[field.slider.name]"
                          :name="field.slider.name"
                          :error-messages="errors"
                          :label="field.slider.label ? field.slider.label : ''"
                          :hint="field.slider.hint ? field.slider.hint : ''"
                          :dense="
                            field.slider.dense ? field.slider.dense : false
                          "
                          :persistent-hint="
                            field.slider.persistentHint
                              ? field.slider.persistentHint
                              : true
                          "
                          :color="
                            field.slider.color ? field.slider.color : 'success'
                          "
                          :append-icon="
                            field.slider.appendIcon
                              ? 'mdi-' + field.slider.appendIcon
                              : ''
                          "
                          :prepend-icon="
                            field.slider.prependIcon
                              ? 'mdi-' + field.slider.prependIcon
                              : ''
                          "
                          :max="field.slider.max ? field.slider.max : 100"
                          :min="field.slider.min ? field.slider.min : 0"
                          :step="field.slider.step ? field.slider.step : 1"
                          :thumb-color="
                            field.slider.thumbColor
                              ? field.slider.thumbColor
                              : undefined
                          "
                          :thumb-label="
                            field.slider.thumbLabel
                              ? field.slider.thumbLabel
                              : true
                          "
                          :thumb-size="
                            field.slider.thumbSize ? field.slider.thumbSize : 32
                          "
                          :tick-labels="
                            field.slider.tickLabels
                              ? field.slider.tickLabels
                              : []
                          "
                          :tick-size="
                            field.slider.tickSize ? field.slider.tickSize : 2
                          "
                          :ticks="
                            field.slider.ticks ? field.slider.ticks : false
                          "
                          :track-color="
                            field.slider.trackColor
                              ? field.slider.trackColor
                              : undefined
                          "
                          :track-fill-color="
                            field.slider.trackFillColor
                              ? field.slider.trackFillColor
                              : undefined
                          "
                          :value="
                            field.slider.initialValue
                              ? field.slider.initialValue
                              : undefined
                          "
                        ></v-slider>
                        <v-range-slider
                          v-else
                          v-model="formData[field.slider.name]"
                          :name="field.slider.name"
                          :error-messages="errors"
                          :label="field.slider.label ? field.slider.label : ''"
                          :hint="field.slider.hint ? field.slider.hint : ''"
                          :dense="
                            field.slider.dense ? field.slider.dense : false
                          "
                          :persistent-hint="
                            field.slider.persistentHint
                              ? field.slider.persistentHint
                              : true
                          "
                          :color="
                            field.slider.color ? field.slider.color : 'success'
                          "
                          :append-icon="
                            field.slider.appendIcon
                              ? 'mdi-' + field.slider.appendIcon
                              : ''
                          "
                          :prepend-icon="
                            field.slider.prependIcon
                              ? 'mdi-' + field.slider.prependIcon
                              : ''
                          "
                          :max="field.slider.max ? field.slider.max : 100"
                          :min="field.slider.min ? field.slider.min : 0"
                          :step="field.slider.step ? field.slider.step : 1"
                          :thumb-color="
                            field.slider.thumbColor
                              ? field.slider.thumbColor
                              : undefined
                          "
                          :thumb-label="
                            field.slider.thumbLabel
                              ? field.slider.thumbLabel
                              : true
                          "
                          :thumb-size="
                            field.slider.thumbSize ? field.slider.thumbSize : 32
                          "
                          :tick-labels="
                            field.slider.tickLabels
                              ? field.slider.tickLabels
                              : []
                          "
                          :tick-size="
                            field.slider.tickSize ? field.slider.tickSize : 2
                          "
                          :ticks="
                            field.slider.ticks ? field.slider.ticks : false
                          "
                          :track-color="
                            field.slider.trackColor
                              ? field.slider.trackColor
                              : undefined
                          "
                          :track-fill-color="
                            field.slider.trackFillColor
                              ? field.slider.trackFillColor
                              : undefined
                          "
                          :value="
                            field.slider.initialValue
                              ? field.slider.initialValue
                              : undefined
                          "
                        ></v-range-slider>
                      </ValidationProvider>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn @click="close">
              {{
              formConfig.button && formConfig.button.closeButtonText
              ? formConfig.button.closeButtonText
              : "Close"
              }}
            </v-btn>
            <v-btn @click="clear">
              {{
              formConfig.button && formConfig.button.clearButtonText
              ? formConfig.button.clearButtonText
              : "Clear"
              }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              v-if="formConfig.button"
              ripple
              @click="submit"
              :color="formConfig.button.color ? formConfig.button.color : ''"
            >
              {{ formConfig.button.text ? formConfig.button.text : "Submit" }}
              <v-icon v-if="formConfig.button.icon" right dark>
                {{
                formConfig.button.icon ? `mdi-${formConfig.button.icon}` : ""
                }}
              </v-icon>
            </v-btn>
            <v-btn v-else color="primary" @click="submit" :disabled="invalid || !validated">Submit</v-btn>
          </v-card-actions>
        </v-card>
        <!--div class='resizer'></div-->
      </v-dialog>
    </v-row>
  </ValidationObserver>
</template>
<script>
const logger = require("@/utils/logging").getLogger("Form.vue");
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
    ...mapGetters(["uuid", "dark"])
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
    getColumnDescription(field) {
      let fieldInfo = field[Object.keys(field)[0]];
      if (fieldInfo && fieldInfo.description) {
        return fieldInfo.description;
      }
      return "";
    },
    hasColumnDescription(field) {
      let fieldInfo = field[Object.keys(field)[0]];
      if (fieldInfo && fieldInfo.description) {
        return true;
      }
      return false;
    },
    setDefaults() {
      this.formConfig.fields.forEach(field => {
        let fieldInfo = field[Object.keys(field)[0]];
        if (fieldInfo.initialValue) {
          logger.debug(
            `Setting default for field [${fieldInfo.name} : ${fieldInfo.initialValue}] `
          );
          this.formData[fieldInfo.name] = fieldInfo.initialValue;
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
        logger.debug(JSON.stringify(this.formData));
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

.v-dialog.v-dialog--active .popup-header {
  cursor: grab;
}

.v-dialog.v-dialog--active .popup-header:active {
  cursor: grabbing;
}
</style>
