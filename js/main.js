//insert code here!
var map;

function createMap() {

    map = L.map('map').setView([39.07269613220839, -105.375888968249], 7);

    var openStreetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    })

    openStreetMap.addTo(map);

    //call getData function
    Data(map);
};

//function to retrieve the data and place it on the map
function Data(map) {
    //load the data

    $.getJSON("data/co_fire.json", function (response) {

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
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            }
        }).addTo(map);
        var layer = L.leafletGeotiff("data/GeoTIFFproject/y2/Nov_2001.tif",options={band: 0,
            displayMin: 0,
            displayMax: 30,
            name: 'Wind speed',
            colorScale: 'rainbow',
            clampLow: false,
            clampHigh: true,
            //vector:true,
            arrowSize: 20,
        }
    ).addTo(map);

    });
};

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    click: zoomToFeature
  });
}

$(document).ready(createMap);
