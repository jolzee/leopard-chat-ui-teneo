<template>
    <v-card-text scrollable class="elevation-4 px-3 text-xs-center">
        <h1 class="mb-2">Flight details</h1>
        <div class="info white--text title elevation-4 py-1">OUTBOUND</div>
        <v-layout class="text-xs-center my-2">
            <v-flex xs4>
                <h1>{{ itinerary.outbound_departure_airport }}</h1>
                <div>{{ itinerary.outbound_departure_date }}</div>
            </v-flex>
            <v-flex xs4 pt-2>
                <v-icon class="secondary--text">fa-plane</v-icon>
                <div class="info--text mt-1" v-html="itinerary.airlinecode"></div>
            </v-flex>
            <v-flex xs4>
                <h1>{{ itinerary.outbound_arrival_airport }}</h1>
                <div v-html="itinerary.outbound_arrival_date"></div>
            </v-flex>
        </v-layout>
        <div class="info white--text title elevation-4 py-1">INBOUND</div>
        <v-layout class="text-xs-center my-2">
            <v-flex xs4>
                <h1>{{ itinerary.inbound_departure_airport }}</h1>
                <div>{{ itinerary.inbound_departure_date }}</div>
            </v-flex>
            <v-flex xs4 pt-2>
                <v-icon class="secondary--text">fa-plane</v-icon>
                <div class="info--text mt-1" v-html="itinerary.airlinecode"></div>
            </v-flex>
            <v-flex xs4>
                <h1>{{ itinerary.inbound_arrival_airport }}</h1>
                <div>{{ itinerary.inbound_arrival_date }}</div>
            </v-flex>
        </v-layout>
        <div class="subheading info--text my-4">
            <span>{{ itinerary.airlinename }}</span> -
            <span>{{ itinerary.footer }}</span>
        </div>
    </v-card-text>
</template>

<script>
export default {
  props: ["itinerary"],
  data() {
    return {};
  },
  computed: {}
};
</script>

<style scoped>
</style>

