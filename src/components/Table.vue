<template>
  <v-data-table
    v-if="items && items.length"
    :headers="headers"
    :items="makeHtml()"
    :search="search"
    :footer-props="{
      itemsPerPageOptions: calcRowsPerPage
    }"
  >
    <template v-slot:body="{ items }">
      <tbody>
        <tr v-for="(item, dex) in items" :key="dex + getUuid">
          <template v-for="(cellValue, j) in getValues(item)">
            <td v-html="cellValue" :key="j + getUuid"></td>
          </template>
        </tr>
      </tbody>
    </template>
    <v-alert slot="no-results" :value="true" colored-border color="error" icon="mdi-alert-octagram"
      >Your search for "{{ search }}" found no results.</v-alert
    >
    <template v-if="footer" slot="footer">
      <td colspan="100%">
        <strong>{{ footer }}</strong>
      </td>
    </template>
  </v-data-table>
</template>

<script>
const logger = require("@/utils/logging").getLogger("Table.vue");
import { uuid } from "@/utils/utils";
export default {
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    search: {
      type: String,
      required: false
    },
    footer: {
      type: String,
      required: true
    },
    rowsPerPage: {
      type: Array,
      required: true
    }
  },
  methods: {
    getValues(item) {
      return Object.values(item);
    },
    getUuid() {
      return uuid();
    },
    isEnabled(slot) {
      return this.enabled === slot;
    },
    unescapeHTML(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    },
    makeHtml() {
      let that = this;
      const unescapedItems = this.items.map(item => {
        Object.keys(item).forEach(function (key) {
          item[key] = that.unescapeHTML(item[key]);
        });
        return item;
      });
      console.log(unescapedItems);
      return unescapedItems;
    }
  },
  computed: {
    calcRowsPerPage() {
      const rowsPerPageArray = [{ text: "All", value: -1 }];
      if (this.rowsPerPage && this.rowsPerPage.length >= 0) {
        let reversedArray = this.rowsPerPage.slice(0);
        reversedArray = reversedArray.reverse();
        reversedArray.forEach(perPage => {
          rowsPerPageArray.unshift(perPage);
        });
      } else {
        rowsPerPageArray.unshift(5, 10, 25);
      }
      return rowsPerPageArray;
    }
  }
};
</script>
