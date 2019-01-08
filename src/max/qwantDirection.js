// Qwant Direction plugin
// ======================


window.QwantDirection = {

  // Config
  // ------

  map: null,
  marker: null,
  focus: null,


  // Private vars
  // ------------

  // Keep track of the number of route sets and routes drawn on the map
  routeset: 0,
  routes: 0,

  // Current autocomplete's json
  current_suggest_list: [],

  // Current search's routes
  direction_routes: [],

  // Helpers
  // -------

  // GetById
  $i: function(i){
    return document.getElementById(i);
  },

  // Decode a polygon encoded in ASCII into an array of lnglat coords
  // Source: mapbox-directions.js
  polyline_decode: function(str, precision){
    var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 5);
    while (index < str.length) {
      byte = null;
      shift = 0;
      result = 0;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
      shift = result = 0;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += latitude_change;
      lng += longitude_change;
      coordinates.push([lng / factor, lat / factor]);
    }
    return coordinates;
  },

  // Draw UI


  // Draw a polygon (array of lng,lat) on the map with a given color and optionally zoom on it
  show_polygon: function(polygon, color, zoom, resetzoom){

    var geojson = {
      "id": "route" + QwantDirection.routeset + "-" + (QwantDirection.routes++),
      "type": "line",
      "source": {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": polygon
          }
        }
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": color,
        "line-width": 5
      }
    };

    QwantDirection.map.addLayer(geojson);

  },

  // Show/hide a roadmap (HTML)
  toggle_route: function(i){

    var container = QwantDirection.$i("itinerary_leg_detail_" + i);

    // Open
    if(container.innerHTML === ""){

      // Close previously opened roadmap (if any)
      for(var z = 0; z < 3; z++){
        if(QwantDirection.$i("itinerary_leg_detail_" + z)){
          QwantDirection.$i("itinerary_leg_detail_" + z).innerHTML = "";
          QwantDirection.$i("itinerary_leg_via_details_icon_" + z).classList.remove("open");
          QwantDirection.$i("itinerary_leg_" + z).classList.remove("itinerary_leg_selected");
        }
      }

      // Hide all routes and subroutes except the first ones in grey
      for(var z = QwantDirection.direction_routes.routes.length; z < QwantDirection.routes; z++){
        QwantDirection.map.setLayoutProperty("route" + QwantDirection.routeset + "-" + z, 'visibility', 'none');
      }

      // Display the main route in blue
      QwantDirection.show_polygon(QwantDirection.polyline_decode(QwantDirection.direction_routes.routes[i].geometry), "#4ba2ea", true);


      html = "";

      for(j in QwantDirection.direction_routes.routes[i].legs[0].steps){
        var step = QwantDirection.direction_routes.routes[i].legs[0].steps[j];
        html += "<div class='itinerary_roadmap_step'>";
        html += "  <div class='itinerary_roadmap_icon itinerary_roadmap_icon_" + (step.maneuver.modifier || step.maneuver.type).replace(/\s/g,"-") + "'></div>";
        html += "  <div class=itinerary_roadmap_instruction_and_distance>";
        html += "    <div class=itinerary_roadmap_instruction>" + step.maneuver.instruction + "</div>";
        html += "    <div class=itinerary_roadmap_distance>" + QwantDirection.distance(step.distance) + "</div>";
        html += "  </div>";
        html += "</div>";
      }
      QwantDirection.$i("itinerary_leg_detail_" + i).innerHTML = html;
      QwantDirection.$i("itinerary_leg_via_details_icon_" + i).classList.add("open");
      QwantDirection.$i("itinerary_leg_" + i).classList.add("itinerary_leg_selected");
      QwantDirection.$i("itinerary_roadmap").scrollTop = i * 95 - 95;
    }

    // Close
    else {
      QwantDirection.$i("itinerary_leg_detail_" + i).innerHTML = "";
      QwantDirection.$i("itinerary_leg_via_details_icon_" + i).classList.remove("open");
      //QwantDirection.$i("itinerary_roadmap").scrollTop = i * 95;
    }
  },

  showRouteStep: function(i, j){
    //QwantDirection.show_polygon(QwantDirection.polyline_decode(QwantDirection.direction_routes.routes[i].legs[0].steps[j].geometry), "red", false);
  },

  hideRouteStep: function(i, j){
    //QwantDirection.map.setLayoutProperty("route" + i + "-" + j, 'visibility', 'none')
  },

  // Autocompletion
  autocompletion: function(input, divHandler, gps){
    let div = document.getElementById(divHandler)

    // Mobile: change form appearance
    QwantDirection.$i("itinerary_container").classList.add("itinerary_container_focused");
    QwantDirection.$i(input).classList.add("itinerary_input_focused");

    QwantDirection.focus = input;
    div.innerHTML = "";
    if(QwantDirection.$i(input).value === _('Your position')){
      QwantDirection.
      $i(input).value = "";
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", geocoder_url.replace("{q}", encodeURIComponent(QwantDirection.$i(input).value.replace(_('Your position'),""))).replace("{language}", QwantDirection.language));
    xhr.send();
    xhr.onload = function(){
      var json = JSON.parse(xhr.response);
      if(xhr.responseURL.includes("q=" + encodeURIComponent(QwantDirection.$i(input).value)) + "&"){
        QwantDirection.current_suggest_list = json;
        var html = "";
        if(navigator.geolocation){
          html += "";
        }
        for(var i in json.features){
          var regions = json.features[i].properties.geocoding.administrative_regions;
          var label = json.features[i].properties.geocoding.label;
          label = label.split(",", 2);
          var line1 = label[0];
          var line2 = label[1] ? label[1] : ((regions && regions.length > 0) ? regions[regions.length - 1].label : "");
          line2 = line2.split(",")[0];

          var icon = "marker2";
          /*
          // TODO: use icon manager
          if(json.features[i].properties.geocoding.type == "poi" && json.features[i].properties.geocoding.poi_types && json.features[i].properties.geocoding.poi_types.length > 0){
             icon = json.features[i].properties.geocoding.poi_types[0].id;
          }*/

          html += "<div class=itinerary_autocomplete_item onclick=\"QwantDirection.chooseSuggestion('" + input + "','" + gps + "','" + divHandler + "','" + i + "')\"><div class='autocomplete-icon icon icon-" + icon + "'></div><div class=itinerary_suggest_line1>"+line1+"</div><div class=itinerary_suggest_line2>"+line2+"</div></div>";
        }
        QwantDirection.$i(divHandler).innerHTML = html;
      }
    };
  },

  closeAutocomplete: function(div){

    // Mobile: change form appearance on blur
    QwantDirection.$i("itinerary_container").classList.remove("itinerary_container_focused");
    QwantDirection.$i("itinerary_input_start").classList.remove("itinerary_input_focused");
    QwantDirection.$i("itinerary_input_end").classList.remove("itinerary_input_focused");

    setTimeout(function(){
      QwantDirection.$i(div).innerHTML = "";
    },300);
  },

  // Duration formatter


  // Distance formatter (km)
  distance: function(m){
    var ret = "";
    if(m > 5){
      if(m > 1000){
        if(m > 99000){
          ret = Math.round(m / 1000) + "km";
        }
        else {
          ret = (m / 1000).toFixed(1).replace(".",",") + "km";
        }
      }
      else {
        ret = m.toFixed(0) + "m";
      }
    }
    return ret;
  },

  // Choose a suggestion
  chooseSuggestion: function(input, gpsinput, div, i){

    // Fill input
    QwantDirection.$i(input).value = QwantDirection.current_suggest_list.features[i].properties.geocoding.label.split(",")[0];

    // Fill coordinates input
    QwantDirection.$i(gpsinput).value = QwantDirection.current_suggest_list.features[i].geometry.coordinates;

    // Hide suggestions
    QwantDirection.$i(div).innerHTML = '';

    // Launch search if both fields aren't empty
    QwantDirection.search();
  },

  // Choose current position
  chooseCurrentPosition: function(input, gpsinput, div){

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){

        // Fill input
        QwantDirection.$i(input).value = _('Your position');

        // Fill coordinates input
        QwantDirection.$i(gpsinput).value = position.coords.longitude + "," + position.coords.latitude;

        // Hide suggestions
        QwantDirection.$i(div).innerHTML = '';
      });
    }

    // Launch search if both fields aren't empty
    QwantDirection.search();
  },

  // Search
  search: function(vehicle){




    // Remove previous markers
    if(QwantDirection.marker1){
      QwantDirection.marker1.remove();
    }

    if(QwantDirection.marker2){
      QwantDirection.marker2.remove();
    }

    var start = QwantDirection.$i("itinerary_gps_start").value;
    var end = QwantDirection.$i("itinerary_gps_end").value;

    // Launch search if both fields aren't empty
    if(QwantDirection.$i("itinerary_gps_start").value != "" && QwantDirection.$i("itinerary_gps_end").value != ""){

      // Hide all previous routes
      for(var i = 0; i < QwantDirection.routes; i++){
        QwantDirection.map.setLayoutProperty("route" + QwantDirection.routeset + "-" + i, 'visibility', 'none');
      }

      // New route set
      QwantDirection.routes = 0;
      QwantDirection.routeset++;

      // Do the request
      var startcoordinates = start.split(",").map(Number);
      var endcoordinates = end.split(",").map(Number);

      var vehicle = vehicle || (
        /*QwantDirection.$i("vehicle_traffic").checked ? "driving-traffic":*/
        QwantDirection.$i("itinerary_car").checked ? "driving" :
          QwantDirection.$i("itinerary_foot").checked ? "walking":
            QwantDirection.$i("itinerary_bike").checked ? "cycling" :
              /*QwantDirection.$i("vehicle_bus").checked ? "bus":*/
              ""
      );

      var exclude = /*QwantDirection.$i("exclude_none").checked ? "":
                    QwantDirection.$i("exclude_toll").checked ? "&exclude=toll":
                    QwantDirection.$i("exclude_motorway").checked ? "&exclude=motorway":
                    QwantDirection.$i("exclude_ferry").checked ? "&exclude=ferry":*/
        "";

      var xhr = new XMLHttpRequest();
      xhr.open("GET", directions_url.replace("{vehicle}", vehicle).replace("{start_lnglat}", start).replace("{end_lnglat}", end).replace("{token}", accessToken).replace("{language}", QwantDirection.language).replace("{exclude}", exclude));
      xhr.send();
      xhr.onload = function(){
        var json = JSON.parse(xhr.response);
        var html = "";
        QwantDirection.direction_routes = json;

        // Desktop
        if(window.innerWidth > 640){

          for(i in json.routes){
            html += "<div class='itinerary_leg" + (i == 0 ? ' itinerary_leg_selected' : '') + "' id=itinerary_leg_"+i+">";
            html += "  <div class=itinerary_leg_inner>";

            html += "    <div class='itinerary_leg_icon itinerary_leg_icon_" + vehicle + "'></div>";
            html += "    <div class='itinerary_leg_via'>";
            html += "      <div class='itinerary_leg_via_title'>" + _('Via ') + (json.routes[i].legs[0].summary.replace(/^(.*), (.*)$/, "$1")) + "</div>";
            html += "      <div class='itinerary_leg_via_details' onclick=QwantDirection.toggle_route(" + i + ")><span class='itinerary_leg_via_details_icon' id='itinerary_leg_via_details_icon_" + i + "'></span>" + _('DETAILS') + "</div>";
            html += "    </div>";
            html += "    <div class='itinerary_leg_info'>";
            html += "     <div class='itinerary_leg_duration'>"+ QwantDirection.duration(json.routes[i].legs[0].duration, false) + "</div>";
            html += "     <div class='itinerary_leg_distance'>"+ QwantDirection.distance(json.routes[i].legs[0].distance) + "</div>";
            html += "    </div>";
            html += "    <div class=itinerary_leg_detail id=itinerary_leg_detail_" + i + "></div>";
            html += "  </div>";
            html += "</div>";
          }
        }

        // Mobile
        else {
          html += "<div class='itinerary_leg' id=itinerary_leg>";
          html += "  <div class=itinerary_leg_inner>";
          html += "    <div class='itinerary_leg_close' onclick=QwantDirection.close_leg()></div>";
          html += "    <div class='itinerary_leg_duration'>"+ QwantDirection.duration(json.routes[0].legs[0].duration, false) + "</div>";
          html += "    <div class='itinerary_leg_distance'>("+ QwantDirection.distance(json.routes[0].legs[0].distance) + ")</div>";
          html += "    <div class='itinerary_leg_via'>";
          html += "      <div class='itinerary_leg_via_title'>" + _('Via ') + (json.routes[0].legs[0].summary.replace(/^(.*), (.*)$/, "$1")) + "</div>";
          html += "    </div>";
          html += "    <div class='itinerary_leg_preview' onclick=QwantDirection.preview(0,0)><span class='itinerary_leg_preview_icon'></span>" + _('PREVIEW') + "</div>";
          html += "  </div>";
          html += "</div>";
        }

        QwantDirection.$i("itinerary_roadmap").innerHTML = html;

        if(json.routes && json.routes.length > 0){

          // Display all the route on the map in grey
          // (layer names = "route_" + routeset + "_" + 0 / (1) / (2))
          for(var i in json.routes){
            QwantDirection.show_polygon(QwantDirection.polyline_decode(json.routes[i].geometry), "#c8cbd3", false);
          }

          // Display the main route in blue
          QwantDirection.show_polygon(QwantDirection.polyline_decode(json.routes[0].geometry), "#4ba2ea", true)

          // Custom markers
          var el = document.createElement('div');
          el.className = vehicle === "walking" ? 'itinerary_marker_start_walking' : 'itinerary_marker_start';

          QwantDirection.marker1 = new mapboxgl.Marker(el)
            .setLngLat(startcoordinates)
            .addTo(QwantDirection.map);

          el = document.createElement('div');
          el.className = 'itinerary_marker_end';

          QwantDirection.marker2 = new mapboxgl.Marker(el)
            .setLngLat(endcoordinates)
            .addTo(QwantDirection.map);
        }
        else {
          alert(_("No routes found"));
        }
      };
    }

    // If only "start" is filled, zoom on it
    else if(start != ""){
      var startcoordinates = start.split(",").map(Number);
      QwantDirection.map.flyTo({
        center: startcoordinates,
        zoom: 9
      });

      var el = document.createElement('div');
      el.className = vehicle === "walking" ? 'itinerary_marker_start_walking' : 'itinerary_marker_start';

      QwantDirection.marker1 = new mapboxgl.Marker(el)
        .setLngLat(startcoordinates)
        .addTo(QwantDirection.map);

    }

    // If only "end" is filled, zoom on it
    else if(end != ""){
      var endcoordinates = end.split(",").map(Number);
      QwantDirection.map.flyTo({
        center: endcoordinates,
        zoom: 9
      });

      var el = document.createElement('div');
      el.className = 'itinerary_marker_end';

      QwantDirection.marker2 = new mapboxgl.Marker(el)
        .setLngLat(endcoordinates)
        .addTo(QwantDirection.map);
    }
  },

  // Close leg selection (on mobile)
  close_leg: function(){
    QwantDirection.$i("itinerary_roadmap").innerHTML = "";
  },

  // Preview one step of the route (on mobile)
  preview: function(route, step){

    var step = QwantDirection.direction_routes.routes[0].legs[route].steps[step];

    //console.log(step);

    // Hide leg selection
    QwantDirection.close_leg();

    // zoom on road step
    QwantDirection.show_polygon(QwantDirection.polyline_decode(step.geometry), '#4ba2ea', true);

    // Show step detail
    QwantDirection.$i("itinerary_container").classList.add("mobile_step_by_step");
    var html = `
      <div class=itinerary_mobile_step>
        <div class='itinerary_roadmap_icon itinerary_roadmap_icon_${ (step.maneuver.modifier || step.maneuver.type).replace(/\s/g,"-") }'></div>
        
        <div class=itinerary_roadmap_instruction_and_distance>
          <div class=itinerary_roadmap_distance>${ QwantDirection.distance(step.distance) }</div>
          <div class=itinerary_roadmap_instruction>${ step.maneuver.instruction }</div>
        </div>
      </div>
      
      <div class=itinerary_mobile_step_buttons>
        <div class=itinerary_mobile_step_button_left></div>
        <div class=itinerary_mobile_step_button_right></div>
      </div>
    `;
    QwantDirection.$i("itinerary_roadmap").innerHTML = html;
  },

  // Invert start and end
  invert_start_end: function(){

    var tmp = QwantDirection.$i("itinerary_input_end").value;
    QwantDirection.$i("itinerary_input_end").value = QwantDirection.$i("itinerary_input_start").value;
    QwantDirection.$i("itinerary_input_start").value = tmp;

    tmp = QwantDirection.$i("itinerary_gps_end").value;
    QwantDirection.$i("itinerary_gps_end").value = QwantDirection.$i("itinerary_gps_start").value;
    QwantDirection.$i("itinerary_gps_start").value = tmp;

    // Launch search if both fields aren't empty
    QwantDirection.search();
  },

  // Submit form with keyboard
  press_enter: function(){

    // Choose first choice of current autocomplete (if any)
    if(QwantDirection.focus){

      //console.log(QwantDirection.current_suggest_list.features[0].properties.geocoding.label.split(",")[0]);

      // Fill input
      QwantDirection.$i(QwantDirection.focus).value = QwantDirection.current_suggest_list.features[0].properties.geocoding.label.split(",")[0];

      // Fill coordinates input
      var gpsinput = QwantDirection.focus == "itinerary_input_start" ? "itinerary_gps_start" : "itinerary_gps_end";
      QwantDirection.$i(gpsinput).value = QwantDirection.current_suggest_list.features[0].geometry.coordinates;
    }

    // Launch search
    QwantDirection.search()
  }


};

export default window.QwantDirection