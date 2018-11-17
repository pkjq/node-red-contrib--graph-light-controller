'use strict'


const assert = require('assert');


const Parser = require('../src/parsers');


describe('Parser', function () {
    const ParseDataAsNumberIfPossible = Parser.ParseDataAsNumberIfPossible;
    const ParseGraph = Parser.ParseGraph;
       
	it('ParseDataAsNumberIfPossible: numbers', function () {
        assert.strictEqual(ParseDataAsNumberIfPossible('-100'),         -100);
        assert.strictEqual(ParseDataAsNumberIfPossible('100'),          100);

        assert.strictEqual(ParseDataAsNumberIfPossible('0'),            0);
    });

    it('ParseDataAsNumberIfPossible: strings', function () {
        assert.strictEqual(ParseDataAsNumberIfPossible('-100str'),      '-100str');
        assert.strictEqual(ParseDataAsNumberIfPossible('100str'),       '100str');
    });


    it('ParseGraph', function () {
        const graphAsStr = 
            '1-2 W(5)\n'  +
            '1  -    3\n' +
            '2   -4         W(3)';

        const graph = ParseGraph(graphAsStr);


        assert.equal(graph.getNodesCount(), 4);
        assert.equal(graph.getLinksCount(), 3);

        assert.ok(graph.getLink(1,2));
        assert.equal(graph.getLink(1,2).data.weight, 5);

        assert.ok(graph.getLink(1,3));
        assert.equal(graph.getLink(1,3).data, null);

        assert.ok(graph.getLink(2,4));
        assert.equal(graph.getLink(2,4).data.weight, 3);

        assert.equal(graph.getLink(3,4), null);
    });
});
