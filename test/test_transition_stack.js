'use stricts';


const assert = require('assert');
const sinon = require('sinon');

let clock;
before(function () { clock = sinon.useFakeTimers(1); });
after(function () { clock.restore(); });

function resetClock() {
    clock.restore();
    clock = sinon.useFakeTimers(1);
}


const TransitionStack = require('../src/transition_stack');


describe('TransitionStack', function () {
    const stack = new TransitionStack;


	it('empty', (done) => {
        stack.set([]);

        assert.equal(stack.empty, true);

        stack.shiftWithDelay(1000).then(function() {
            done(new Error('promise must be rejected!'));
        }).catch(function() {
            done();
        });

        clock.tick(1000);
    });    

	it('pop..pop', () => {
        stack.set([1,2,3]);

        const promise = stack.shiftWithDelay(1000).then(function(val) {
            assert.deepEqual(val, { data:1, remaining:2 });
        }).then(function() {
            const promise = stack.shiftWithDelay(1000).then(function(val) {
                assert.deepEqual(val, { data:2, remaining:1 });
            });

            clock.tick(1000);

            return promise;
        }).then(function() {
            const promise = stack.shiftWithDelay(1000).then(function(val) {
                assert.deepEqual(val, { data:3, remaining:0 });
            });

            clock.tick(1000);

            return promise;
        }).then(function() {
            const promise = stack.shiftWithDelay(1000).then(function() {
                return Promise.reject({ unexpected:true, err:new Error('must be: no more elemtns in stack') });
            }).catch(err => {
                if (err && err.unexpected)
                    throw err.err;
                else {
                    assert.equal(stack.empty, true);
                    return Promise.resolve();
                }
            });

            clock.tick(1000);

            return promise;
        });

        clock.tick(1000);

        return promise;
    });  
});
