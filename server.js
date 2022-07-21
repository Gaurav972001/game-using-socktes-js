const express = require('express');
const app = express();
app.use(express.static('public'));
const port = 8000;
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(port, () => {
	console.log(`Game started at - http://localhost:${port}`);
});

app.get('/', function (req, res) {
	res.sendFile('/index.html');
});

const players = {};
let unmatched = 0;

io.on('connection', (socket) => {
	console.log(`Player Joined with id : ${socket.id}`);
	joinGame(socket);

	if (getOpponent(socket)) {
		socket.emit('game.begin', {
			symbol: players[socket.id].symbol,
		});
		getOpponent(socket).emit('game.begin', {
			symbol: players[getOpponent(socket).id].symbol,
		});
	}

	socket.on('make.move', function (data) {
		if (!getOpponent(socket)) {
			return;
		}
		socket.emit('move.made', data);
		getOpponent(socket).emit('move.made', data);
	});

	socket.on('disconnect', function () {
		if (getOpponent(socket)) {
			getOpponent(socket).emit('opponent.left');
		}
	});
});

const joinGame = (socket) => {
	players[socket.id] = {
		opponent: unmatched,
		symbol: 'X',
		socket: socket,
	};
	if (unmatched) {
		players[socket.id].symbol = 'O';
		players[unmatched].opponent = socket.id;
		unmatched = null;
	} else {
		unmatched = socket.id;
	}
};

const getOpponent = (socket) => {
	if (!players[socket.id].opponent) {
		return;
	}
	return players[players[socket.id].opponent].socket;
};
