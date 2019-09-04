<template>
  <v-data-table
    v-if="items && items.length"
    :headers="headers"
    :items="items"
    :search="search"
    :footer-props="{
      itemsPerPageOptions: calcRowsPerPage
    }"
  >
    <template
      slot="
    items"
      slot-scope="props"
    >
      <td
        v-for="(header, key) in headers"
        :key='
    key'
        class="text-left"
        v-html="props.item[header.value]"
      >

      </td>
    </template>
    <v-alert
      slot="no-results"
      :value="true"
      color="error"
      icon="mdi-alert-octagram"
    >
      Your search for "{{ search }}" found no results.
    </v-alert>
    <template
      v-if="footer"
      slot="footer"
    >
      <td colspan="100%">
        <strong>{{ footer }}</strong>
      </td>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: ["headers", "items", "search", "footer", "rowsPerPage"],
  computed: {
    calcRowsPerPage() {
      let rowsPerPageArray = [{ text: "All", value: -1 }];
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