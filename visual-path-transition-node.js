"use strict";


const EffectLogic = require('./src/effect_logic');

const VerticesAsNumberToArray   = require('./src/vertex_as_number_converter').ToArray;
const VerticesArrayToAsNumber   = require('./src/vertex_as_number_converter').ToNumber;


module.exports = function(RED) {
    function CreateNode(config) {

        RED.nodes.createNode(this, config);

        try {
            this._effectLogic = new EffectLogic(config);
            this.status({fill: "green", shape: "dot"});

            this.on('input', function(msg) {
                try {
                    this.status({fill: "gray", shape: "ring", text: "calculating..." });
                    const StartTime = new Date();
                    /////////////////////////////
                    let start   = msg.start;
                    let finish  = msg.finish;

                    if (!Array.isArray(start))
                        start   = VerticesAsNumberToArray(start);
                    if (!Array.isArray(finish))                    
                        finish  = VerticesAsNumberToArray(finish);

                    const resultAsVertices          = this._effectLogic.calculatePaths(start, finish);
                    const resultAsAssebledNumbers   = resultAsVertices.map(val => { return VerticesArrayToAsNumber(val); });

                    this.status({fill: "green", shape: "dot", text: "completed in " + (new Date() - StartTime) + "ms" });

                    msg = {
                        payload: {
                            vertices:   resultAsVertices,
                            assembled:  resultAsAssebledNumbers,
                        },
                    };
                    this.send(msg);
                }
                catch (err) {
                    this.status({fill: "red", shape: "dot", text: 'Error: ' + err.message});        
                }
            });
        }
        catch (err) {
            this.error("Invalid Expression: '" + config.graphVertices + "'. Error: " + err.message);
            this.status({fill: "red", shape: "dot", text: "invalid graph data"});
        }
    }


    RED.nodes.registerType("visual-path-transition", CreateNode);
};
