var game = require('./game');
var solver = require('./solver');

var theSolver = new solver.Solver(game.MinesweeperGame, game.INTERMIDIATE);
console.log(theSolver.game.board);
var messages = [];

for (var i = 0; i < 1000; i++) {
	var message = theSolver.solveOneStep();
	if (message === 'F2')
		return;
	console.log(i, message);
	console.log(theSolver.game.board);
	messages.push(i+' '+message);
	if (theSolver.game.getState() === game.STATE_SUCCESS)
		console.log('======= SUCCESS ========\n', messages.join('\n').replace(/\([^)]+\)/g, ''));
	if (theSolver.game.getState() === game.STATE_FAIL)
		console.log('======== FAIL =========\n', messages.join('\n').replace(/\([^)]+\)/g, ''));
}
