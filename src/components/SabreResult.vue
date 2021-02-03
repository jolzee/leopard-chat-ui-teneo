<template>
  <v-card-text v-if="itinerary" scrollable class="px-0 py-0 text-center">
    <div class="info title elevation-4 py-0">OUTBOUND</div>
    <v-row class="text-center my-2">
      <v-col cols="2"></v-col>
      <v-col>
        <v-img
          contain
          max-width="200px"
          :src="
            buildLogoUrl(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].OperatingAirline.Code
            )
          "
        ></v-img>
      </v-col>
    </v-row>
    <v-row class="text-center mt-0 mb-2">
      <v-col cols="4">
        <h2>
          {{
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
              .FlightSegment[0].DepartureAirport.LocationCode
          }}
        </h2>
        <div>
          {{
            formatDateTime(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].DepartureDateTime
            )
          }}
        </div>
      </v-col>
      <v-col class="pt-2" cols="4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="orange--text" v-bind="attrs" v-on="on" large>mdi-shield-airplane</v-icon>
          </template>
          <span
            >{{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].ElapsedTime
            }}
            min,
            {{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].StopQuantity
            }}
            stops,
            {{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].TPA_Extensions.Mileage.Amount
            }}
            Miles</span
          >
        </v-tooltip>

        <div
          class="info--text mt-1"
          v-html="
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
              .FlightSegment[0].FlightNumber
          "
        ></div>
      </v-col>
      <v-col cols="4">
        <h2>
          {{
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
              .FlightSegment[0].ArrivalAirport.LocationCode
          }}
        </h2>
        <div
          v-html="
            formatDateTime(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].ArrivalDateTime
            )
          "
        ></div>
      </v-col>
    </v-row>
    <div class="info title elevation-4 py-0">INBOUND</div>
    <v-row class="text-center my-2">
      <v-col cols="2"></v-col>
      <v-col>
        <v-img
          contain
          max-width="200px"
          :src="
            buildLogoUrl(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0]
                .FlightSegment[0].OperatingAirline.Code
            )
          "
        ></v-img>
      </v-col>
    </v-row>
    <v-row class="text-center my-2">
      <v-col cols="4">
        <h2>
          {{
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
              .FlightSegment[0].DepartureAirport.LocationCode
          }}
        </h2>
        <div>
          {{
            formatDateTime(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
                .FlightSegment[0].DepartureDateTime
            )
          }}
        </div>
      </v-col>
      <v-col class="pt-2" cols="4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="orange--text" v-bind="attrs" v-on="on" large>mdi-shield-airplane</v-icon>
          </template>
          <span
            >{{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1].ElapsedTime
            }}
            min,
            {{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
                .FlightSegment[0].StopQuantity
            }}
            stops,
            {{
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
                .FlightSegment[0].TPA_Extensions.Mileage.Amount
            }}
            Miles</span
          >
        </v-tooltip>
        <div
          class="info--text mt-1"
          v-html="
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
              .FlightSegment[0].FlightNumber
          "
        ></div>
      </v-col>
      <v-col cols="4">
        <h2>
          {{
            itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
              .FlightSegment[0].ArrivalAirport.LocationCode
          }}
        </h2>
        <div>
          {{
            formatDateTime(
              itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
                .FlightSegment[0].ArrivalDateTime
            )
          }}
        </div>
      </v-col>
    </v-row>
    <v-chip class="ma-2" color="primary" label text-color="white">
      <v-icon left> mdi-tag-outline </v-icon>
      {{
        filterAirline(
          itinerary.AirItinerary.OriginDestinationOptions.OriginDestinationOption[1]
            .FlightSegment[0].OperatingAirline.Code
        )
      }}
      {{
        findNativeCurrencySymbol(
          itinerary.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.CurrencyCode
        )
      }}
      {{ itinerary.AirItineraryPricingInfo[0].ItinTotalFare.TotalFare.Amount }}
    </v-chip>
  </v-card-text>
</template>

<script>
const { AIRLINES } = require("../constants/airlines");
const { CURRENCY } = require("../constants/currency");
var dayjs = require("dayjs");
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
  methods: {
    filterAirline(iata) {
      var filtered = AIRLINES.find(element => element.code === iata);
      return filtered ? filtered.name : undefined;
    },
    findNativeCurrencySymbol(currencyCode) {
      return CURRENCY[currencyCode].symbol_native;
    },
    formatDateTime(raw) {
      return dayjs(raw).format("ddd, MMM D, YY h:mm A");
    },
    buildLogoUrl(airlineCode) {
      return `https://airlinecodes.info/airlinelogos/${airlineCode}.svg`;
    }
  },
  computed: {}
};
</script>

<style scoped></style>
