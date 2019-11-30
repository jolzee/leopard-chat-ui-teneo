<template>
  <v-data-table
    v-if="items && items.length"
    :headers="headers"
    :items="items"
    :search="search"
  >
    <template slot="items" slot-scope="props">
      <td class="text-left">{{ props.item.date }}</td>
      <td class="text-left">{{ props.item.description }}</td>
      <td class="text-left">{{ props.item.amount }}</td>
    </template>
    <v-alert
      slot="no-results"
      :value="true"
      color="error"
      icon="mdi-alert-octagram"
    >
      Your search for "{{ search }}" found no results.
    </v-alert>
  </v-data-table>
</template>

<script>
export default {
  props: ["headers", "items", "search"]
};
</script>
