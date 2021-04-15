
import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'
import * as OLStyle from 'ol/style'
import * as Proj from 'ol/proj'
import proj4 from 'proj4'
import {register} from 'ol/proj/proj4';

proj4.defs("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
// ensure OL knows about the PROJ4 definitions
register(proj4);

//Fonction qui renvoie un VectorLayer Point de l'endroit du clic

function setPinOnMap(evt){
    let latLong = Proj.transform(evt.coordinate, 'EPSG:2154', 'EPSG:2154')
    let lat     = latLong[1]
    let long    = latLong[0]
    console.log(latLong)
  
    let feature = new Feature({
      type: 'icon',
      geometry: new Point(latLong,'XY'),
      name: 'My Position'
    });
  
    let iconStyle = new OLStyle.Style({  
      image: new OLStyle.Circle({
        radius: 7,
        fill: new OLStyle.Fill({color: 'black'}),
        stroke: new OLStyle.Stroke({
          color: 'white',
          width: 2,
        })
      })
    })
  
    feature.setStyle(iconStyle);
  
    let vectorSource = new VectorSrc({
        features: [feature]
    })
    
    let dinamicPinLayer = new VectorLayer({
        source: vectorSource
    })
    
    return dinamicPinLayer
  }

  
export {setPinOnMap};