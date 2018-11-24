"use strict";


const LightController = require('./src/graph_light_controller');


module.exports = function(RED) {
    function CreateNode(config) {

        RED.nodes.createNode(this, config);

        try {
            this._controller = new LightController(config);

            this._controller.on('zones', (zonesData) => {
                const msg = {
                    payload: zonesData.zones,
                    value:   zonesData.value,
                };

                this.send([msg]);
            });

            this._controller.on('transition-data', (data) => {
                const msg = {
                    payload:    data.data,
                    remaining:  data.remaining,
                };

                this.status({fill: 'green', shape: 'ring', text: 'transition...[' + data.data + ']'});
                this.send([null, msg]);
            });

            //this._controller.on('transition-started', () => {
            //});
            this._controller.on('transition-completed', (value) => {
                this.status({fill: 'green', shape: 'dot', text: 'completed [' + value + ']'});
            });
            this._controller.on('transition-error', (err) => {
                this.status({fill: 'red', shape: 'dot', text: err.message});
            });
            

            this.status({fill: 'green', shape: 'dot'});

            this.on('input', function(msg) {
                try {
                    if (msg.payload == undefined)
                        return;

                    const payload = msg.payload;
                    if (payload.set) {
                        const force = (msg.force === true) || (config.transitionDelay == 0);

                        if (Array.isArray(payload.set)) // force set active zones
                            this._controller.set(payload.set, force);
                        else if (typeof payload.set === 'object')
                            this._controller.apply(payload.set, force);
                        else
                            throw new Error("unsupported format of 'payload.set'");
                    }
                    else if (payload.feedback !== undefined) {
                        return this._controller.feedback(payload.feedback);
                    }
                    else
                        return;
                }
                catch (err) {
                    this.status({fill: 'red', shape: 'dot', text: 'Error: ' + err.message});
                }
            });

            this.on('close', function(done) {
                this._controller.removeAllListeners();
                this._controller.destroy();
                delete this._controller;

                this.status({fill:'grey', text: 'standby'});
    
                done();
            });
        }
        catch (err) {
            this.error('Error: ' + err.message);
            this.status({fill: 'red', shape: 'dot', text: 'invalid data'});
        }
    }


    RED.nodes.registerType("pkjq-graph-light-controller", CreateNode);
};
