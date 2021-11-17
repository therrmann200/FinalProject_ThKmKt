let geotiffUrl = 'data/NDVI500_2000_2005.tif';
//let map = L.map('map');
let paneId = 'animated_pane';

/* Dark basemap 
let url = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png';
L.tileLayer(url, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    pane: paneId
}).addTo(map);
*/
/* Pane holder for the set of rasters */
let paneObj = map.createPane(paneId);
paneObj.style.pointerEvents = 'none';

/* GeoTIFF with n bands */
d3.request(geotiffUrl).responseType('arraybuffer').get(
    function (error, tiffData) {
        let scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
        let bounds = {};
        let playerReferences = [];

        // if the geotiff file has the META_ADD and META_MULT metadata for linear transformation, consider it
        let tiff = GeoTIFF.parse(tiffData.response);
        let tiffMetaData = tiff.getImage().getGDALMetadata();
        let coefAdd = tiffMetaData.META_ADD ? parseFloat(tiffMetaData.META_ADD) : 0;
        let coefMult = tiffMetaData.META_MULT ? parseFloat(tiffMetaData.META_MULT) : 1;

        // just add leading zeros
        let padZeros = function (n, width) {
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
        }

        // create a canvas for each layer
        scalarFields.forEach(function (sf, index) {

            // linearly rescale image values
            let rescaleValue = function (e) { return e == null ? null : ((e * coefMult) + coefAdd) }
            sf.grid = sf.grid.map(function (e) {
                return e.map(function (e) { return rescaleValue(e); });
            });
            sf.range = sf.range.map(function (e) { return rescaleValue(e); });

            // add to map
            let layerSf = L.canvasLayer.scalarField(sf, {
                color: chroma.scale('YlGn').domain(sf.range),
                opacity: 0.65,
                pane: paneId
            }).addTo(map);

            playerReferences.push([layerSf, "At: " + padZeros(index, 2) + ":00"]);

            bounds = layerSf.getBounds();
        });

        // player control
        let layersControl = L.control.layersPlayer(playerReferences, paneId, {
            position: 'bottomleft',
            collapsed: false,
            refreshTime: 500,
            buttons: {
                moveFirst: {
                    cssClass: 'leaflet-control-layersPlayer-button'
                },
                playBackward: {
                    cssClass: 'leaflet-control-layersPlayer-button',
                    cssClassRun: 'leaflet-control-layersPlayer-button-run'
                },
                previous: {
                    cssClass: 'leaflet-control-layersPlayer-button'
                },
                next: {
                    cssClass: 'leaflet-control-layersPlayer-button'
                },
                playForward: {
                    cssClass: 'leaflet-control-layersPlayer-button',
                    cssClassRun: 'leaflet-control-layersPlayer-button-run'
                },
                moveLast: {
                    cssClass: 'leaflet-control-layersPlayer-button'
                },
                toggleLoop: {
                    cssClass: 'leaflet-control-layersPlayer-button',
                    cssClassRun: 'leaflet-control-layersPlayer-button-run'
                },
                stop: {
                    cssClass: 'leaflet-control-layersPlayer-button',
                    style: {
                        'color': '#993333'
                    }
                }
            }
        }).addTo(map);

        // response function for onClick
        layersControl.onClick = function (e) {

            let valueHtmlContent = function (v) {
                let formatedValue = (v ? v.toFixed(1) : (0).toFixed(1));
                return '<span class="popupText">Value: ' + formatedValue + ' mm</span>';
            }

            if (e.frameChange) {
                let popUp = L.Control.LayersPlayer.lastCreated.activePopup;
                if (!popUp) { return; }
                popUp.setContent(valueHtmlContent(e.value));

            } else {
                if (e.value == null) { return; }

                L.Control.LayersPlayer.lastCreated.activePopup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(valueHtmlContent(e.value))
                    .openOn(map);
            }

        };

        // move to first layer
        map.fitBounds(bounds);
        layersControl.goTo(0);
    });