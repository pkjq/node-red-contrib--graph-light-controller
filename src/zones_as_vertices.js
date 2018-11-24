'use strict'


const ArrayToNumber = require('./vertex_as_number_converter').ToNumber;


function ResolveAndValidateZones(zones) {
    function is_string(s) {
        return typeof (s) === 'string' || s instanceof String;
    }

    function resolve_zone(zone) {
        for (let i = 0; i < zone.length; ++i) {
            const z = zone[i];

            if (is_string(z)) {
                zone.splice(i, 1, ...zones[z]);
                --i;
            }
        }
    }

    for (let zone in zones)
        resolve_zone(zones[zone]);
    
    for (let zone in zones)
        zones[zone] = ArrayToNumber(zones[zone]);

    return zones;
}

class Zones {
    constructor(zonesMap) {
        this._zones = ResolveAndValidateZones(zonesMap);
    }

    Resolve(zoneNamesArray) {
        let result = 0;

        for (let zone of zoneNamesArray)
            result |= this._zones[zone] || 0;

        return result;
    }

    Parse(value) {
        let zoneNames = [];

        for (let zoneName in this._zones)
            if ((value & this._zones[zoneName]) === this._zones[zoneName])
                zoneNames.push(zoneName);

        return zoneNames;
    }

    get zoneNames() {
        let zones = [];
        for (let zone in this._zones)
            zones.push(zone);
        return zones;
    }
};


///////////////////////
module.exports = Zones;
