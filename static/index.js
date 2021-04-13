/*************************************** */
/* AFFICHAGE D'UNE COUCHE WMS NON TUILEE */
/*************************************** */
import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Map from 'ol/Map'
import View from 'ol/View'
import {ScaleLine, defaults as defaultControls} from 'ol/control'
import proj4 from 'proj4'
import {register} from 'ol/proj/proj4';
import { osmLayer, stamenLayer,zone10km,ocs10km,myposition,zoneAchat,departLayer,departParamLayer } from './layersWms.js'
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import {Group} from 'ol/layer'
import {buildTable, sortTable} from './table.js'
import {myPositionWfs,ocs10kmWfs} from './layersWfs.js'
import {departementLayer} from './layersGeojson.js'
import {setPinOnMap} from './addPoint.js'
import {setBuffer} from './setBuffer.js'
import {makeGraphs} from './graph.js'
import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON} from 'ol/format'
import Draw from 'ol/interaction/Draw'
import $ from 'jquery'; // pour AJAX acces postGis

// ajout de la projection 2154
proj4.defs('EPSG:2154',"+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// ensure OL knows about the PROJ4 definitions
register(proj4);

/* Liste des couches */
/*
  osmLayer,
  stamenLayer,
  departLayer,
  departementLayer, // From VectorLayer (GeoJson local)
  zoneAchat,        // From ImageLayer (WMS)
  zone10km,         // From ImageLayer (WMS)
  myposition,
  myPositionWfs,    // From VectorLayer (WFS)     
  vectorDraw,
  wfsImageLayer
  departParamLayer,
*/


var baselayers = new Group({
  'title': 'Base Maps',
  layers: [osmLayer, stamenLayer]
});

var overlays = new Group({
  title: 'Overlays',
  layers: [departementLayer,zoneAchat,zone10km,ocs10km,myPositionWfs]
});

var map = new Map({
  controls: defaultControls().extend([
    new ScaleLine({
      units: 'degrees',
    }) ]),
  layers: [baselayers, overlays],
  target: document.getElementById('map'),
  view: new View({
    projection: 'EPSG:2154',
    center: [771000,6200000],
    zoom: 8,
    extent: [50000, 5800000, 1300000, 7200000],  
  }),
});

var layerSwitcher = new LayerSwitcher({
  reverse: true,
  activationMode: 'click',
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);

/////////////////////////
// Gestion de la table //
/////////////////////////

var myArray = [
  {'name':'Michael', 'age':'30', 'birthdate':'11/10/1989'},
  {'name':'Mila', 'age':'32', 'birthdate':'10/1/1989'},
  {'name':'Paul', 'age':'29', 'birthdate':'10/14/1990'},
  {'name':'Dennis', 'age':'25', 'birthdate':'11/29/1993'},
  {'name':'Tim', 'age':'27', 'birthdate':'3/12/1991'},
  {'name':'Erik', 'age':'24', 'birthdate':'10/31/1995'},
]

//affichage du tableau
buildTable(myArray)

//gestion du tri du tableau
$('th').on('click', function(){
	var column = $(this).data('column')
	var order = $(this).data('order')
	var text = $(this).html()
	text = text.substring(0, text.length - 1)
	if(order == 'desc'){
		$(this).data('order', "asc")
		myArray = myArray.sort((a,b) => a[column] > b[column] ? 1 : -1)
		text += '&#9660'
	}else{
		$(this).data('order', "desc")
		myArray = myArray.sort((a,b) => a[column] < b[column] ? 1 : -1)
		text += '&#9650'
	}
	$(this).html(text)
	buildTable(myArray)
})


/////////////////////////////////////////////////////////////////////
// Affichage des buffers depuis Postgis avec update de la position //
/////////////////////////////////////////////////////////////////////

var source = new VectorSrc({wrapX: false});

var draw = new Draw({
    source: source,
    type: ("Point")
});
map.addInteraction(draw);



map.on("singleclick", function(evt){
  //juste pour afficher les coordonnées
  var writer = new GeoJSON();
  var geojsonStr = writer.writeFeatures(source.getFeatures(), {
    dataProjection: 'EPSG:2154',
    featureProjection: 'EPSG:2154'
  })

  // récupération des coordonnées
  let coord = source.getFeatures()[0].values_.geometry.flatCoordinates
  let x = coord[0]
  let y = coord[1]

  // appel Ajax pour acces base de données (changement de myposition)
  $.ajax({
    url: "./setsql/",
    type: "get", //send it through get method
    data: { 
      x: x, 
      y: y
    },
    success: function(response) {
      //refresh de la map
      zone10km.getSource().updateParams({"time": Date.now()})     //Refreq WMS Layer
      ocs10km.getSource().updateParams({"time": Date.now()})     //Refreq WMS Layer
      zoneAchat.getSource().updateParams({"time": Date.now()})
      myPositionWfs.getSource().refresh()                         //Refreq WFS Layer
      makeGraphs()
    },
    error: function(xhr) {
      console.log('ko')
    }
  });
  source.clear()
})

var graphBtn = document.getElementById("graphBtn");
graphBtn.onclick = makeGraphs;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                     NOT USED                                                //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
//////////////////////////////////////////////
// Création des buffers directement avec OL //
//////////////////////////////////////////////

let myPositionOlLayer
let my10kmOlLayer
let my30kmOlLayer

map.on("dblclick", function(evt){
  map.removeLayer(myPositionOlLayer)
  map.removeLayer(my10kmOlLayer)
  map.removeLayer(my30kmOlLayer)
  myPositionOlLayer=setPinOnMap(evt)
  map.addLayer(myPositionOlLayer)

  var source = myPositionOlLayer.getSource();
  source.forEachFeature(function(feature){
    var coord = feature.getGeometry().getCoordinates();
    console.log(coord)
    my10kmOlLayer=setBuffer(coord,10000,'red')
    map.addLayer(my10kmOlLayer)
    my30kmOlLayer=setBuffer(coord,30000,'green')
    map.addLayer(my30kmOlLayer)
  });
})

*/