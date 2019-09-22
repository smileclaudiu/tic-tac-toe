var app = require('express')();
var http = require('http').createServer(app);
const serveStatic = require('serve-static');
var io = require('socket.io')(http);

app.use('/', serveStatic('/client/dist/'));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

var players = [];
var board = [
              {id: 1, value: 0},
              {id: 2, value: 0},
              {id: 3, value: 0},
              {id: 4, value: 0},
              {id: 5, value: 0},
              {id: 6, value: 0},
              {id: 7, value: 0},
              {id: 8, value: 0},
              {id: 9, value: 0}
            ];

var game = {
  started: false,
  nextToChoose: 1,
  winner: null
};

const isWinner = (player) => {

  return board[0].value === player && board[1].value === player && board[2].value === player ||
         board[3].value === player && board[4].value === player && board[5].value === player ||
         board[6].value === player && board[7].value === player && board[8].value === player ||
         board[0].value === player && board[3].value === player && board[6].value === player ||
         board[1].value === player && board[4].value === player && board[7].value === player ||
         board[2].value === player && board[5].value === player && board[8].value === player ||
         board[0].value === player && board[4].value === player && board[8].value === player ||
         board[2].value === player && board[4].value === player && board[6].value === player
}

const isDraw = () => !board.some( cell => cell.value === 0);

var evaluateMove = (player) => {
  if(isWinner(player)) {
    game.winner = player;
  } else if (isDraw()) {
    game.winner = 0;
  }
};

var resetGame = (context) => {
  if(context === 'disconnected') {
    game.started = false;
  } else {
    game.started = true;
  }
  game.nextToChoose = 1;
  game.winner = null;

  board = board.map( cell => {
     cell.value = 0;
     return cell;
  });
}

io.on('connection', (socket) => {
  if(players.length < 2) {
    const isIdOneAvailable = () => !players.some( player => player.player_id === 1);
      players.push({socket_id: socket.id, player_id: isIdOneAvailable() ? 1 : 2});
      socket.emit('register', {player_id: players.length, board: board})
    io.emit('connected', players.length)
  } else {
    socket.emit('register', 'maxPlayersNumberReached')
  }

  const player = players.find(player => player.socket_id === socket.id)
  //console.log('a user connected ' + ' ' +  JSON.stringify(players));

  socket.on('start', () => {
    if(players.length !== 2) {
      socket.emit('start', 'waitPlayer2')
    } else {
      game.started = true;
      io.emit('start', 'success')
    }
  })

  socket.on('restart', () => {
    resetGame('restart');
    io.emit('restart', board)
  })

  socket.on('select', data => {
    
    var cell = board.find(box => box.id === data.cell_id);
    if(data.player_id !== game.nextToChoose) {
      socket.emit('select', 'notYourTurn')
    } else if(cell.value !== 0) {
      socket.emit('select', 'alreadyTaken')
    } else {
      cell.value = data.player_id;
      evaluateMove(data.player_id);
      if(game.winner === null) {
        var nextPlayer = data.player_id === 1 ? 2 : 1;
        game.nextToChoose = nextPlayer;
        io.emit('next', {nextPlayer, board})
      } else if(game.winner === 0) {
        io.emit('result', {board, winner: 'draw'})
      } else {
        io.emit('result', {board, winner: game.winner})
      }
    }
  })

  socket.on('disconnect', () => {
    const wasPlayer = players.find(player => player.socket_id === socket.id);
    players = players.filter( player => player.socket_id !== socket.id);
    if(wasPlayer) {
      resetGame('disconnected');
      io.emit('abandoned', {board})
      //console.log('user disconnected ' + players.length);
      if(players.length === 1) {
        io.to(players[0].socket_id).emit('message', 'You are now player 1 (X)')
      }
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});