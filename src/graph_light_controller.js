'use strict'


const EventEmitter = require('events').EventEmitter;
const assert = require('assert');

const Zones = require('./zones_as_vertices');
const TransitionLogic = require('./transition_logic');

const VerticesAsNumberToArray   = require('./vertex_as_number_converter').ToArray;
const VerticesArrayToAsNumber   = require('./vertex_as_number_converter').ToNumber;

const TransitionStack = require('./transition_stack');


function ActiveZones2Array(zonesObject) {
    let result = [];
    for (let zi in zonesObject)
        if (zonesObject[zi])
            result.push(zi);
    return result;
}


class Logic extends EventEmitter{
    constructor(config) {
        super();

        this._config = config;

        this._zones = new Zones(JSON.parse(config.zones));
        this._transitionLogic = new TransitionLogic(config);

        this._currentState = {
            now: 0,
            final: 0,

            confirmation: {
                resolve: undefined,
                reject:  undefined,
            },

            zones: {},
        };

        this._transitionStack = new TransitionStack;

        this._zones.zoneNames.forEach(zoneName => {
            this._currentState.zones[zoneName] = false;
        });
    }

    destroy() {
        this._transitionStack.cancel();
        delete this._transitionStack;
    }

    apply(data, force) {
        for (let zoneName in data) {
            assert(typeof data[zoneName] === 'boolean', "invalid date type for '" + zoneName + "'");
            if (this._currentState.zones[zoneName] == undefined)
                continue;

            this._currentState.zones[zoneName] = data[zoneName];
        }

        this._onZonesChanged(force);
    }

    set(data, force) {
        for (let zoneName in this._currentState.zones) {
            this._currentState.zones[zoneName] = data.includes(zoneName);
        }

        this._onZonesChanged(force);
    }

    feedback(value) {
        this._currentState.now = value;

        if (this._currentState.confirmation.data === value)
            this._currentState.confirmation.resole(value);
        else
            this._currentState.confirmation.reject(new Error('feedback: unexpected value of path'));
    }

    _onZonesChanged(force) {
        this.emit('zones', {
            zones: this._currentState.zones,
            value: this._currentState.final,
        });

        if (this._calculateTransition(force))
            this._startTransition();
    }

    _calculateTransition(force) {
        const activeZones = ActiveZones2Array(this._currentState.zones);
        const newFinal = this._zones.Resolve(activeZones);
        if (force && !this._transitionLogic.empty) // changed 'force' flag
            this._transitionStack.cancel();
        else if (newFinal === this._currentState.final) // already in requested state
            return false;
        else if (!this._transitionLogic.empty) // previrous transition in progress
            this._transitionStack.cancel();

        this._currentState.final = newFinal;

        if (force)
            this._transitionStack.set([this._currentState.final]);
        else {
            const start  = VerticesAsNumberToArray(this._currentState.now);
            const finish = VerticesAsNumberToArray(this._currentState.final);

            const resultAsVertices = this._transitionLogic.calculatePaths(start, finish);
            let transitionData = resultAsVertices.map(val => { return VerticesArrayToAsNumber(val); });
            
            this._transitionStack.set(transitionData);
        }

        return true;
    }

    _startTransition() {
        this.emit('transition-started');
        this._doSendTransitionData(0);
    }

    _sendTransitionData(data, length) {
        const transitionDataMsg = {
            data: data,
            remaining: length,
        };

        return new Promise((resolve, reject) => {
            this._currentState.confirmation.data = data;

            setTimeout(reject, this._config.transitionConfirmationTimeout);
            this._currentState.confirmation.resole = resolve;
            this._currentState.confirmation.reject = reject;

            this.emit('transition-data', transitionDataMsg);
        });
    }

    async _doSendTransitionData(delay) {
        try {
            const result = await this._transitionStack.shiftWithDelay(delay);
            const value  = await this._sendTransitionData(result.data, result.remaining);
            this._onConfirmed(value);
        }
        catch(err) {
            this._onConfirmationError(err);
        }
    }

    async _onConfirmed(value) {
        if (!this._transitionStack.empty)
            this._doSendTransitionData(this._config.transitionDelay || 0);
        else {
            assert(value === this._currentState.final, 'logic error: wait(' + this._currentState.final + ') real(' + value + ')');
            this.emit('transition-completed', value);
        }
    }

    _onConfirmationError(err) {
        this._transitionStack.cancel();

        this.emit('transition-error', err);
        // TODO: recalculte path (controller error)
    }
};


///////////////////////
module.exports = Logic;