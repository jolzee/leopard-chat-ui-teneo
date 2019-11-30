<template>
  <v-row justify="center" v-if="showDialog">
    <v-dialog v-model="showDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="title">
            <v-icon class="mx-2" color="primary">mdi-book-plus</v-icon> New
            canned response
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-textarea
                  name="Text of the canned response"
                  auto-grow
                  solo
                  label="Canned Response Text"
                  v-model="cannedResponseText"
                  hint="Copied from the bot but you can change it"
                  outlined
                  persistent-hint
                  append-icon="mdi-tooltip-text"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-combobox
                  outlined
                  v-model="tags"
                  :filter="filter"
                  :hide-no-data="!search"
                  :items="items"
                  :search-input.sync="search"
                  append-icon="mdi-pound-box-outline"
                  hide-selected
                  label="Search for a tag"
                  hint="Search or add new tag"
                  persistent-hint
                  multiple
                  small-chips
                  solo
                >
                  <template v-slot:no-data>
                    <v-list-item>
                      <span class="subheading mr-2">Create</span>
                      <v-chip
                        :color="`${colors[nonce - 1]} lighten-3`"
                        label
                        small
                      >
                        {{ search | tagify }}
                      </v-chip>
                    </v-list-item>
                  </template>
                  <template
                    v-slot:selection="{ attrs, item, parent, selected }"
                  >
                    <v-chip
                      v-if="item === Object(item)"
                      v-bind="attrs"
                      :color="`${item.color} lighten-3`"
                      :input-value="selected | tagify"
                      label
                      small
                    >
                      <v-icon small left class="mr-1">mdi-pound</v-icon>
                      <span class="pr-2">
                        {{ item.text | tagify }}
                      </span>
                      <v-icon small @click="parent.selectItem(item)"
                        >mdi-tag-minus</v-icon
                      >
                    </v-chip>
                  </template>
                  <template v-slot:item="{ index, item }">
                    <v-text-field
                      v-if="editing === item"
                      v-model="editing.text"
                      autofocus
                      flat
                      background-color="transparent"
                      hide-details
                      solo
                      @keyup.enter="edit(index, item)"
                    ></v-text-field>
                    <v-chip
                      v-else
                      :color="`${item.color} lighten-3`"
                      dark
                      label
                      small
                    >
                      {{ item.text | tagify }}
                    </v-chip>
                    <v-spacer></v-spacer>
                    <v-list-item-action @click.stop>
                      <v-btn icon @click.stop.prevent="edit(index, item)">
                        <v-icon>{{
                          editing !== item ? "mdi-pencil" : "mdi-check"
                        }}</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="hideDialog">Close</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
const logger = require("@/utils/logging")("AgentAssistCannedResponseForm.vue");
export default {
  name: "AddCannedResponseForm",
  props: ["text"],
  data() {
    return {
      showDialog: true,
      cannedResponseText: this.text,
      tags: [],
      activator: null,
      attach: null,
      colors: [
        "green",
        "purple",
        "indigo",
        "cyan",
        "teal",
        "orange",
        "pink",
        "red",
        "blue",
        "lime",
        "blue-grey"
      ],
      editing: null,
      index: -1,
      items: [
        { header: "Select an option or create one" },
        {
          text: "teneo",
          color: "blue"
        },
        {
          text: "bot",
          color: "red"
        }
      ],
      nonce: 1,
      menu: false,
      x: 0,
      search: null,
      y: 0
    };
  },
  computed: {},
  filters: {
    tagify: function(value) {
      if (!value) return "";
      value = value
        .toString()
        .toLowerCase()
        .replace(/\s/g, "");
      return value;
    }
  },
  methods: {
    save() {
      let theTags = [];
      this.tags.forEach(function(tag) {
        theTags.push(tag.text);
      });
      const cannedResponse = {
        text: this.cannedResponseText,
        tags: theTags
      };
      // const cannedResponse = {
      //   data: {
      //     token: null,
      //     text: this.cannedResponseText,
      //     tags: theTags
      //   }
      // };
      this.$store
        .dispatch("liveChatAddCannedResponse", cannedResponse)
        .then(() => {
          this.$emit("saved");
        });
    },
    hideDialog() {
      this.$emit("hideDialog");
    },
    edit(index, item) {
      if (!this.editing) {
        if (item && item.text) {
          logger.debug(`Item Text: ${item.text}`);
          item.text = item.text
            .toString()
            .toLowerCase()
            .replace(/\s/g, "");
        }

        this.editing = item;
        this.index = index;
      } else {
        this.editing = null;
        this.index = -1;
      }
    },
    filter(item, queryText, itemText) {
      if (item.header) return false;

      const hasValue = val => (val !== null ? val : "");

      let text = hasValue(itemText);
      let query = hasValue(queryText);
      query = query
        .toString()
        .toLowerCase()
        .replace(/\s/g, "");
      text = text
        .toString()
        .toLowerCase()
        .replace(/\s/g, "");

      return text.indexOf(query) > -1;
    }
  },
  watch: {
    editing(val, prev) {
      if (val !== null && prev !== val) {
        val.text = val.text.toLowerCase().replace(/\s/g, "");
        this.editing = val;
      }
    },
    tags(val, prev) {
      if (val.length === prev.length) return;
      logger.debug("val", val);
      this.tags = val.map(v => {
        if (typeof v === "object") {
          logger.debug("color :", v.color);
          v = {
            text: v.text.toLowerCase().replace(/\s/g, ""),
            color: v.color ? v.color : this.colors[this.nonce - 1]
          };
          this.items.push(v);
          if (!v.color) {
            this.nonce++;
          }

          logger.debug("> nonce ++  :", this.nonce);
        } else if (typeof v === "string") {
          v = {
            text: v.toLowerCase().replace(/\s/g, ""),
            color: this.colors[this.nonce - 1]
          };
          this.items.push(v);

          this.nonce++;
          logger.debug(">> nonce ++  :", this.nonce);
        }

        return v;
      });
    }
  }
};
</script>
<style></style>
