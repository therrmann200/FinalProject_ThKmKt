//insert code here!
var map;

function createMap(){

    map = L.map('map').setView([39.07269613220839, -105.375888968249], 7);

    var openStreetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    })

    openStreetMap.addTo(map);

    //call getData function
    getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.getJSON("data/co_fire.json", function(response){

      //create marker options
      var geojsonMarkerOptions = {
          radius: 2,
          fillColor: "magenta",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
      };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
            }}).addTo(map);
    });
};

$(document).ready(createMap);
