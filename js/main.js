//insert code here!
var map;
var info = L.control();

function createMap() {

    map = L.map('map').setView([39.07269613220839, -105.375888968249], 7);

    var openStreetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    })

    openStreetMap.addTo(map);

    //call getData function
    Data(map);
    info.addTo(map);
};

//function to retrieve the data and place it on the map
function Data(map) {
    //load the data

    $.getJSON("data/co_fire_large.json", function (response) {



        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            onEachFeature: onEachFeature,
            style: style,
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

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'orange',
        dashArray: '',
        fillOpacity: 0.4
    };
}

//When adding the info
info.onAdd = function (map) {
    //"this" returns to info.
    this._div = L.DomUtil.create('div', 'info');
    //the following line calls info.update(props) function. Again, this refers to 'info' here
    this.update();
    return this._div;
};

//Update the info based on what state user has clicked on
info.update = function (props) {
    this._div.innerHTML = '<h4>Fire Information</h4>' + (props ?
        'Fire Name: ' + props.incidentna + '<br />' + 'Fire Year: ' + props.fireyear + '<br />' + 'Fire Size: ' + props.gisacres + ' acres'
        : 'Hover over a fire');
};

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}


function resetHighlight(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 2,
    opacity: 1,
    color: 'orange',
    dashArray: '',
    fillOpacity: 0.4
  });
  info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

$(document).ready(createMap);
