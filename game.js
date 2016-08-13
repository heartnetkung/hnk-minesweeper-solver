function MinesweeperGame(configOrBoard) {
	if (Array.isArray(configOrBoard)) {
		this.mine = countMine(configOrBoard, configOrBoard[0].length, configOrBoard.length)
		this.hiddenBoard = configOrBoard;
	} else {
		this.mine = configOrBoard.mine;
		this.hiddenBoard = randomBoard(configOrBoard.width, configOrBoard.height, configOrBoard.mine);
		fillNumber(this.hiddenBoard, configOrBoard.width, configOrBoard.height);
	}

	this.height = this.hiddenBoard.length;
	this.width = this.hiddenBoard[0].length;
	this.state = STATE_NEW;
	this.hiddenBoard.toString = this.hiddenBoard.inspect = boardToString;
	this.flagCount = 0;

	var rowProto = [];
	this.board = [];
	this.board.toString = this.board.inspect = boardToString;
	for (var i = 0; i < this.width; i++)
		rowProto.push(EMPTY_CELL);
	for (var i = 0; i < this.height; i++)
		this.board.push(rowProto.slice(0));
}
exports.MinesweeperGame = MinesweeperGame;


MinesweeperGame.prototype.answer = function(x, y) {
	if (this.state === STATE_FAIL || this.state === STATE_SUCCESS)
		return;
	if (this.state === STATE_NEW) {
		this.startTime = Date.now();
		this.state = STATE_PLAYING;
	}
	var ans = recursiveAnswer(this.board, this.hiddenBoard, x, y, this.width, this.height);
	if (ans) {
		this.endTime = Date.now();
		return this.state = STATE_FAIL;
	}
	if (isSuccess(this.board, this.hiddenBoard, this.width, this.height)) {
		this.endTime = Date.now();
		return this.state = STATE_SUCCESS;;
	}
	return false;
};


MinesweeperGame.prototype.getWidth = function() {
	return this.width;
};


MinesweeperGame.prototype.getHeight = function() {
	return this.height;
};


MinesweeperGame.prototype.getBoard = function() {
	return this.board;
};


MinesweeperGame.prototype.flag = function(x, y) {
	if (this.state === STATE_FAIL || this.state === STATE_SUCCESS)
		return;
	if (this.board[y][x] === EMPTY_CELL) {
		this.board[y][x] = FLAG;
		this.flagCount++;
	} else if (this.board[y][x] === FLAG) {
		this.board[y][x] = EMPTY_CELL;
		this.flagCount--;
	}
};


MinesweeperGame.prototype.mineLeft = function() {
	return
};


MinesweeperGame.prototype.getTime = function() {
	if (this.state === STATE_NEW)
		return 0;
	if (this.endTime)
		return Math.floor((this.endTime - this.startTime) / 1000);
	return Math.floor((Date.now() - this.startTime) / 1000);
};


MinesweeperGame.prototype.getState = function() {
	return this.state;
}


var recursiveAnswer = function(board, hiddenBoard, x, y, w, h) {
	if (y >= h || x >= w || x < 0 || y < 0)
		return false;
	if (board[y][x] !== EMPTY_CELL && board[y][x] !== FLAG)
		return false;
	if (hiddenBoard[y][x] === BOMB) {
		board[y][x] = hiddenBoard[y][x];
		return true;
	}
	if (hiddenBoard[y][x] !== 0) {
		board[y][x] = hiddenBoard[y][x];
		return false;
	}
	var ans = false;
	board[y][x] = 0;
	ans = ans || recursiveAnswer(board, hiddenBoard, x - 1, y - 1, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x - 1, y, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x - 1, y + 1, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x, y - 1, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x, y + 1, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x + 1, y - 1, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x + 1, y, w, h);
	ans = ans || recursiveAnswer(board, hiddenBoard, x + 1, y + 1, w, h);
	return ans;
};


var boardToString = function() {
	var board = this;
	var h = board.length;
	var w = board[0].length;
	var ans = '';
	for (var i = 0; i < h; i++) {
		ans += '|';
		for (var j = 0; j < w; j++) {
			var current = board[i][j];
			if (current === EMPTY_CELL)
				ans += ' □ ';
			else if (current === FLAG)
				ans += ' ⚑ ';
			else if (current <= 9 && current >= 1)
				ans += ' ' + current + ' ';
			else if (current === 0)
				ans += '   ';
			else
				ans += ' X ';
		}
		ans += '|\n';
	}
	return ans;
};


var isSuccess = function(board, hiddenBoard, w, h) {
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++) {
			var hiddenCell = hiddenBoard[i][j];
			if (0 <= hiddenCell && hiddenCell <= 9 && hiddenCell !== board[i][j])
				return false;
		}
	return true;
};


var countMine = function(board, w, h) {
	var ans = 0;
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++)
			if (board[i][j] === BOMB)
				ans++;
	return ans;
};


var randomBoard = function(w, h, mine) {
	var rowProto = [];
	var ans = [];
	for (var i = 0; i < w; i++)
		rowProto.push(EMPTY_CELL);
	for (var i = 0; i < h; i++)
		ans.push(rowProto.slice(0));
	while (mine) {
		var randomPos = Math.floor(Math.random() * w * h);
		var y = Math.floor(randomPos / w);
		var x = randomPos % w;
		if (ans[y][x] === EMPTY_CELL) {
			mine--;
			ans[y][x] = BOMB;
		}
	}
	return ans;
};


var fillNumber = function(board, w, h) {
	for (var i = 0; i < h; i++)
		for (var j = 0; j < w; j++) {
			if (board[i][j] !== EMPTY_CELL)
				continue;
			var number = 0;
			if (i - 1 >= 0 && j - 1 >= 0)
				number += (board[i - 1][j - 1] === BOMB) ? 1 : 0;
			if (i - 1 >= 0)
				number += (board[i - 1][j] === BOMB) ? 1 : 0;
			if (i - 1 >= 0 && j + 1 < w)
				number += (board[i - 1][j + 1] === BOMB) ? 1 : 0;
			if (j - 1 >= 0)
				number += (board[i][j - 1] === BOMB) ? 1 : 0;
			if (j + 1 < w)
				number += (board[i][j + 1] === BOMB) ? 1 : 0;
			if (i + 1 < h && j - 1 >= 0)
				number += (board[i + 1][j - 1] === BOMB) ? 1 : 0;
			if (i + 1 < h)
				number += (board[i + 1][j] === BOMB) ? 1 : 0;
			if (i + 1 < h && j + 1 < w)
				number += (board[i + 1][j + 1] === BOMB) ? 1 : 0;
			board[i][j] = number;
		}
};


exports.BEGINNER = {
	width: 9,
	height: 9,
	mine: 10
};
exports.INTERMIDIATE = {
	width: 16,
	height: 16,
	mine: 40
};
exports.EXPERT = {
	width: 30,
	height: 16,
	mine: 99
};

var STATE_NEW = exports.STATE_NEW = 20;
var STATE_PLAYING = exports.STATE_PLAYING = 21;
var STATE_SUCCESS = exports.STATE_SUCCESS = 22;
var STATE_FAIL = exports.STATE_FAIL = 23;

var EMPTY_CELL = exports.EMPTY_CELL = -1;
var FLAG = exports.FLAG = -2;
var BOMB = exports.BOMB = -3;
