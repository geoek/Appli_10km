//Fichier du serveur Express : point d'entrée de Node.
//Pour Parcel, le point d'entrée est le HTML Principal

const Bundler = require('parcel-bundler');
let express = require('express')
let app = express()
let path = require('path');

//Intégration Postgres
const { Client } = require('pg');
const connectionString = 'postgres://geoek:0@localhost:5432/my_geo_db';
const client = new Client({
    connectionString: connectionString
});
client.connect();

const cors = require('cors');

// Pour Parcel, il faut définir les réglages :
// Passe ici un chemin absolu vers le point d'entrée
const file = 'index.html';
const options = {}; // Voir la section des options de la doc de l'api, pour les possibilités
// Initialise un nouveau bundler en utilisant un fichier et des options
const bundler = new Bundler(file, options);

/*
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin',"*")
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE')
    res.header('Access-Control-Allow-Headers','Content-Type')
    next()
})
*/


// pour définir un moteur de rendu pour Express
//app.set('view engine','ejs')

// ROUTING pour Express :

// pour qu'il route automatiquement les fichiers statiques
app.use("/static", express.static('./static/'));
app.use("/data", express.static('./data/'));
app.use("/style", express.static('./style/'));

app.get('/demo',(request,response) => {
    response.sendFile(path.join(__dirname+'/../index.html'));
})

app.get('/testonglet',(request,response) => {
    response.sendFile(path.join(__dirname+'/../test.html'));
})

app.get('/test',(request,response) => {
    response.send('test')
})

app.get('/reqsql/', (request, response) => {
//    client.query('SELECT * FROM covid19.dept_metropole where id = $1', [2], function (err, result) {
      client.query("select json_build_object( 'type', 'FeatureCollection', 'features', json_agg(ST_AsGeoJSON(t.*)::json) ) from (select id, code_insee, nom, ST_Transform(the_geom,4326) from covid19.dept_metropole WHERE id = 42) as t(id, code_insee, nom, the_geom);",  function (err, result) {
        if (err) {
            console.log(err);
            response.status(400).send(err);
        }
        response.status(200).send(result.rows);
    });
});
    

app.get('/setsql/', (request, response) => {
    //    client.query('SELECT * FROM covid19.dept_metropole where id = $1', [2], function (err, result) {

        var x = request.query.x; 
        var y = request.query.y; 
        client.query("DELETE FROM covid19.myposition WHERE id=1;INSERT INTO covid19.myposition VALUES (1,'ol_position',st_SetSRID(st_makepoint("+ x +","+ y +"),2154));", function (err, result) {
            if (err) {
                console.log(err);
                response.status(400).send(err);
            }
            response.status(200).send(result.rows);
        });
    });

app.get('/getocsdata/', (request, response) => {
    //    client.query('SELECT * FROM covid19.dept_metropole where id = $1', [2], function (err, result) {
    var url = "http://localhost:8080/geoserver/MyGeoServer/wfs?service=WFS&version=1.1.0&request=getfeature&typeNames=clc18_10km_niv1&srsName=epsg:2154&outputFormat=application/json";
    response.redirect(301, url);
});

app.get('/getpoidata/', (request, response) => {
    //    client.query('SELECT * FROM covid19.dept_metropole where id = $1', [2], function (err, result) {
    var url = "http://localhost:8080/geoserver/MyGeoServer/wfs?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km&srsName=epsg:2154&outputFormat=application/json";
    response.redirect(301, url);
});

app.get('/getpoiaggdata/', (request, response) => {
    //    client.query('SELECT * FROM covid19.dept_metropole where id = $1', [2], function (err, result) {
    var url = "http://localhost:8080/geoserver/MyGeoServer/wfs?service=WFS&version=1.1.0&request=getfeature&typeNames=v_poi_10km_agg&srsName=epsg:2154&outputFormat=application/json";
    response.redirect(301, url);
});


app.get('/reqwfs3/', (request, response) => {
    var url = "http://localhost:8080/geoserver/MyGeoServer/wfs?service=WFS&version=1.1.0&request=GetFeature&typeNames=MyGeoServer:dept_metropole&featureID=4&outputFormat=application/json";
    response.redirect(301, url);
});

app.use(cors());


express.static.mime.define({'application/json': ['json']})
express.static.mime.define({'application/json': ['geojson']})



// Permet à express d'utiliser le middelware de bundler, cela permettra à Parcel de gérer chaque requête sur votre serveur express
// Attention à mettre à la fin sinon ca prend le dessus sur les routes
app.use(bundler.middleware());

// Ouverture du serveur d'Express
app.listen(8081)