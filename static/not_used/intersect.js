import * as turf from "@turf/turf"
import GeoJSON from 'ol/format/GeoJSON';

var newDeptLayer
function isIntersect(coord,polygonLayer){
    let point = turf.point(coord);
    console.log(polygonLayer.getSource())
    let dept = turf.polygon(polygonLayer.getSource());
    

    var format = new GeoJSON();
    marker = format.readFeature(dept)
    source.addFeature(marker)
    newDeptLayer = new VectorLayer({
        source: source,
      });

    console.log(turf.booleanIntersects(dept, point))

}

export {isIntersect,newDeptLayer}