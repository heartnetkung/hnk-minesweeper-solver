var solver = require('./solver');
var EMPTY_CELL = solver.EMPTY_CELL;
var _ = require('lodash');
var lp = require('javascript-lp-solver');

var solve = function(model) {
	var avg = {};
	var override = {};
	var count = 0;
	for (var x in model.constraints) {
		if (!/^boolean/.test(x))
			continue;
		count++;
		var model2 = _.cloneDeep(model);
		model2.constraints[x] = { equal: 1 };
		console.log('x', x);
		console.log(model2);
		var result = lp.Solve(model2);
		console.log(result);
		console.log('---------------');
		if (result.feasible === false)
			override[x.replace('boolean', 'v')] = 0;
		for (var y in result)
			if (y[0] === 'v' && y[1] === '_')
				avg[y] = (avg[y] || 0) + result[y] + 1;

	}
	for (var x in avg)
		avg[x] = (avg[x] / count) - 1;
	for (var x in override)
		avg[x] = override[x];
	return override;
}
describe('', function() {
	it('', function() {
		var board = [
			[0, 1, EMPTY_CELL],
			[1, 2, EMPTY_CELL],
			[EMPTY_CELL, EMPTY_CELL, EMPTY_CELL]
		];

		var model = solver.createModel(board, board[0].length, board.length);
		console.log(solve(model));
	});
});
