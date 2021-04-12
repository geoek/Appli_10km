import * as d3 from "d3"
import * as c3 from "c3"
import "c3/c3.min.css"
import * as dc from "dc"
import * as crossfilter from 'crossfilter/crossfilter';

import 'regenerator-runtime/runtime'
/*
queue()
    .defer(d3.json, "/getdata")
    .await(makeGraphs);
*/
function makeGraphs(error, recordsJson) {
    console.log("Dessin du graph")
    console.log(JSON.stringify(recordsJson))

    async function get() {
        let url = "./getdata/"
        let obj = await (await fetch(url)).json()
        console.log(obj) 
        return obj
    }

    var tags

    (async () => {
      tags = await get()
      //console.log(tags)
      //document.getElementById("tags").innerHTML = JSON.stringify(tags);
      traceGraph(tags.features)
    })()
}

function traceGraph(data) {
    let table = []
    for (var i = 0; i < data.length; i++){
        var obj = data[i].properties
        //table.push(["niv " + obj.niv1,obj.area_ha])
        table.push([obj.niv1,obj.area_ha])
        console.log(table)
    }

    var chart = c3.generate({
        data: {
            columns: table,
            keys: {
                x: 'name', // it's possible to specify 'x' when category axis
                value: ['upload'],
            },
            type : 'pie',
            order: null,    //or asc or desc pour trier selon label ou valeur
            colors: ["0","#d24465","#d1cc31","#45ae3d","#1be08e","#1bb9e0"],
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    })



    var chartDiv = document.getElementById("chart")
    chartDiv.style.display = "block"

}

export {makeGraphs}