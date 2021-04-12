import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import * as OLStyle from 'ol/style';
import Circle from 'ol/geom/Circle';

//Fonction qui renvoie un VectorLayer Point de l'endroit du clic

function setBuffer(coord,rayon,color){
    //let latLong = olProj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326')

    let myCircle = new Circle(coord,rayon)
    console.log(coord)

    let myCircleFeature = new Feature(myCircle)

    let vectorSource = new VectorSrc({
        projection: 'EPSG:3857',
    });
        
    vectorSource.addFeatures([myCircleFeature]);
        
    var layer = new VectorLayer({
        source: vectorSource,
        style: [
        new OLStyle.Style({
            stroke: new OLStyle.Stroke({
                //color: 'blue',
                color: color,
                width: 3
            }),
            fill: new OLStyle.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            })
        })]
    });
    return layer


}
export {setBuffer}
