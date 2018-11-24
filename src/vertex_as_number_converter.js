"use strict";


const assert = require('assert');


function VerticesAsNumberToArray(value) {
    assert(typeof value === 'number', 'value must be a number');

    let result = [];

    let bit = 1;
    for (let bitIndex = 1; bitIndex < 32; ++bitIndex) {
        if (value & bit)
            result.push(bitIndex);
        bit<<=1;
    }

    return result;
}

function VerticesArrayToAsNumber(bitArray) {
    assert(Array.isArray(bitArray), 'argument must be array');

    let result = 0;
    for (let bit of bitArray) {
        assert(bit > 0, 'bit must be more than 0!');
        result |= (1<<(bit-1));
    }
    return result;
}

//////////////////////////////////////////////////////////////////////////
module.exports.ToArray  = VerticesAsNumberToArray;
module.exports.ToNumber = VerticesArrayToAsNumber;
