"use strict";


const CreateGraph = require('ngraph.graph');


function ParseGraph(data) {
    let graph = CreateGraph();

    const pattern = /(\d+)\s*([-><]+)\s*(\d+)\s*(W\((\d+)\)){0,1}$/gmi;
    let result;
    while (result = pattern.exec(data)) {
        const from      = ParseDataAsNumberIfPossible(result[1]);
        const link      = result[2];
        const to        = ParseDataAsNumberIfPossible(result[3]);
        const weight    = parseInt(result[5]);

        if (!from || !to || !link)
            continue;

        switch (link) {
            case '-':
                graph.addLink(from, to, weight ? { weight: weight } : undefined );
                break;
            case '->':
                graph.addLink(from, to, weight ? { weight: weight } : undefined );
                break;
            case '<->':
                graph.addLink(from, to, weight ? { weight: weight } : undefined );
                graph.addLink(to, from, weight ? { weight: weight } : undefined );
                break;
            default:
                break;
        }
    }

    return graph;
}

function ParseDataAsNumberIfPossible(data) {
    if (/[\-0-9]$/.test(data))
        return parseInt(data);
    return data;
}

//////////////////////////////////////////////////////////////////////////
module.exports.ParseGraph                   = ParseGraph;
module.exports.ParseDataAsNumberIfPossible  = ParseDataAsNumberIfPossible;
