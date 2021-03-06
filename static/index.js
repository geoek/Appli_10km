/*************************************** */
/* AFFICHAGE D'UNE COUCHE WMS NON TUILEE */
/*************************************** */

// Import all bootstrap plugins
import * as bootstrap from 'bootstrap';

import 'ol/ol.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Map from 'ol/Map'
import View from 'ol/View'
import {ScaleLine, defaults as defaultControls} from 'ol/control'
import proj4 from 'proj4'
import {register} from 'ol/proj/proj4';
import { osmLayer, stamenLayer,zone10km,ocs10km,poi10km,myposition,zoneAchat,departLayer,departParamLayer } from './layersWms.js'
import Feature from 'ol/Feature';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Point from 'ol/geom/Point';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import {Group} from 'ol/layer'
import {myPositionWfs,ocs10kmWfs,poi10kmWfs,poi10kmSportWfs,poi10kmCinemaWfs,poi10kmLibrairieWfs,poi10kmHistoireWfs} from './layersWfs.js'
import {departementLayer} from './layersGeojson.js'
import {setPinOnMap} from './addPoint.js'
import {setBuffer} from './setBuffer.js'
import {makeGraphs} from './ocsGraph.js'
import {makePoiGraphs} from './poiGraph.js'
import Geolocation from 'ol/Geolocation'
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
  layers: [stamenLayer,osmLayer]
});

var overlays = new Group({
  title: 'Overlays',
  layers: [departementLayer,zoneAchat,zone10km,ocs10km,poi10kmWfs,myPositionWfs,poi10kmSportWfs,poi10kmCinemaWfs,poi10kmLibrairieWfs,poi10kmHistoireWfs]
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
	zoom: 7,
	extent: [50000, 5800000, 1300000, 7200000],  
  }),
});

zone10km.setVisible(false)
zoneAchat.setVisible(false)
myPositionWfs.setVisible(false)
ocs10km.setVisible(false)
poi10kmWfs.setVisible(false)
poi10kmSportWfs.setVisible(false)
poi10kmCinemaWfs.setVisible(false)
poi10kmLibrairieWfs.setVisible(false)
poi10kmHistoireWfs.setVisible(false)


var layerSwitcher = new LayerSwitcher({
  reverse: true,
  activationMode: 'click',
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);

//gestion du tri du tableau
/*
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
*/


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
  /*
  //juste pour afficher les coordonn??es
  var writer = new GeoJSON();
  var geojsonStr = writer.writeFeatures(source.getFeatures(), {
	dataProjection: 'EPSG:2154',
	featureProjection: 'EPSG:2154'
  })*/

  //d??sactivation de la localisation auto
  document.getElementById('geolocCheckBox').checked = false
  geolocation.setTracking(false) //car la fonction change sur la checkbox n'est pas appell?? automatiquement dans ce cas 

  // r??cup??ration des coordonn??es
  let coord = source.getFeatures()[0].values_.geometry.flatCoordinates
  let x = coord[0]
  let y = coord[1]

  calculateData(x,y)
})

function calculateData(x,y) {
  // appel Ajax pour acces base de donn??es (changement de myposition)
  $.ajax({
	url: "./setsql/",
	type: "get", //send it through get method
	data: { 
	  x: x, 
	  y: y
	},
	success: function(response) {
	  zone10km.setVisible(true)
	  zoneAchat.setVisible(true)
	  myPositionWfs.setVisible(true)
	  if ($("#ocsid").hasClass("active")) {
		ocs10km.setVisible(true)
	  }
	  if ($("#poiid").hasClass("active")) {
		poi10kmWfs.setVisible(true)
	  }
	  //zoom sur la position
	  map.getView().setZoom(11)
	  map.getView().setCenter([x,y])
	  //refresh de la map
	  zone10km.getSource().updateParams({"time": Date.now()})     //Refreq WMS Layer
	  ocs10km.getSource().updateParams({"time": Date.now()})      //Refreq WMS Layer
	  //poi10km.getSource().updateParams({"time": Date.now()})      //Refreq WMS Layer
	  zoneAchat.getSource().updateParams({"time": Date.now()})
	  myPositionWfs.getSource().refresh()                         //Refreq WFS Layer
	  poi10kmWfs.getSource().refresh()                         //Refreq WFS Layer
	  poi10kmSportWfs.getSource().refresh()                         //Refreq WFS Layer
	  poi10kmCinemaWfs.getSource().refresh()                         //Refreq WFS Layer
	  poi10kmHistoireWfs.getSource().refresh()                         //Refreq WFS Layer
	  poi10kmLibrairieWfs.getSource().refresh()                         //Refreq WFS Layer
	  // refresh de l'onglet POI
	  document.getElementById("filtrePoiBtn").innerHTML = 'Cat??gories'
	  //affichage du tableau concern??
	  document.getElementById("poiAggTable").style.display = "block"
	  document.getElementById("poiTable").style.display = "none"
	  //refresh des stats
	  makeGraphs()
	  makePoiGraphs("Categories")
	},
	error: function(xhr) {
	  console.log('ko')
	}
  });
  source.clear()
}

////////////////////////
// RESET POSITION BTN //
////////////////////////

document.getElementById('resetBtn').addEventListener('click', ()=>{
	zone10km.setVisible(false)
	zoneAchat.setVisible(false)
	myPositionWfs.setVisible(false)
	ocs10km.setVisible(false)
	poi10kmWfs.setVisible(false)
	poi10kmSportWfs.setVisible(false)
	poi10kmCinemaWfs.setVisible(false)
	poi10kmLibrairieWfs.setVisible(false)
	poi10kmHistoireWfs.setVisible(false)
	document.getElementById("ocsTable").style.display = "none"
	document.getElementById("chart").style.display = "none"
	document.getElementById("resetBtn").style.display = "none"
	document.getElementById("radioControl").style.display = "none"
	//init onglet POI
	document.getElementById("filtrePoiBtn").innerHTML = 'Cat??gories'
	//affichage du tableau concern??
	document.getElementById("poiAggTable").style.display = "none"
	document.getElementById("poiTable").style.display = "none"
});
//var graphBtn = document.getElementById("graphBtn");
//graphBtn.onclick = makeGraphs;

////////////////////////
//   GEOLOC     BTN   //
////////////////////////

document.getElementById('geolocCheckBox').addEventListener('change', function () {
	geolocation.setTracking(this.checked)
})

var geolocation = new Geolocation({
	// enableHighAccuracy must be set to true to have the heading value.
	trackingOptions: {
		enableHighAccuracy: true,
	},
	projection: map.getView().getProjection(),
});

var positionGeoloc = new Feature();
positionGeoloc.setStyle(
	new Style({
		image: new CircleStyle({
			radius: 3,
			fill: new Fill({
				color: '#3399CC',
			}),
			stroke: new Stroke({
				color: '#fff',
				width: 0.5,
			}),
		}),
	})
);

geolocation.on('change:position', function () {
	var coordinates = geolocation.getPosition();
	console.log(coordinates)
	positionGeoloc.setGeometry(coordinates ? new Point(coordinates) : null);
	calculateData(coordinates[0],coordinates[1])
});

// handle geolocation error.
geolocation.on('error', function (error) {
	var info = document.getElementById('info');
	info.innerHTML = error.message;
	info.style.display = '';
});

var accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
	accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

new VectorLayer({
	map: map,
	source: new VectorSrc({
		features: [accuracyFeature, positionGeoloc],
	}),
});


///////////////////////////
// Controles ONGLETS OCS //
///////////////////////////

$('input[type=radio][name=graphRadioGroup]').on('change', function() {
	switch ($(this).val()) {
		case 'graph':
			document.getElementById("chart").style.display = "block"
			document.getElementById("ocsTable").style.display = "none"
			break;
		case 'table':
			document.getElementById("chart").style.display = "none"
			document.getElementById("ocsTable").style.display = "block"
			break;
	}
});

//////////////////////////
// Controles ONGLET POI //
//////////////////////////

document.getElementById("liensDropdown").addEventListener('click', ()=>{
	var txt = event.target.innerHTML
	//mise ?? jour du label de la liste d??roulante
	document.getElementById("filtrePoiBtn").innerHTML = txt
	//affichage du tableau concern??
	if (txt != 'Cat??gories') {
		document.getElementById("poiAggTable").style.display = "none"
		document.getElementById("poiTable").style.display = "block"
		makePoiGraphs(txt.toLowerCase().replace(/ /g, ""))
		poi10kmWfs.setVisible(false)
		switch (txt) {
			case 'Sport':
				poi10kmSportWfs.setVisible(true)       
				poi10kmCinemaWfs.setVisible(false)        
				poi10kmHistoireWfs.setVisible(false)        
				poi10kmLibrairieWfs.setVisible(false) 
				break
			case 'Librairies':
				poi10kmLibrairieWfs.setVisible(true)
				poi10kmSportWfs.setVisible(false)        
				poi10kmCinemaWfs.setVisible(false)        
				poi10kmHistoireWfs.setVisible(false) 
				break
			case 'Cinema':
				poi10kmCinemaWfs.setVisible(true)
				poi10kmSportWfs.setVisible(false)      
				poi10kmHistoireWfs.setVisible(false)        
				poi10kmLibrairieWfs.setVisible(false)  
				break
			case 'Histoire':
				poi10kmHistoireWfs.setVisible(true)
				poi10kmSportWfs.setVisible(false)        
				poi10kmCinemaWfs.setVisible(false)       
				poi10kmLibrairieWfs.setVisible(false)  
				break
			default:
				break
		}
	}
	else {
		document.getElementById("poiAggTable").style.display = "block"
		document.getElementById("poiTable").style.display = "none"
		poi10kmWfs.setVisible(true)
		poi10kmSportWfs.setVisible(false)        
		poi10kmCinemaWfs.setVisible(false)        
		poi10kmHistoireWfs.setVisible(false)        
		poi10kmLibrairieWfs.setVisible(false)   
	}
})




/////////////////////////////
// CONTROLES CHGMT ONGLETS //
/////////////////////////////

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	if (e.target.id == 'ocsid' && zone10km.getVisible()) {
		console.log("OCS Tab")
		ocs10km.setVisible(true)
		poi10kmWfs.setVisible(false)
		poi10kmSportWfs.setVisible(false)
		poi10kmCinemaWfs.setVisible(false)
		poi10kmLibrairieWfs.setVisible(false)
		poi10kmHistoireWfs.setVisible(false)    
	} else if (e.target.id == 'poiid' && zone10km.getVisible()) {
		console.log("POI Tab")
		ocs10km.setVisible(false)
		poi10kmWfs.setVisible(true)
	} 
})



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
// Cr??ation des buffers directement avec OL //
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