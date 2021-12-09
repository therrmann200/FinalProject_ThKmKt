
//insert code here!
//var map;
var dataStats = {};
var geojson;
var info = L.control();

//define two different basemap variables
var openStreetMap = L.tileLayer('https://api.mapbox.com/styles/v1/therrmann/ckwpbw6m212h514p4x02rfbn5/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhlcnJtYW5uIiwiYSI6ImNrdGFuMHltYjFvM2oydW8wOGExaGJjZXUifQ.uQ3ywlhCjj5tRLf5Y3lcGQ', {
    attribution: '&copy; <a href=”https://www.mapbox.com/about/maps/”>Mapbox</a> &copy; <a href=”http://www.openstreetmap.org/copyright”>OpenStreetMap</a>'

});

var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/ktyler828/ckwxr646c1a9i14sf1nte6pjr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia3R5bGVyODI4IiwiYSI6ImNrdGFuazF1dzFudXoybm8weHlwZWtwNWwifQ.58u-6lfQ9ssj0It-Qgc3Fw', {
    attribution: '&copy; <a href=”https://www.mapbox.com/about/maps/”>Mapbox</a> &copy; <a href=”http://www.openstreetmap.org/copyright”>OpenStreetMap</a> &copy; <a href=”https://www.maxar.com/”>Maxar</a>'
});


var map = L.map('map', {
  keyboard:false,
  center: [39.07269613220839, -105.375888968249],
  zoom: 7,
  layers: [openStreetMap]});
  //.setView([39.07269613220839, -105.375888968249], 7);
//let map = L.map('map');

//set of our basemaps
var baseMaps = {
    "Grayscale": openStreetMap,
    "Satellite": satelliteMap
};

function createMap() {

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
    console.log(allValues)
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




//Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
    //create a Leaflet GeoJSON layer and add it to the map
    geojson = L.geoJson(data, {
        onEachFeature: onEachFeature,
        style: style
        /*
        pointToLayer: function (feature, latlng) {
           return pointToLayer(feature, latlng, attributes);
        }*/
    }).addTo(map);
};

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
        'Fire Name: ' + props.incidentna + '<br />' + 'Fire Year: ' + props.fireyear + '<br />' + 'Fire Size: ' + Math.round(props.gisacres) + ' acres'
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
        fillOpacity: .7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);

    console.log('fire id: ' + layer.feature.properties.FID_1);
    triggerLineHighlight(layer.feature.properties.FID_1);
}


function triggerMapHighlight(fire) {
    //console.log("triggerMapHighlight function starts")
    var layers = geojson.getLayers();
    //iterate through getLayers
    for (var i = 0; i < layers.length; i++) {
        //only if the state name is the same as the one passed to the function, change style
        //console.log(layers[i].feature.properties.FID_1);
        if (layers[i].feature.properties.FID_1 == fire) {
            console.log("true");

            var layer = layers[i];

            layer.setStyle({
                weight: 5,
                dashArray: '',
                fillOpacity: .7
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
            info.update(layer.feature.properties);
        }
    }
}
function triggerMapZoom(fire) {
    //console.log("triggerMapHighlight function starts")
    var layers = geojson.getLayers();
    //iterate through getLayers
    for (var i = 0; i < layers.length; i++) {
        //only if the state name is the same as the one passed to the function, change style
        //console.log(layers[i].feature.properties.FID_1);
        if (layers[i].feature.properties.FID_1 == fire) {
            console.log("true");
            var layer = layers[i];
            map.fitBounds(layer.getBounds());
            };


        }
    }

function triggerMapReset(fire) {
    //an array holding all the "layers" of the geojson "layergroup"
    var layers = geojson.getLayers();
    //iterate through getLayers
    for (var i = 0; i < layers.length; i++) {
        //only if state name is same as on passed to function, change style
        if (layers[i].feature.properties.FID_1 == fire) {
            var layer = layers[i];
            geojson.resetStyle(layer);
            info.update();
        }
    }
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
    triggerLineReset(layer.feature.properties.FID_1);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var layer = e.target;
    layer.bindPopup("Selected Year NDVI: " + Math.round(layer.feature.properties.ndvi_2000)/ 10000);
    //triggerLineHighlight(layer.feature.properties.FID_1);
}

function onEachFeature(feature, layer, attribute) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
    });


}
function updateLegend(attribute) {
    var year = attribute.split("_")[1];
    var content = "NDVI in " + year;
    $("temporal-legend").html(year);
};
function updatePropSymbols(attribute) {
    var year = attribute.split("_")[1];
    $("span.year").html(year);
    map.eachLayer(function (layer) {
        if (layer.feature && layer.feature.properties[attribute]) {
            layer.setStyle({
                weight: 2,
                opacity: 1,
                color: getColor(layer.feature.properties[attribute]),
                dashArray: '',
                fillOpacity: 0.4
            })
            layer.bindPopup("Selected Year NDVI: " + Math.round(layer.feature.properties[attribute])/ 10000);
        }

    });
    updateLegend(attribute);
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

            //$(container.append('year = ' + attributes[index]))

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
            index = index < 0 ? 20 : index;
            console.log(attributes[index]);
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

function forward(attributes){
    var index = $('.range-slider').val();
    index++;
    index = index > 20 ? 0 : index;
    $('.range-slider').val(index);
    console.log(attributes[index])
    updatePropSymbols(attributes[index]);
}
function reverse(attributes){
    var index = $('.range-slider').val();
    index--;
    index = index < 0 ? 20 : index;
    $('.range-slider').val(index);
    updatePropSymbols(attributes[index]);
}

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var div2 = L.DomUtil.create('div', 'info legend'),
                grades = [0, .0844, .1689, .2532, .3376, .4283, .5063],
                labels = [];
            $(div2).append('<h7 class= "temporalLegend"><center>Average NDVI in </br><b><span class="year">2000</span></b></center></h7>')
            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                $(div2).append(
                    '<i style="background:' + getColor(grades[i] * 10000) + '"></i> ' +
                    (Math.round(grades[i]*100)/100 + (grades[i + 1] ? '&ndash;' + Math.round((grades[i + 1]-.0001)*100)/100 + '<br>' : '+')));
            }

            return div2;
        }
    });

    map.addControl(new LegendControl());
};


//function to retrieve the data and place it on the map
function Data(map) {
    //load the data
    $.getJSON("data/co_fire_50_ndvi.json", function (response) {
        var attributes = processData(response);
        calcStats(response);
        createPropSymbols(response, attributes);
        createSequenceControls(attributes);
        createLegend(attributes);
        arrowkey1(attributes);
        arrowkey2(attributes);
    });
};


$(document).ready(createMap());

(function () {
    var control = new L.Control({ position: 'topright' });
    control.onAdd = function (map) {
        var azoom = L.DomUtil.create('a', 'resetzoom');
        azoom.innerHTML = "[Reset Zoom]";
        L.DomEvent
            .disableClickPropagation(azoom)
            .addListener(azoom, 'click', function () {
                map.setView([39.07269613220839, -105.375888968249], 7);
            }, azoom);
        return azoom;
    };
    return control;
}())
    .addTo(map);


function arrowkey1(attributes){
        $(document).bind("keydown", function(e){
            e = e || window.event;
            var charCode = e.which || e.keyCode;
            if(charCode == 39) forward(attributes);
        });
    };

function arrowkey2(attributes){
    $(document).bind("keydown", function(e){
        e = e || window.event;
        var charCode = e.which || e.keyCode;
        if(charCode == 37) reverse(attributes);
    });
};

//add layers control to toggle beween baseMaps
L.control.layers(baseMaps).addTo(map);
