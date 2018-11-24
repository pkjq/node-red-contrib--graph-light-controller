'use strict';


class TransitionStack {
    constructor() {
        this._stack = [];
    }

    set(arrayData) {
        this._stack = arrayData;
    }

    shiftWithDelay(delay = 0) {
        const promise = new Promise((resolve, reject) => {
            const data = this._stack.shift(); // TODO: optimize
            if (data == undefined)
                return reject(new Error('no data in effect stack'));

            const length = this._stack.length;
            this._timerId = setTimeout(() => {
                this._timerId = null;
                resolve({data:data, remaining:length});
            }, delay);
        });
        
        return promise;
    }

    cancel() {
        if (this._timerId) {
            clearTimeout(this._timerId);
            this._timerId = null;
        }
    }

    get empty() {
        return (this._stack.length === 0);
    }
};


/////////////////////////////
module.exports = TransitionStack;
