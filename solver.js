var lp = require('javascript-lp-solver');
var _ = require('lodash');


function Solver(gameConstructor, config) {
	this.game = new gameConstructor(config);
	this.config = config;
	this.gameConstructor = gameConstructor;
	this.nextMethod = 0;
	this.openingThreshold = config.openingThreshold || 0.2;
};
exports.Solver = Solver;


Solver.prototype.solveOneStep = function() {
	var state = this.game.getState();
	switch (state) {
		case STATE_SUCCESS:
		case STATE_FAIL:
			this.nextMethod = 0;
			this.game = new this.gameConstructor(this.config);
			return 'F2';
		case STATE_NEW:
			this.nextMethod = 0;
			var retryCount = opening(this.game);
			return 'Random click until we have enough reveals. (' + retryCount + ' tries)';
		case STATE_PLAYING:
			if (this.nextMethod === 0) {
				var solveResult = easySolve(this.game);
				if (solveResult.flag.length === 0 && solveResult.answer.length === 0)
					this.nextMethod++;
				return 'Easy counting solve. (' + JSON.stringify(solveResult) + ')';
			} else if (this.nextMethod === 1) {
				var solveResult = lpSolve(this.game);
				if (solveResult.flag.length === 0 && solveResult.answer.length === 0)
					this.nextMethod++;
				else
					this.nextMethod = 0;
				return 'Linear Programming solve. (' + JSON.stringify(solveResult) + ')';
			} else {
				var solveResult = rngSolve(this.game);
				this.nextMethod = 0;
				return 'Last resort. RNG! (' + JSON.stringify(solveResult) + ')';
			}
	}
};


var opening = function(game) {
	var board = game.getBoard();
	var w = game.getWidth();
	var h = game.getHeight();
	var nCell = w * h;
	var count = 0;

	while (true) {
		var nReveal = countNumberCell(board, w, h);
		if (nReveal / nCell > 0.2)
			return count;
		var seed = Math.floor(Math.random() * nCell);
		var x = seed % w;
		var y = Math.floor(seed / w);
		var hasEnded = game.answer(x, y);
		count++;
		if (hasEnded)
			return count;
	}
};


var easySolve = function(game) {
	var board = game.getBoard();
	var w = game.getWidth();
	var h = game.getHeight();
	var flag = [];
	var answer = [];


	//flag
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++) {
			var current = board[i][j];
			if (current > 9 || current < 1)
				continue;

			var emptyCount = count(board, i, j, EMPTY_CELL);
			var flagCount = count(board, i, j, FLAG);

			if ((current === emptyCount + flagCount) && emptyCount)
				pushIf(board, i, j, EMPTY_CELL, flag)
		}
	for (var i = 0, ii = flag.length; i < ii; i++)
		if (board[flag[i][0]][flag[i][1]] !== FLAG)
			game.flag(flag[i][1], flag[i][0]);


		//answer
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++) {
			var current = board[i][j];
			if (current > 9 || current < 1)
				continue;

			var flagCount = count(board, i, j, FLAG);

			if (current === flagCount)
				pushIf(board, i, j, EMPTY_CELL, answer);
		}
	for (var i = 0, ii = answer.length; i < ii; i++)
		game.answer(answer[i][1], answer[i][0]);

	return { flag: flag, answer: answer };
};


var rngSolve = function(game) {
	var board = game.getBoard();
	var w = game.getWidth();
	var h = game.getHeight();

	while (true) {
		var randomPos = Math.floor(Math.random() * w * h);
		var y = Math.floor(randomPos / w);
		var x = randomPos % w;
		if (board[y][x] === EMPTY_CELL) {
			game.answer(x, y);
			return {
				flag: [],
				answer: [
					[y, x]
				]
			};
		}
	}
};


var is = function(board, i, j, type) {
	if (!board[i])
		return false;
	if (type === NUMBER)
		return board[i][j] >= 1 && board[i][j] <= 9;
	return board[i][j] === type;
};


var count = function(board, i, j, type) {
	var ans = 0;
	ans += is(board, i - 1, j - 1, type) ? 1 : 0;
	ans += is(board, i - 1, j, type) ? 1 : 0;
	ans += is(board, i - 1, j + 1, type) ? 1 : 0;
	ans += is(board, i, j - 1, type) ? 1 : 0;
	ans += is(board, i, j + 1, type) ? 1 : 0;
	ans += is(board, i + 1, j - 1, type) ? 1 : 0;
	ans += is(board, i + 1, j, type) ? 1 : 0;
	ans += is(board, i + 1, j + 1, type) ? 1 : 0;
	return ans;
};


var callIf = function(board, i, j, type, callback) {
	if (is(board, i - 1, j - 1, type))
		callback(i - 1, j - 1);
	if (is(board, i - 1, j, type))
		callback(i - 1, j);
	if (is(board, i - 1, j + 1, type))
		callback(i - 1, j + 1);
	if (is(board, i, j - 1, type))
		callback(i, j - 1);
	if (is(board, i, j + 1, type))
		callback(i, j + 1);
	if (is(board, i + 1, j - 1, type))
		callback(i + 1, j - 1);
	if (is(board, i + 1, j, type))
		callback(i + 1, j);
	if (is(board, i + 1, j + 1, type))
		callback(i + 1, j + 1);
};


var pushIf = function(board, i, j, type, array) {
	if (is(board, i - 1, j - 1, type))
		array.push([i - 1, j - 1]);
	if (is(board, i - 1, j, type))
		array.push([i - 1, j]);
	if (is(board, i - 1, j + 1, type))
		array.push([i - 1, j + 1]);
	if (is(board, i, j - 1, type))
		array.push([i, j - 1]);
	if (is(board, i, j + 1, type))
		array.push([i, j + 1]);
	if (is(board, i + 1, j - 1, type))
		array.push([i + 1, j - 1]);
	if (is(board, i + 1, j, type))
		array.push([i + 1, j]);
	if (is(board, i + 1, j + 1, type))
		array.push([i + 1, j + 1]);
}


var countNumberCell = function(board, w, h) {
	var ans = 0;
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++)
			if (board[i][j] <= 9 && board[i][j] >= 0)
				ans++;
	return ans;
};


var lpSolve = function(game) {
	var board = game.getBoard();
	var w = game.getWidth();
	var h = game.getHeight();
	var answer = [];
	var flag = [];

	var model = createModel(board, w, h);
	var result = lpSolveLogic(model);

	for (var x in result) {
		var key = x.split('_');
		if (!key[1])
			continue;
		var i = parseInt(key[1]);
		var j = parseInt(key[2]);
		if (result[x] === 0) {
			answer.push([i, j]);
			game.answer(j, i);
		} else if (result[x] === 1) {
			if (board[i][j] !== FLAG) {
				flag.push([i, j]);
				game.flag(j, i);
			}
		}
	}

	return { flag: flag, answer: answer };
};


var lpSolveLogic = exports.lpSolverLogic = function(model) {
	var override = {};
	var count = 0;
	for (var x in model.constraints) {
		if (!/^boolean/.test(x))
			continue;
		count++;
		var model2 = _.cloneDeep(model);
		model2.constraints[x] = { equal: 1 };
		var result = lp.Solve(model2);
		if (result.feasible === false) {
			override[x.replace('boolean', 'v')] = 0;
			continue;
		}
	}
	return override;
};


var createModel = exports.createModel = function(board, w, h) {
	var ans = {
		optimize: 'totalBomb',
		opType: 'max',
		constraints: {},
		variables: {}
	};

	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++) {
			var current = board[i][j];
			if (current <= 9 && current >= 1) {
				callIf(board, i, j, FLAG, function() {
					current--;
				});
				callIf(board, i, j, EMPTY_CELL, function() {
					ans.constraints['number_' + i + '_' + j] = { equal: current };
				});
			} else if (current === EMPTY_CELL) {
				var temp = { totalBomb: 1 };
				var count = 0;
				callIf(board, i, j, NUMBER, function(i1, i2) {
					count++;
					temp['number_' + i1 + '_' + i2] = 1;
				});
				if (count) {
					temp['boolean_' + i + '_' + j] = 1
					ans.variables['v_' + i + '_' + j] = temp;
					ans.constraints['boolean_' + i + '_' + j] = { max: 1, min: 0 };
				}
			}
		}
	return ans;
};


var STATE_NEW = exports.STATE_NEW = 20;
var STATE_PLAYING = exports.STATE_PLAYING = 21;
var STATE_SUCCESS = exports.STATE_SUCCESS = 22;
var STATE_FAIL = exports.STATE_FAIL = 23;

var EMPTY_CELL = exports.EMPTY_CELL = -1;
var FLAG = exports.FLAG = -2;
var BOMB = exports.BOMB = -3;
var NUMBER = -4;
