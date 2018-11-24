'use strict'


const assert = require('assert');


const Zones = require('../src/zones_as_vertices');


describe('Zones', function () {
    const zonesMap = {
        "zone-1": [1],
        "zone-2": [2, 3],
        "zone-3": ['zone-1', 'zone-2', 2, 4, 5],
    };
    const zones = new Zones(zonesMap);

	it('Names', function () {
        const zoneNames = zones.zoneNames;
        assert.equal(zoneNames.length, 3);

        assert.ok(zoneNames.includes('zone-1'));
        assert.ok(zoneNames.includes('zone-2'));
        assert.ok(zoneNames.includes('zone-3'));
    });

	it('Resolve', function () {
        assert.equal(zones.Resolve(['zone-1']), 1);
        assert.equal(zones.Resolve(['zone-1', 'zone-2']), 7);
        assert.equal(zones.Resolve(['zone-1', 'zone-2', 'zone-1']), 7);
        assert.equal(zones.Resolve(['zone-2']), 6);
        assert.equal(zones.Resolve(['zone-1', 'zone-2', 'zone-3']), 31);
    });

	it('Parse', function () {
        assert.deepStrictEqual(zones.Parse(1), ['zone-1']);
        assert.deepStrictEqual(zones.Parse(2), []);
        assert.deepStrictEqual(zones.Parse(3), ['zone-1']);
        assert.deepStrictEqual(zones.Parse(4), []);
        assert.deepStrictEqual(zones.Parse(5), ['zone-1']);
        assert.deepStrictEqual(zones.Parse(6), ['zone-2']);

        {
            const resolvedZones = zones.Parse(7);
            assert.equal(resolvedZones.length, 2);
            assert.ok(resolvedZones.includes('zone-1'));
            assert.ok(resolvedZones.includes('zone-2'));
        }

        {
            const resolvedZones = zones.Parse(31);
            assert.equal(resolvedZones.length, 3);
            assert.ok(resolvedZones.includes('zone-1'));
            assert.ok(resolvedZones.includes('zone-2'));
            assert.ok(resolvedZones.includes('zone-3'));
        }
    });    
});
