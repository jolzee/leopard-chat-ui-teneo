import groovy.json.JsonOutput

import java.text.DateFormat
import java.util.regex.Matcher
import java.util.regex.Pattern
import java.util.regex.PatternSyntaxException

class ExtensionHelper {

    static String setUploadConfig(Map config) {
        Map params = [
            'postUrl'            : config.postUrl,
            'postFileNameParam'  : config.get('postFileNameParam', 'file'),
            'postParams'         : config.get('postParams', [:]),
            'teneoSuccessQuery'  : config.get('teneoSuccessQuery', ''),
            'teneoFailureQuery'  : config.get('teneoFailureQuery', ''),
            'reqUserInputSuccess': config.get('reqUserInputSuccess', 'I have uploaded my file'),
            'reqUserInputFailure': config.get('reqUserInputFailure', 'I tried uploading but it didn\'t work')]
        JsonOutput.toJson(['name': 'uploadConfig', 'parameters': params] as java.util.Map)
    }

    static Map createTableHeader(Map config) {
        Map headerParams = ['text': config.text, 'value': config.value, 'align': config.get('align', 'center'), 'sortable': config.get('sortable', false)]
        if (config.get('width', '') != "") {
            headerParams.put('width', config.width as String)
        }
        return headerParams
    }

    static Map createTableHeader(text, value, sortable = false, align = "center", width = "") {
        Map headerParams = ['text': text, 'value': value, 'align': align, 'sortable': sortable]
        if (width != "") {
            headerParams.put('width', width)
        }
        return headerParams
    }

    static String displayTable(Map config) {
        Map params = ['title'      : config.title, 'enableSearch': config.get('enableSearch', true), 'headers': config.headers, 'rows': config.rows,
                      'rowsPerPage': config.get('rowsPerPage', [5, 10, 25]), 'overrideTitle': config.get('overrideTitle', false),
                      'footer'     : config.get('footer', "")]

        JsonOutput.toJson(['name': 'displayTable', 'parameters': params] as java.util.Map)
    }

    static String displayTable(def channel = "webview", def title, def footer = "", def enableSearch = true, def headers, def rows, def rowsPerPage = [5, 10, 25]) {
        Map params = ['title': title, 'enableSearch': enableSearch, 'headers': headers, 'rows': rows, 'rowsPerPage': rowsPerPage,]
        if (footer != "") {
            params.put("footer", footer)
        }
        Map attachment = ['name': 'displayTable', 'parameters': params]
        JsonOutput.toJson(attachment)
    }

    static String displayTableWithMainTitle(def channel = "webview", def title, def footer = "", def enableSearch = true, def headers, def rows, def rowsPerPage = [5, 10, 25]) {
        Map params = ['title': title, 'enableSearch': enableSearch, 'headers': headers, 'rows': rows, 'rowsPerPage': rowsPerPage, 'overrideTitle': true]
        if (footer != "") {
            params.put("footer", footer)
        }
        Map attachment = ['name': 'displayTable', 'parameters': params]
        return JsonOutput.toJson(attachment)
    }

    static String displayClickableList(Map config) {
        Map attachment = ['name'     : 'displayCollection', 'hasLongOptions': config.get('hasLongOptions', false),
                          'permanent': config.get('permanent', false), 'disabled': config.get('disabled', false), 'parameters': ['content': config.content]]
        JsonOutput.toJson(attachment)
    }

    static String displayPermanentClickableList(def content, def channel, boolean hasLongOptions = false) {
        return displayClickableList(['content': content, hasLongOptions: hasLongOptions, 'permanent': true] as Map)
    }

    static String displayPermanentDisabledClickableList(def content, def channel, boolean hasLongOptions = false) {
        return displayClickableList(['content': content, hasLongOptions: hasLongOptions, 'permanent': true, 'disabled': true] as Map)
    }


    static String displayClickableList(def content, def channel, def hasLongOptions = false) {
        return displayClickableList(['content': content, hasLongOptions: hasLongOptions, 'permanent': false] as Map)
    }

    static String simpleDisplayClickableList(def content, def channel, def hasLongOptions = false) {
        def list = content.split(";")
        def title = list[0]
        def items = []
        list.eachWithIndex { button, idx ->
            if (idx > 0) {
                def item = [:]
                if (button.contains("|")) {
                    def buttonInfoArray = button.split("\\|");
                    item.put('name', buttonInfoArray[0])
                    item.put('text', buttonInfoArray[1])
                } else {
                    item.put('name', button)
                }

                items << item
            }
        }
        def formattedContent = [:]
        formattedContent.put("title", title)
        formattedContent.put("items", items)

        return displayClickableList(formattedContent, channel, hasLongOptions)
    }


    static String displayImage(Map config) {
        Map params = [image_url: config.imageUrl]
        Map attachment = [name: 'displayImage', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Displaying an Image")), parameters: params, inline: config.get('inline', true)]
        JsonOutput.toJson(attachment)
    }

    static String displayImage(def imageUrl, def channel, def inline = false) {
        Map params = [image_url: imageUrl]
        Map attachment = [name: 'displayImage', parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayImage(def title, def aria, def imageUrl, def channel, def inline = false) {
        Map params = [image_url: imageUrl]
        Map attachment = [name: 'displayImage', title: title, aria: aria, parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayImageCarousel(Map config) {
        Map params = [images: config.images]
        Map attachment = [name: 'displayImageCarousel', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Showing an Image Carousel")), parameters: params, inline: config.get('inline', true)]
        JsonOutput.toJson(attachment)
    }

    static String displayImageCarousel(def images, def channel, def inline = false) {
        Map params = [images: images]
        Map attachment = [name: 'displayImageCarousel', parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayImageCarousel(def title, def aria, def images, def channel, def inline = false) {
        Map params = [images: images]
        Map attachment = [name: 'displayImageCarousel', title: title, aria: aria, parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayCardCustomHtml(def model, String template) {
        def result = ""
        def items = []

        try {
            Pattern regex = Pattern.compile("(?:\\s|^)(\\w*)\\.(\\w*)", Pattern.CANON_EQ)
            Matcher regexMatcher = regex.matcher(template)
            while (regexMatcher.find()) {
                def item = [type: regexMatcher.group(1), value: model[regexMatcher.group(2),]]
                items.add(item)

            }
            Map attachment = ['name': 'displayCardCustomHtml', 'items': items, inline: true]
            result = JsonOutput.toJson(attachment)
        } catch (PatternSyntaxException ex) {
            ex.printStackTrace()
        }
        return result
    }

    static String displayModal(def model, String template) {
        def result = ""
        def items = []

        try {
            Pattern regex = Pattern.compile("(?:\\s|^)(\\w*)\\.(\\w*)", Pattern.CANON_EQ)
            Matcher regexMatcher = regex.matcher(template)
            while (regexMatcher.find()) {
                def item = [type: regexMatcher.group(1), value: model[regexMatcher.group(2),]]
                items.add(item)

            }
            Map attachment = ['name': 'displayModal', 'items': items]
            result = JsonOutput.toJson(attachment)
        } catch (PatternSyntaxException ex) {
            ex.printStackTrace()
        }
        return result
    }

    static String displayModal(def title, def aria, def model, String template) {
        def result = ""
        def items = []

        try {
            Pattern regex = Pattern.compile("(?:\\s|^)(\\w*)\\.(\\w*)", Pattern.CANON_EQ)
            Matcher regexMatcher = regex.matcher(template)
            while (regexMatcher.find()) {
                def item = [type: regexMatcher.group(1), value: model[regexMatcher.group(2),]]
                items.add(item)

            }
            Map attachment = ['name': 'displayModal', title: title, aria: aria, 'items': items]
            result = JsonOutput.toJson(attachment)
        } catch (PatternSyntaxException ex) {
            ex.printStackTrace()
        }
        return result
    }

    static String displayVideo(Map config) {
        Map params = [video_url: config.videoUrl]
        Map attachment = [name: 'displayVideo', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Displaying a Video")), parameters: params, inline: config.get('inline', true)]
        JsonOutput.toJson(attachment)
    }

    static String displayMap(Map config) {
        Map params = [address: config.address]
        Map attachment = [name: 'displayMap', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Displaying a Map")), parameters: params, inline: config.get('inline', true)]
        JsonOutput.toJson(attachment)
    }

    static String displayMap(def address, def channel, def inline = false) {
        Map params = [address: address]
        Map attachment = [name: 'displayMap', parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayMap(def title, def aria, def address, def channel, def inline = false) {
        Map params = [address: address]
        Map attachment = [name: 'displayMap', title: title, aria: aria, parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayAudio(Map config) {
        Map params = [video_url: config.videoUrl]
        Map attachment = [name: 'displayVideo', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Displaying a Video")), parameters: params, inline: config.get('inline', true)]
        JsonOutput.toJson(attachment)
    }

    static String displayVideo(def videoUrl, def channel, def inline = false) {
        Map params = [video_url: videoUrl]
        Map attachment = [name: 'displayVideo', parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayVideo(def title, def aria, def videoUrl, def channel, def inline = false) {
        Map params = [video_url: videoUrl]
        Map attachment = [name: 'displayVideo', title: title, aria: aria, parameters: params, inline: inline]
        JsonOutput.toJson(attachment)
    }

    static String displayPanel(Map config) {
        Map params = ['content': config.content]
        Map attachment = [name: 'displayPanelCard', title: config.get("title", ""), aria: config.get("aria", config.get("title", "Displaying a Panel")), parameters: params]
        JsonOutput.toJson(attachment)
    }

    static String displayPanel(def content, def channel) {
        Map params = ['content': content]
        Map attachment = [name: 'displayPanelCard', parameters: params]
        JsonOutput.toJson(attachment)
    }

    static String displayPanel(def title, def aria, def content, def channel) {
        Map params = ['content': content]
        Map attachment = [name: 'displayPanelCard', title: title, aria: aria, parameters: params]
        JsonOutput.toJson(attachment)
    }

    static String displayPanel(def title, def content, def channel) {
        Map params = ['content': content]
        Map attachment = [name: 'displayPanelCard', title: title, aria: title, parameters: params]
        JsonOutput.toJson(attachment)
    }

    static String removeIconSyntax(def content) {
        return content.replaceAll("\\[\\[(.{1,30}?)\\]", "");
    }

    private static String dateFormat(String isoDate) {
        Calendar cal = javax.xml.bind.DatatypeConverter.parseDateTime(isoDate)
        DateFormat df = DateFormat.getDateInstance()
        int hour = cal.get(Calendar.HOUR_OF_DAY)
        int minutes = cal.get(Calendar.MINUTE)
        return df.format(cal.getTime()) + " at " + java.time.LocalTime.of(hour, minutes).toString()
    }

    // DEMO SPECIFIC EXTENSIONS
    // MYTELECOM
    static String displayChecklist(def step, def failureStep) {
        def result = ''
        def title = 'Checklist'
        def items = []
        def stepLabels = ['Router Online', 'ISP Speed Good', 'Connected Devices']

        stepLabels.eachWithIndex {
            label,
            idx ->
                def color = 'grey'
                def icon = 'mdi-checkbox-multiple-blank-outline'
                if (idx <= step) {
                    color = 'success'
                    icon = 'mdi-checkbox-multiple-marked-outline'
                }
                if (idx == failureStep) {
                    color = 'error'
                    icon = 'mdi-alert-decagram-outline'
                }
                def theStep = [label: label, color: color, icon: icon]
                items.push(theStep)
        }

        def parameters = [
                'title': title,
                'items': items
        ]

        def action = [
                'name'      : 'displayRouterCheckList',
                'parameters': parameters
        ]

        JsonOutput.toJson(action as java.util.Map)
    }

    static String displaySabreResult(def pricedItineraryResult) {

        def result = ""
        Map params = [
            'result': pricedItineraryResult
        ]
        Map attachment = ["name": 'displaySabreResult', "parameters": params]
        result = JsonOutput.toJson(attachment)

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
            result = JsonOutput.toJson(["attachment": attachment] as java.util.Map)
        }

        if (channel == 'webview') { // construct json for webview itinerary
            Map params = [
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
            Map attachment = ["name": 'displayItinerary', "parameters": params]
            result = JsonOutput.toJson(attachment)
        }
        return result
    }

    // MYBANK
    static String displayTransactions(def transactions, def channel = "webview") {
        Map params = ['transactions': transactions]
        Map attachment = ['name': 'displayTransactionsTable', 'parameters': params]
        JsonOutput.toJson(attachment)
    }

    // MYBANK
    static String displayAccounts(def accountsTableContent, def channel = "webview") {
        Map params = ['accountsTableContent': accountsTableContent]
        Map attachment = ['name': 'displayAccountsTable', 'parameters': params]
        JsonOutput.toJson(attachment)
    }

}