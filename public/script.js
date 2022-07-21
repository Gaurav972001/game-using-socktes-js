const socket = io();
let symbol;
let myTurn;
$('.board button').attr('disabled', true);
$('.board> button').on('click', makeMove);
socket.on('move.made', function (data) {
	$('#' + data.position).text(data.symbol);
	myTurn = data.symbol !== symbol;
	if (!isGameOver()) {
		if (gameTied()) {
			$('#messages').text('Game Drawn!');
			$('#message1').text('Please start the next match');
			$('.board button').attr('disabled', true);
		} else {
			renderTurnMessage();
		}
	} else {
		if (myTurn) {
			$('#messages').text('Game over. You lost.');
		} else {
			$('#messages').text('Game over. You won!');
		}
		$('.board button').attr('disabled', true);
		$('#message1').text('Please start the next match');
	}
});

socket.on('game.begin', function (data) {
	symbol = data.symbol;
	myTurn = symbol === 'X';
	renderTurnMessage();
});

socket.on('opponent.left', function () {
	$('#messages').text('Your friend left the game.');
	$('.board button').attr('disabled', true);
});

function getBoardState() {
	var obj = {};
	$('.board button').each(function () {
		obj[$(this).attr('id')] = $(this).text() || '';
	});
	return obj;
}

const gameTied = () => {
	let isDraw = true;
	$('.board button').each(function () {
		if ($(this).text() === '') isDraw = false;
	});
	return isDraw;
};

const isGameOver = () => {
	const state = getBoardState();
	const matches = ['XXX', 'OOO'];
	const possibleWins = [
		state.a0 + state.a1 + state.a2,
		state.b0 + state.b1 + state.b2,
		state.c0 + state.c1 + state.c2,
		state.a0 + state.b1 + state.c2,
		state.a2 + state.b1 + state.c0,
		state.a0 + state.b0 + state.c0,
		state.a1 + state.b1 + state.c1,
		state.a2 + state.b2 + state.c2,
	];
	for (var i = 0; i < possibleWins.length; i++) {
		if (possibleWins[i] === matches[0] || possibleWins[i] === matches[1]) {
			return true;
		}
	}
};

const renderTurnMessage = () => {
	if (!myTurn) {
		$('#messages').text("Your friend's turn");
		$('.board button').attr('disabled', true);
	} else {
		$('#messages').text('Your turn.');
		$('.board button').removeAttr('disabled');
	}
};

function makeMove(moveClicked) {
	moveClicked.preventDefault();
	if (!myTurn) {
		return;
	}
	if ($(this).text().length) {
		return;
	}
	socket.emit('make.move', {
		symbol: symbol,
		position: $(this).attr('id'),
	});
}
