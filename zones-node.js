"use strict";


const Zones = require('./src/zones_as_vertices');


module.exports = function(RED) {
    function CreateNode(config) {

        RED.nodes.createNode(this, config);

        try {
            this._zones = new Zones(JSON.parse(config.zones));
            this.status({fill: "green", shape: "dot"});

            this.on('input', function(msg) {
                try {
                    this.status({fill: "gray", shape: "ring", text: "calculating..." });
                    const StartTime = new Date();

                    const data = msg.payload;
                    delete msg.payload;

                    if (Array.isArray(data))
                        msg.payload = this._zones.Resolve(data);
                    else {
                        msg.payload = {};
                        msg.payload.zones = this._zones.Parse(data);
                    }

                    this.status({fill: "green", shape: "dot", text: "completed in " + (new Date() - StartTime) + "ms" });
                    this.send(msg);
                }
                catch (err) {
                    this.status({fill: "red", shape: "dot", text: 'Error: ' + err.message});        
                }
            });
        }
        catch (err) {
            this.error('Error: ' + err.message);
            this.status({fill: "red", shape: "dot", text: "invalid data"});
        }
    }


    RED.nodes.registerType("pkjq-zones", CreateNode);
};
