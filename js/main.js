
//insert code here!
//var map;
var dataStats = {};
var info = L.control();
//let map = L.map('map');
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

function calcStats(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var incidentna of data.features) {
        //loop through each year
        for (var year = 2000; year <= 2020; year++) {
            //get population for current year
            var value = incidentna.properties["ndvi_" + String(year)];
            //add value to array
            allValues.push(value);
        }
    }
    //get minimum value of our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    var sum = allValues.reduce(function (a, b) { return a + b });
    dataStats.mean = sum / allValues.length;
    console.log(dataStats.max)
    console.log(dataStats.min)
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: getColor(feature.properties.ndvi_2000),
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

function getColor(d) {
    return d > 5062 ? '#005a32' :
        d > 4282 ? '#238b45' :
            d > 3375 ? '#41ab5d' :
                d > 2531 ? '#74c476' :
                    d > 1687 ? '#a1d99b' :
                        d > 843.7 ? '#c7e9c0' :
                            '#edf8e9';
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
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

//Above Example 3.10...Step 3: build an attributes array from the data
function processData(data) {
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with population values
        if (attribute.indexOf("ndvi") > -1) {
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

function updatePropSymbols(attribute) {
    var year = attribute.split("_")[1];
    $("span.year").html(year);
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            function style(feature) {
                return {
                    weight: 2,
                    opacity: 1,
                    color: getColor(feature.properties[attribute]),
                    dashArray: '',
                    fillOpacity: 0.4
                };
            }
        };
    });
    //updateLegend(attribute);
};


//Step 1: Create new sequence controls
function createSequenceControls(attributes) {
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');

            L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });

    map.addControl(new SequenceControl());



    $('.range-slider').attr({
        max: 20,
        min: 0,
        value: 0,
        step: 1
    });
    $('#reverse').html('<img src="img/reverse.png" width="50">');
    $('#forward').html('<img src="img/forward.png" width="50">');
    $('.step').click(function () {
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward') {
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 20 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 20 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);


        //Called in both step button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
    //Step 5: input listener for slider
    $('.range-slider').on('input', function () {
        var index = $(this).val();


        updatePropSymbols(attributes[index]);
    });
};
//function to retrieve the data and place it on the map
function Data(map) {
    //load the data

    $.getJSON("data/co_fire_50_ndvi.json", function (response) {
        var attributes = processData(response);
        calcStats(response);
        //createPropSymbols(response, attributes);
        createSequenceControls(attributes);
        //createLegend(attributes);
        //create a Leaflet GeoJSON layer and add it to the map
        L.geoJson(response, {
            onEachFeature: onEachFeature,
            style: style,
            pointToLayer: function (feature, latlng) {
                var attribute = attributes[0];

                //create marker options
                var options = {
                    fillColor: getColor(feature.properties.attValue),
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
            
                //For each feature, determine its value for the selected attribute
                var attValue = Number(feature.properties[attribute]);
                
            
                //Give each feature's circle marker a radius based on its attribute value
                options.fillColor = getColor(feature.properties.attValue);
            
                //create circle marker layer
                var layer = L.circleMarker(latlng, options);
            
                /*build popup content string
                var popupContent = new PopupContent(feature.properties, attribute);
            
                var popupContent2 = Object.create(popupContent);
            
                popupContent2.formatted = "<h2>" + popupContent.population + " million</h2>";
            
                layer.bindPopup(popupContent2.formatted, {
                    offset: new L.Point(0, -options.radius)
                });
                console.log(popupContent.formatted);
                */
            
                //return the circle marker to the L.geoJson pointToLayer option
                return layer;
            }
        }).addTo(map).bringToFront();
    });
};


$(document).ready(createMap());
