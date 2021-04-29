//import 'ol/ol.css'
import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON} from 'ol/format'
import {Style as OLStyle, Fill as OLFill, Stroke as OLStroke, Circle as OLCircle} from 'ol/style';
import {
	and as andFilter,
	equalTo as equalToFilter,
	like as likeFilter,
  } from 'ol/format/filter';

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

/**************************/
/******** STYLE POI *******/
/**************************/

      // map the income level codes to a colour value, grouping them
      var incomeLevels = {
        'librairies': 'rgba(52, 73, 94,1.0)', // high income
        'histoire': 'rgba(52, 152, 219,1.0)', // high income OECD
        'cinema': 'rgba(211, 84, 0,1.0)', // high income, non-OECD
        'sport': 'rgba(241, 196, 15,1.0)', // upper middle income
      };

      // a default style is good practice!
	  var width = 3

      var defaultStyle = new OLStyle({
        fill: new OLFill({
			image: new OLCircle({
				radius: width * 2,
				fill: new OLFill({
				  color: '#FF00CC'
				}),
				stroke: new OLStroke({
				  color: '#FF00CC',
				  width: width / 2
				})
			  }),
			  zIndex: Infinity
			})
		})

      // a javascript object literal can be used to cache
      // previously created styles. Its very important for
      // performance to cache styles.
      var styleCache = {};

      // the style function returns an array of styles
      // for the given feature and resolution.
      // Return null to hide the feature.
      function styleFunction(feature, resolution) {
		  
        // get the incomeLevel from the feature properties
        var level = feature.get('type');
		
        // if there is no level or its one we don't recognize,
        // return the default style (in an array!)
        if (!level || !incomeLevels[level]) {
			console.log([defaultStyle])
          return [defaultStyle];
        }
        // check the cache and create a new style for the income
        // level if its not been created before.
        if (!styleCache[level]) {
			var fill = new OLFill({
				color: incomeLevels[level].replace(/[^,]+(?=\))/, '0.2')
			  });
			  var stroke = new OLStroke({
				color: incomeLevels[level],
				width: 1.25
			  });
			
			styleCache[level] = new OLStyle({
				image: new OLCircle({
				  fill: fill,
				  stroke: stroke,
				  radius: 3
				}),
				fill: fill,
				stroke: stroke
			  })			
			
        }
        // at this point, the style for the current level is in the cache
        // so return it (as an array!)
        return [styleCache[level]];
      }


/* Déclaration de la couche WFS OCS 10km*/
var poi10kmWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'POI 10km (WFS)',
	style: styleFunction
});

var poi10kmSportWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km_sport' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'POI 10km (WFS)',
	style: styleFunction
});

var poi10kmHistoireWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km_histoire' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'POI 10km (WFS)',
	style: styleFunction
});

var poi10kmCinemaWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km_cinema' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'POI 10km (WFS)',
	style: styleFunction
});

var poi10kmLibrairieWfs = new VectorLayer({
	source: new VectorSrc({
		/* Chargement du lien WFS en format json*/
		url: 'http://localhost:8080/geoserver/MyGeoServer/wfs' +
			'?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km_librairie' +
			'&srsName=epsg:2154&outputFormat=application/json',
		format: new GeoJSON(),
		serverType: 'geoserver',
	}),
	title: 'POI 10km (WFS)',
	style: styleFunction
});


export {myPositionWfs,ocs10kmWfs,poi10kmWfs,poi10kmSportWfs,poi10kmHistoireWfs,poi10kmCinemaWfs,poi10kmLibrairieWfs}



