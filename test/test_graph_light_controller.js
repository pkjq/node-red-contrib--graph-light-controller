'use stricts';


const assert = require('assert');
const sinon = require('sinon');

let clock;
before(function ()  { clock = sinon.useFakeTimers(1); });
after(function ()   { clock.restore(); });

function resetClock() {
    clock.restore();
    clock = sinon.useFakeTimers(1);
}


const GraphLightController = require('../src/graph_light_controller');


describe('GraphLightController', function () {
    const zones = JSON.stringify(
        {
            "computer": [10],
            "learning": [2, 3, 5],
            "sofa": [5, 8],
            "hall": [4, 7],
            "window": [10, 11],
            "cupboard": [1, 2],
            "feast": ["sofa", "window", "hall", "cupboard"],
            "perimeter": [1, 2, 5, 8, 11, 10, 7, 4],
            "all": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        }
    );        

    const graph = ''
        + '1   -   2           W(12)\n'
        + '1   -   3           W(10)\n'
        + '1   -   4           W(12)\n'

        + '2   -   3           W(10)\n'
        + '2   -   5           W(12)\n'

        + '3   -   4           W(10)\n'
        + '3   -   5           W(10)\n'
        + '3   -   6           W(12)\n'

        + '4   -   5           W(12)\n'
        + '4   -   6           W(10)\n'
        + '4   -   7           W(12)\n'

        + '5   -   6           W(10)\n'
        + '5   -   8           W(12)\n'

        + '6   -   7           W(10)\n'
        + '6   -   8           W(10)\n'
        + '6   -   9           W(12)\n'

        + '7   -   8           W(12)\n'
        + '7   -   9           W(10)\n'
        + '7   -   10          W(12)\n'

        + '8   -   9           W(10)\n'
        + '8   -   11          W(12)\n'

        + '9   -   10          W(10)\n'
        + '9   -   11          W(10)\n'

        + '10  -   11          W(12)\n';

    /////////////////
    const config = {
        zones: zones,
        spawnVertexFrom: 6,
        discardVertexAt: 6,
        graphVertices: graph,
        transitionDelay: 500,
        transitionConfirmationTimeout: 500,
    };


    /////////////////
	it('create', function() {
        assert.doesNotThrow(function() { new GraphLightController(config); });
    });
});
