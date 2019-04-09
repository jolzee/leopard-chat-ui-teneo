import java.text.DateFormat
import java.util.regex.Matcher
import java.util.regex.Pattern
import java.util.regex.PatternSyntaxException

class ExtensionHelper {

    static Map createTableHeader(text, value, sortable = false, align = "center", width = "") {
        def headerParams = [:]
        headerParams = ['text': text, 'value': value, 'align': align, 'sortable': sortable]

        if (width != "") {
            headerParams.put('width', width)
        }
        return headerParams
    }

    static String displayTable(def channel = "webview", def title, def footer = "", def enableSearch = true, def headers, def rows, def rowsPerPage = [5, 10, 25]) {
        if (channel == 'webview') {
            def attachment = [:]
            def params = [:]
            params = ['title': title, 'enableSearch': enableSearch, 'headers': headers, 'rows': rows, 'rowsPerPage': rowsPerPage]

            if (footer != "") {
                params.put("footer", footer)
            }

            attachment = ['name': 'displayTable', 'parameters': params]
            def result = new groovy.json.JsonBuilder(attachment).toString()
            return result
        }
        return ""

    }

    static String displayPermanentClickableList(def content, def channel, def containsLongOptions = false) {
        def result = ""

        if (channel == 'webview' || channel == 'tryout') {
            // construct json for table
            def attachment = [:]
            def params = [:]

            params = ['content': content]
            attachment = ['name': 'displayCollection', 'hasLongOptions': containsLongOptions, 'permanent': true, 'parameters': params]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }

        return result
    }

    static String displayClickableList(def content, def channel, def containsLongOptions = false) {
        def result = ""
        if (channel == 'facebook') {
            // construct json for facebook attachment
            // generic facebook template
            def attachment = [:]
            def payload = [:]
            def elements = []
            elements = content.items.collect {
                item ->
                    [
                            title    : item.name,
                            subtitle : item.description,
                            image_url: item.image_url,
                            buttons  : [
                                    [type: 'web_url', url: item.item_url, title: 'View page']
                            ]
                    ]
            }

            payload = [template_type: 'generic', elements: elements]
            attachment = [type: 'template', payload: payload]
            result = new groovy.json.JsonBuilder([attachment: attachment]).toString()

        }
        if (channel == 'slack') {
            // construct json for attachments
            def elements = []
            elements = content.items.collect {
                item ->
                    [
                            fallback  : item.name,
                            title     : item.name,
                            title_link: item.item_url,
                            text      : item.description,
                            thumb_url : item.image_url
                    ]
            }

            result = new groovy.json.JsonBuilder([attachments: elements]).toString()
        }

        if (channel == 'webview') {
            // construct json for table
            def attachment = [:]
            def params = [:]

            params = ['content': content]
            attachment = ['name': 'displayCollection', 'hasLongOptions': containsLongOptions, 'parameters': params]
            result = new groovy.json.JsonBuilder(attachment).toString()

        }

        return result
    }

    static String displayImage(def imageUrl, def channel, def inline = false) {
        def result = ""
        if (channel == 'facebook') {
            // construct json for facebook attachment
            // just add an image
            def attachment = [:]
            def payload = [:]

            payload = [url: imageUrl]
            attachment = [type: 'image', payload: payload]
            result = new groovy.json.JsonBuilder([attachment: attachment]).toString()

        }

        if (channel == 'slack') {
            // construct json for attachments
            def elements = []
            elements = [
                    fallback : "Here's an image",
                    image_url: imageUrl
            ]
            result = new groovy.json.JsonBuilder([attachments: [elements]]).toString()
        }

        if (channel == 'webview') {
            // construct json for image
            def attachment = [:]
            def params = [:]

            params = [image_url: imageUrl]
            attachment = [name: 'displayImage', parameters: params, inline: inline]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }
        return result
    }

    static String displayModal(def model, String template) {
        def result = ""
        def attachment = [:]
        def items = []

        try {
            Pattern regex = Pattern.compile("(?:\\s|^)(\\w*)\\.(\\w*)", Pattern.CANON_EQ)
            Matcher regexMatcher = regex.matcher(template)
            while (regexMatcher.find()) {
                def item = [type: regexMatcher.group(1), value: model[regexMatcher.group(2),]]
                items.add(item)

            }
            attachment = ['name': 'displayModal', 'items': items]
            result = new groovy.json.JsonBuilder(attachment).toString()
        } catch (PatternSyntaxException ex) {
            ex.printStackTrace()
        }
        return result
    }

    static String displayImageCarousel(def images, def channel, def inline = false) {
        def result = ""
        if (channel == 'facebook') {
            // construct json for facebook attachment
            // just add an image
            def attachment = [:]
            def payload = [:]

            payload = [url: images[0]]
            attachment = [type: 'image', payload: payload]
            result = new groovy.json.JsonBuilder([attachment: attachment]).toString()

        }

        if (channel == 'slack') {
            // construct json for attachments
            def elements = [
                    fallback : "Here's an image",
                    image_url: images[0]
            ]
            result = new groovy.json.JsonBuilder([attachments: [elements]]).toString()
        }

        if (channel == 'webview') {
            // construct json for image
            def attachment = [:]
            def params = [:]

            params = [images: images]
            attachment = [name: 'displayImageCarousel', parameters: params, inline: inline]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }
        return result
    }

    static String displayVideo(def videoUrl, def channel, def inline = false) {
        def result = ""

        if (channel == 'facebook') {
            // construct json for facebook attachment
            // just add an image
            def attachment = [:]
            def payload = [:]

            payload = [url: videoUrl]
            attachment = [type: 'video', payload: payload]
            result = new groovy.json.JsonBuilder([attachment: attachment]).toString()

        }

        if (channel == 'webview') {
            // construct json for image
            def attachment = [:]
            def params = [:]

            params = [video_url: videoUrl]
            attachment = [name: 'displayVideo', parameters: params, inline: inline]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }

        return result
    }


    static String displayPanel(def content, def channel) {
        def result = ""

        if (channel == 'webview') {
            // construct json for image
            def attachment = [:]
            def params = [:]

            params = ['content': content]
            attachment = [name: 'displayPanelCard', parameters: params]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }

        return result
    }

    // DEMO SPECIFIC EXTENSIONS
    // MYTELECOM
    static String displayChecklist(def step, def failureStep) {
        def result = ''
        def title = 'Checklist'
        def items = ''
        def stepLabels = ['Router Online', 'ISP Speed Good', 'Connected Devices']

        stepLabels.eachWithIndex {
            label,
            idx ->
                def checkColor = 'grey-text'
                def checkIcon = 'remove'
                if (idx <= step) {
                    checkColor = 'green-text text-darken-1'
                    checkIcon = 'done'
                }
                if (idx == failureStep) {
                    checkColor = 'red-text'
                    checkIcon = 'clear'
                }
                def stepHTML = '<li class="collection-item"><div>' + label + '<div class="secondary-content left ' + checkColor + '" style="padding-right:20px;"><i class="material-icons">' + checkIcon + '</i></div></div></li>'
                items += stepHTML

        }

        def parameters = [
                'title': title,
                'items': items
        ]

        def action = [
                'name'      : 'displayCollectionBasic',
                'parameters': parameters
        ]

        result = new groovy.json.JsonBuilder(action).toString()

        return result
    }

    // CARRYME
    static String displayItinerary(def userFirstName, Map details, def channel) {

        def result = ""
        if (channel == 'facebook') {
            def attachment = [:]
            def payload = [:]
            def elements = []
            def pass_elements = []
            def conn_elements = []
            def segm_elements = []
            def priceInfo = [:]

            pass_elements = [
                    [
                            "name"         : (userFirstName != '' ? userFirstName : "N.N."),
                            "ticket_number": null,
                            "passenger_id" : "p001"
                    ]
            ]

            conn_elements = [
                    [
                            "connection_id"    : "c001",
                            "segment_id"       : "s001",
                            "flight_number"    : details["out_flight_no"],
                            "aircraft_type"    : details["out_plane_type"],
                            "departure_airport": [
                                    "airport_code": details["out_dep_airport_code"],
                                    "city"        : details["out_dep_city"],
                                    "terminal"    : details["out_dep_terminal"],
                                    "gate"        : null
                            ],
                            "arrival_airport"  : [
                                    "airport_code": details["out_arr_airport_code"],
                                    "city"        : details["out_arr_city"],
                                    "terminal"    : details["out_arr_terminal"],
                                    "gate"        : null
                            ],
                            "flight_schedule"  : [
                                    "departure_time": details["out_dep_time"][0..15],
                                    "arrival_time"  : details["out_arr_time"][0..15],
                            ],
                            "travel_class"     : details["out_travel_class"]
                    ],
                    [
                            "connection_id"    : "c002",
                            "segment_id"       : "s002",
                            "flight_number"    : details["ret_flight_no"],
                            "aircraft_type"    : details["ret_plane_type"],
                            "departure_airport": [
                                    "airport_code": details["ret_dep_airport_code"],
                                    "city"        : details["ret_dep_city"],
                                    "terminal"    : details["ret_dep_terminal"],
                                    "gate"        : null
                            ],
                            "arrival_airport"  : [
                                    "airport_code": details["ret_arr_airport_code"],
                                    "city"        : details["ret_arr_city"],
                                    "terminal"    : details["ret_arr_terminal"],
                                    "gate"        : null
                            ],
                            "flight_schedule"  : [
                                    "departure_time": details["ret_dep_time"][0..15],
                                    "arrival_time"  : details["ret_arr_time"][0..15],
                            ],
                            "travel_class"     : details["ret_travel_class"]
                    ]
            ]

            segm_elements = [
                    [
                            "segment_id"  : "s001",
                            "passenger_id": "p001",
                            "seat"        : "16B",
                            "seat_type"   : "Standard",
                            "product_info": [:]
                    ],
                    [
                            "segment_id"  : "s002",
                            "passenger_id": "p001",
                            "seat"        : "38F",
                            "seat_type"   : "Standard",
                            "product_info": [:]
                    ]
            ]

            payload = [
                    "template_type"         : 'airline_itinerary',
                    "intro_message"         : "Here is your flight itinerary.",
                    "pnr_number"            : "DYKWIA",
                    "passenger_info"        : pass_elements,
                    "flight_info"           : conn_elements,
                    "passenger_segment_info": segm_elements,
                    "locale"                : "en_US",
                    "price_info"            : [:],
                    "total_price"           : details["price"],
                    "currency"              : details["currency"]
            ]
            attachment = ["type": 'template', "payload": payload]
            result = new groovy.json.JsonBuilder(["attachment": attachment]).toString()

        }

        if (channel == 'webview') { // construct json for webview itinerary
            def attachment = [:]
            def params = [:]

            params = [
                    'outbound_departure_airport': details["out_dep_airport_code"],
                    'outbound_departure_date'   : dateFormat(details["out_dep_time"]),
                    'outbound_arrival_airport'  : details["out_arr_airport_code"],
                    'outbound_arrival_date'     : dateFormat(details["out_arr_time"]),
                    'outbound_flight_number'    : details["out_flight_no"],
                    'inbound_departure_airport' : details["ret_dep_airport_code"],
                    'inbound_departure_date'    : dateFormat(details["ret_dep_time"]),
                    'inbound_arrival_airport'   : details["ret_arr_airport_code"],
                    'inbound_arrival_date'      : dateFormat(details["ret_arr_time"]),
                    'inbound_flight_number'     : details["ret_flight_no"],
                    'airlinecode'               : details["out_carrier_code"],
                    'airlinename'               : details["out_airline_name"],
                    'footer'                    : details["currency"] + ' ' + details["price"] + '<br>' + details["out_travel_class"]
            ]
            attachment = ["name": 'displayItinerary', "parameters": params]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }
        return result
    }

    private static String dateFormat(String isoDate) {
        Calendar cal = javax.xml.bind.DatatypeConverter.parseDateTime(isoDate)
        DateFormat df = DateFormat.getDateInstance()
        int hour = cal.get(Calendar.HOUR_OF_DAY)
        int minutes = cal.get(Calendar.MINUTE)
        return df.format(cal.getTime()) + " at " + java.time.LocalTime.of(hour, minutes).toString()
    }

    // MYBANK
    static String displayTransactions(def transactions, def channel) {
        def result = ""

        if (channel == 'webview') {
            // construct json for table
            def attachment = [:]
            def params = [:]

            params = ['transactions': transactions]
            attachment = ['name': 'displayTransactionsTable', 'parameters': params]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }
        return result
    }

    // MYBANK
    static String displayAccounts(def accountsTableContent, def channel) {
        def result = ""

        if (channel == 'webview') {
            // construct json for table
            def attachment = [:]
            def params = [:]

            params = ['accountsTableContent': accountsTableContent]
            attachment = ['name': 'displayAccountsTable', 'parameters': params]
            result = new groovy.json.JsonBuilder(attachment).toString()
        }
        return result
    }

}