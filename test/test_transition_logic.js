'use strict'


const assert = require('assert');


const TransitionLogic = require('../src/transition_logic');


const GraphStr =
    '1   -   2           W(12)\n' +
    '1   -   3           W(10)\n' +
    '1   -   4           W(12)\n' +
 
    '2   -   3           W(10)\n' +
    '2   -   5           W(12)\n' +
 
    '3   -   4           W(10)\n' +
    '3   -   5           W(10)\n' +
    '3   -   6           W(12)\n' +
 
    '4   -   5           W(12)\n' +
    '4   -   6           W(10)\n' +
    '4   -   7           W(12)\n' +
 
    '5   -   6           W(10)\n' +
    '5   -   8           W(12)\n' +
 
    '6   -   7           W(10)\n' +
    '6   -   8           W(10)\n' +
    '6   -   9           W(12)\n' +
 
    '7   -   8           W(12)\n' +
    '7   -   9           W(10)\n' +
    '7   -   10          W(12)\n' +
 
    '8   -   9           W(10)\n' +
    '8   -   11          W(12)\n' +
 
    '9   -   10          W(10)\n' +
    '9   -   11          W(10)\n' +

    '10  -   11          W(12)';

const SpawnVertexFrom = 6;
const DiscardVertexAt = 9;



describe('Transition-Logic', function () {
    const config = {
        spawnVertexFrom: SpawnVertexFrom.toString(),
        discardVertexAt: DiscardVertexAt.toString(),

        graphVertices: GraphStr,
    };

    let logic = new TransitionLogic(config);

    function checkLastStep(result, finish) {
        const lastStep = result[result.length-1];
        for (let v of finish)
            assert.ok(lastStep.includes(v), 'result: ' + lastStep.join() + ' | must contain: ' + v);
    }


    describe('calculatePaths', function () {
        // count of vertices at start equal count at finish
        it('[=]', function () {
            const start  = [1,2,3];
            const finish = [10,11,8];
            const result = logic.calculatePaths(start, finish);

            assert.ok(result.length > 0, 'path not exist!');
            checkLastStep(result, finish);

            assert.ok(result.length <= 3, 'check effectivity');
        });

        it('[>]', function () {
            const start  = [1,2,3];
            const finish = [10,11];
            const result = logic.calculatePaths(start, finish);

            assert.ok(result.length > 0, 'path not exist!');
            checkLastStep(result, finish);

            assert.ok(result.length <= 3, 'check effectivity');

            {
                let discardVertexExist = false;
                for (let step of result)
                    if (step.includes(DiscardVertexAt)) {
                        discardVertexExist = true;
                        break;
                    }
                assert.equal(discardVertexExist, true, "path doen't contains 'DiscardVertexAt' vertex");
            }
        });

        it('[<]', function () {
            const start  = [1,2];
            const finish = [10,11,9];
            const result = logic.calculatePaths(start, finish);

            assert.ok(result.length > 0, 'path not exist!');
            checkLastStep(result, finish);

            { // 
                const firstStep = result[0];
                assert.ok(firstStep.includes(SpawnVertexFrom), "first step must contains 'spawnVertexFrom' vertex");
            }

            assert.ok(result.length <= 3, 'check effectivity');
        });


        it('effectivity', function () {
            const start  = [1,2];
            const finish = [10,11];
            const result = logic.calculatePaths(start, finish);

            assert.ok(result.length > 0, 'path not exist!');
            assert.equal(result.length, 3);

            // step[1]
            assert.ok(result[0].includes(4));
            assert.ok(result[0].includes(5));
            assert.equal(result[0].length, 2);

            // step[2]
            assert.ok(result[1].includes(7));
            assert.ok(result[1].includes(8));
            assert.equal(result[1].length, 2);

            // step[3]
            assert.ok(result[2].includes(10));
            assert.ok(result[2].includes(11));
            assert.equal(result[2].length, 2);
        });    

        it('parameters not modified', function () {
            const start  = [1];
            const finish = [11,10,9,8,7,6,5,4,3,2];
            logic.calculatePaths(start, finish);

            assert.deepEqual(start,     [1]);
            assert.deepEqual(finish,    [11,10,9,8,7,6,5,4,3,2]);
        });

        it('parameters validation', function () {
            assert.throws(() => logic.calculatePaths(1, [2]));
            assert.throws(() => logic.calculatePaths([1], 2));

            assert.throws(() => logic.calculatePaths('1', [2]));
            assert.throws(() => logic.calculatePaths([1], '2'));
        });
        
        it('no any action needed', function () {
            const result = logic.calculatePaths([], []);

            assert.equal(result, null);
        });

        it('no path exist', function () {
            assert.throws(() => logic.calculatePaths([1], [12]));
        });
    });
});
