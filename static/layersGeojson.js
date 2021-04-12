import VectorSrc from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import {GeoJSON} from 'ol/format'
import {Fill, Stroke, Style, Text} from 'ol/style';

var departementStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new Stroke({
      color: '#319FD3',
      width: 1,
    }),
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
    }),
  });

var departementLayer = new VectorLayer({
    source: new VectorSrc({
      url: 'data/departement.geojson',
      format: new GeoJSON(),
    }),
    style: function (feature) {
        departementStyle.getText().setText(feature.get('code_insee'));
      return departementStyle;
    },
    title: 'Departements (GeoJSON local)',
  });

export {departementLayer}