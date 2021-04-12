//import 'ol/ol.css'
import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON} from 'ol/format'
import {Style as OLStyle, Fill as OLFill} from 'ol/style';


var sourceWFS = new VectorSrc({
	/* Chargement du lien WFS en format json*/
	url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
		'?service=WFS&version=1.1.0&request=getfeature&typeNames=myposition' +
		'&srsName=epsg:3857&outputFormat=application/json',
	format: new GeoJSON(),
	serverType: 'geoserver',
})

/* Déclaration de la couche WFS */
var myPositionWfs = new VectorLayer({
	source: sourceWFS,
	title: 'Ma Position (WFS)',
});



/* Déclaration de la couche WFS OCS 10km*/
var ocs10kmWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=clc18_10km_niv1' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'OCS 10km (WFS)',
});



export {myPositionWfs,ocs10kmWfs}



