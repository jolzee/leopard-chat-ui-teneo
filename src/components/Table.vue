<template>
  <v-data-table
    v-if="items && items.length"
    :headers="headers"
    :items="items"
    :search="search"
  >
    <template
      slot="items"
      slot-scope="props"
    >
      <td
        v-for="(header, key) in headers"
        :key='key'
        class="text-xs-left"
      >
        {{ props.item[header.value] }}
      </td>
    </template>
    <v-alert
      slot="no-results"
      :value="true"
      color="error"
      icon="warning"
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
  props: ["headers", "items", "search", "footer"]
};
</script>