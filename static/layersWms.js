//Pour WMS
import OSM from 'ol/source/OSM';
import Stamen from 'ol/source/Stamen';
import ImageWMS from 'ol/source/ImageWMS';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';



  let osmLayer = new TileLayer({
      source: new OSM(),
      type: 'base',
      title: 'OSM WMS',
    })
  
  let stamenLayer = new TileLayer({
    source: new Stamen({
      layer: 'watercolor',
    }),
    opacity: 0.8,
    type: 'base',
    title: 'Stamen WMS',  
  })
  
  
  // couche wms from Postgres
  let departLayer = new ImageLayer({
    extent: [-601486,4091922,1652323,7173780],
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
      params: {'LAYERS': 'MyGeoServer:dept_metropole'},
      ratio: 1,
      serverType: 'geoserver',
    }),
  })
  departLayer.set('title', 'Departements WMS (PostGis)');
  
  // couche 10km from Postgres
  let zone10km = new ImageLayer({
    extent: [-601486,4091922,1652323,7173780],
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
      params: {'LAYERS': 'MyGeoServer:v_10km'},
      ratio: 1,
      serverType: 'geoserver',
    }),
    title: 'Zone 10km WMS (PostGis)',
  })
  
    // couche 30km+dept from Postgres
    let zoneAchat = new ImageLayer({
      extent: [-601486,4091922,1652323,7173780],
      source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
        params: {'LAYERS': 'MyGeoServer:v_zone_achat'},
        ratio: 1,
        serverType: 'geoserver',
      }),
      title: 'Zone achat WMS (PostGis)',
    })
    
    // couche myposition from Postgres
    let myposition = new ImageLayer({
      extent: [-601486,4091922,1652323,7173780],
      source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
        params: {'LAYERS': 'MyGeoServer:myposition'},
        ratio: 1,
        serverType: 'geoserver',
      }),
      title: 'Ma position WMS (PostGis)',
    })
    
  // couche ocs10km from Postgres
  let ocs10km = new ImageLayer({
    extent: [-601486,4091922,1652323,7173780],
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
      params: {'LAYERS': 'MyGeoServer:clc18_10km_niv1',"transparent": true},
      ratio: 1,
      serverType: 'geoserver',
    }),
    title: 'OCS 10km WMS (PostGis)',
  })
  
  // couche WMS from SQL paramétrique
  let numDept = 24
  let filtre = 'num_dept:'+ numDept
  
  let departParamLayer = new ImageLayer({
    extent: [-601486,4091922,1652323,7173780],
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/MyGeoServer/wms',
      params: {'LAYERS': 'MyGeoServer:v_dept_param','viewparams': filtre},
      ratio: 1,
      serverType: 'geoserver',
    }),
    title: 'Departements Param WMS (PostGis)',
  })

  export { osmLayer, stamenLayer,zone10km,ocs10km,myposition,zoneAchat,departLayer,departParamLayer };