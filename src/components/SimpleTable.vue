<template>
  <v-simple-table
    class="elevation-2"
    :dense="extension.dense"
    :fixed-header="extension.fixedHeader"
    :height="extension.maxHeight ? extension.maxHeight : undefined"
  >
    <template v-slot:default>
      <thead v-if="hasHeaders(extension)">
        <tr>
          <th
            v-for="header in extension.headers"
            :key="header + uuid"
            class="text-left"
            v-html="header"
          ></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in extension.rows" :key="rowIndex + uuid">
          <td v-for="(column, colIndex) in row" :key="colIndex + uuid" v-html="column"></td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "SimpleTable",
  props: ["extension"],
  data: () => ({}),
  computed: {
    ...mapGetters(["uuid"])
  },
  methods: {
    hasHeaders(extension) {
      let hasHeaders = false;
      if (extension.headers) {
        extension.headers.forEach(header => {
          if (header.trim() !== "") {
            hasHeaders = true;
          }
        });
      }
      return hasHeaders;
    },
  }
};
</script>
<style>
</style>