<template>
  <v-card-text v-if="itinerary" scrollable class="px-0 py-0 text-center">
    <h2 class="mb-2">Flight details</h2>
    <div class="info title elevation-4 py-0">OUTBOUND</div>
    <v-row class="text-center mt-0 mb-2">
      <v-col cols="4">
        <h2>{{ itinerary.outbound_departure_airport }}</h2>
        <div>{{ itinerary.outbound_departure_date }}</div>
      </v-col>
      <v-col class="pt-2" cols="4">
        <v-icon class="orange--text" large>mdi-shield-airplane</v-icon>
        <div class="info--text mt-1" v-html="itinerary.outbound_flight_number"></div>
      </v-col>
      <v-col cols="4">
        <h2>{{ itinerary.outbound_arrival_airport }}</h2>
        <div v-html="itinerary.outbound_arrival_date"></div>
      </v-col>
    </v-row>
    <div class="info title elevation-4 py-0">INBOUND</div>
    <v-row class="text-center my-2">
      <v-col cols="4">
        <h2>{{ itinerary.inbound_departure_airport }}</h2>
        <div>{{ itinerary.inbound_departure_date }}</div>
      </v-col>
      <v-col class="pt-2" cols="4">
        <v-icon class="orange--text" large>mdi-shield-airplane</v-icon>
        <div class="info--text mt-1" v-html="itinerary.inbound_flight_number"></div>
      </v-col>
      <v-col cols="4">
        <h2>{{ itinerary.inbound_arrival_airport }}</h2>
        <div>{{ itinerary.inbound_arrival_date }}</div>
      </v-col>
    </v-row>
    <div class="subheading info--text mt-2">
      <span v-html="itinerary.airlinename"></span> -
      <span v-html="itinerary.footer"></span>
    </div>
  </v-card-text>
</template>

<script>
export default {
  props: {
    itinerary: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {}
};
</script>

<style scoped></style>
