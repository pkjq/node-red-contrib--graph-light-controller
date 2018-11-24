'use strict'


const assert = require('assert');


const VerticesAsNumberToArray   = require('../src/vertex_as_number_converter').ToArray;
const VerticesArrayToAsNumber   = require('../src/vertex_as_number_converter').ToNumber;


describe('vertex_as_number_converter', function () {
    describe('VerticesArrayToAsNumber', function () {
        it('base convertions', function () {
            assert.equal(VerticesArrayToAsNumber([]),       0);

            assert.equal(VerticesArrayToAsNumber([1,2,3]),  0b111);

            assert.equal(VerticesArrayToAsNumber([11,5]),   0b10000010000);
        });

        it('invalid data', function () {
            assert.throws(() => VerticesArrayToAsNumber([-1]));
            assert.throws(() => VerticesArrayToAsNumber(0));
            assert.throws(() => VerticesArrayToAsNumber());
        });        
    });

    describe('VerticesAsNumberToArray', function () {
        it('base convertions', function () {
            assert.deepEqual(VerticesAsNumberToArray(0),                []);
    
            assert.deepEqual(VerticesAsNumberToArray(0b111),            [1,2,3]);
    
            assert.deepEqual(VerticesAsNumberToArray(0b10000010000),    [5,11]);
        });
    
        it('invalid data', function () {
            assert.throws(() => VerticesAsNumberToArray());
            assert.throws(() => VerticesAsNumberToArray([2]));
        });    
    });

    it('<=>', function () {
        for (let origin = 0; origin < 65536; ++origin) {
            const array  = VerticesAsNumberToArray(origin);
            const result = VerticesArrayToAsNumber(array);

            assert.equal(result, origin);
        }
    });
});
