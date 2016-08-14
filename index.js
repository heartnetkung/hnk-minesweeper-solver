var game = require('./game');
var solver = require('./solver');
var chalk = require('chalk');

var theSolver = new solver.Solver(game.MinesweeperGame, game.INTERMIDIATE);
var messages = [];
var previousPoard = theSolver.game.board+'';

var highlight = function(currentBoard) {
	if (previousPoard === null)
		return previousPoard = currentBoard;
	var ans = '';
	for (var i = 0, ii = currentBoard.length; i < ii; i++) {
		if (previousPoard[i] === currentBoard[i])
			ans += currentBoard[i];
		else if (currentBoard[i] === ' ')
			ans += chalk.yellow('□');
		else
			ans += chalk.yellow(currentBoard[i]);
	}
	previousPoard = currentBoard;
	return ans;
};

for (var i = 0; i < 1000; i++) {
	var message = theSolver.solveOneStep();
	if (message === 'F2')
		return;
	console.log(i, message);
	console.log(highlight(theSolver.game.board + ''));
	messages.push(i + ' ' + message);
	if (theSolver.game.getState() === game.STATE_SUCCESS)
		console.log('======= SUCCESS ========\n', messages.join('\n').replace(/\([^)]+\)/g, ''));
	if (theSolver.game.getState() === game.STATE_FAIL)
		console.log('======== FAIL =========\n', messages.join('\n').replace(/\([^)]+\)/g, ''));
}
