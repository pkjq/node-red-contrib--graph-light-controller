'use strict';


const CreatePathFinder = require('ngraph.path').aStar;
const AlgorithmWithReversedResult = true;


const Parsers = require('./parsers');


function ResizeArray(array, newSize, filler) {
    while (array.length < newSize)
        array.push(filler);
}

function GetIntersection(start, finish) {
    return start.filter(p => finish.includes(p));
}

class OptimalCriteria {
    constructor() {
    }

    isThisOptimal(pathData) {
        if (!this._minMaxLen || pathData.maxLen < this._minMaxLen)
            this._minMaxLen = pathData.maxLen;
        else if ((pathData.maxLen === this._minMaxLen) && (!this._maxMinLen || pathData.minLen > this._maxMinLen))
            this._maxMinLen = pathData.minLen;
        else
            return false;

        return true;
    }
};

class Algorithm {
    constructor(config) {
        this._spawnVertexFrom = Parsers.ParseDataAsNumberIfPossible(config.spawnVertexFrom);
        this._discardVertexAt = Parsers.ParseDataAsNumberIfPossible(config.discardVertexAt);

        const graph = Parsers.ParseGraph(config.graphVertices);

        this._pathFinder = CreatePathFinder(graph, {
            distance(fromNode, toNode, link) {
                return link.data.weight || 1;
            }
        });
    }

    calculatePaths(start, finish) {
        if (!Array.isArray(start) || !Array.isArray(finish))
            throw new Error('invalid argument: start and finish must be array');
        else if ((start.length + finish.length) === 0)
            return; // no any action needed

        const originalFinish = finish.concat();
        const intersection = GetIntersection(start, finish);
        { // copy points without static points
            start   = start.filter(p => !intersection.includes(p));
            finish  = finish.filter(p => !intersection.includes(p));
        }


        const startLen = start.length;
        const diff = finish.length - startLen;
        if (diff < 0)
            ResizeArray(finish, start.length, this._discardVertexAt || start[0]);
        else if (diff > 0)
            ResizeArray(start, finish.length, this._spawnVertexFrom || finish[0]);
        const length = start.length;

        let resultPathData;
        { // find paths
            let optimalCriteria = new OptimalCriteria;
            for (let v = 0; v < length; ++v) {
                let pathData = {
                    minLen: undefined,
                    maxLen: undefined,
                    sumLen: 0,
                    paths: [],
                };

                for (let i = 0; i < length; ++i) {
                    let path = this._pathFinder.find(start[i], finish[i]);
                   
                    const duplicateExtendedPointAtStart = (i >= startLen);
                    if (duplicateExtendedPointAtStart)
                        path.push(path[AlgorithmWithReversedResult ? (path.length-1) : 0]);
                    const pathLen = path.length;
                    
                    pathData.paths.push(path);

                    if (!pathData.minLen || pathLen < pathData.minLen)
                        pathData.minLen = pathLen;
                    if (!pathData.maxLen || pathLen > pathData.maxLen)
                        pathData.maxLen = pathLen;
                    pathData.sumLen += pathLen;
                }

                if (optimalCriteria.isThisOptimal(pathData))
                    resultPathData = pathData;

                // rotate
                finish.push(finish.splice(0, 1)[0]);
            }
        }


        // convert paths to steps
        let paths = resultPathData.paths;
        if (AlgorithmWithReversedResult) // reverse alll paths
            for (let i in paths)
                paths[i].reverse();

        let steps = [];
        for (let i = 1; i < resultPathData.maxLen; ++i) { // skip start step
            const stepIndex = i-1;
            steps[stepIndex] = new Set(intersection);

            for (let p of resultPathData.paths) {
                if (p.length > i)
                    steps[stepIndex].add(p[i].id);
                else {
                    const vertex = p[p.length-1].id;

                    if (originalFinish.includes(vertex))
                        steps[stepIndex].add(vertex);
                }
            }

            steps[stepIndex] = [...steps[stepIndex]]; // convert to array
        }

        { // last step to turn off
            let needAppendLastStep = false;
            let step = [];
            for (let vertex of steps[steps.length-1]) {
                if (originalFinish.includes(vertex))
                    step.push(vertex);
                else
                    needAppendLastStep = true;
            }

            if (needAppendLastStep)
                steps.push(step);
        }

        return steps;
    }
};

///////////////////////////
module.exports = Algorithm;
