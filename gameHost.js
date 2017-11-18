'use strict';
const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const GameController = require('./gameController.js');

const io = require('socket.io')(server);

const gameController = new GameController();

// sets port 8080 to default or unless otherwise specified in the environment
app.set('port', process.env.PORT || 3000);


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

server.listen(app.get('port'), () => console.log(`Listening on ${ app.get('port') }`));

// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ server });

const playersSearching = [];
const numberOfPlayersInEachGame = 2;
const games = [];
const onlinePlayers = [];

io.on('connection', function(socket){
  console.log('a user connected');
  const newPlayer = {
    socket: socket,
    id: new Date().getTime()
  }
  newPlayer.socket.emit('sentFromServer', {eventName: 'connected', data: {connectionId: newPlayer.id}});

  onlinePlayers.push(newPlayer);
  console.log('onlinePlayers: ', onlinePlayers.length)

  socket.on('sentFromGame', packet => {
    processPacketFromClient(packet)
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


const processPacketFromClient = function(packet){
  switch(packet.eventName){
    case 'searching for game': searchingForGame(packet.data.connectionId); break;
    case 'ready for game to start': readyToStart(packet.data.connectionId); break;
    case 'tree regrowth cycle': console.log('tree regrow'); break;
    default:
    if(packet.data && packet.data.gameId){
      broadcastToAllOtherPlayers(packet.data.gameId, packet.data.connectionId, packet);
    }
  }
};


const searchingForGame = function(connectionId){
  const player = onlinePlayers.find(player => player.id === connectionId)
  playersSearching.push(player);

  if(playersSearching.length === numberOfPlayersInEachGame){

    console.log('Enough players ('+playersSearching.length+') -> Starting Game');

    const gameObject = gameController.newGame(playersSearching);

    playersSearching.forEach((player, i) => {
      gameObject.yourPlayerNumber = i+1;
      sendToSocket(player.socket, {
        eventName: 'game found',
        data: {gameObject: gameObject}
      })
    });
    delete gameObject.yourPlayerNumber;


    games.push(gameObject);
    console.log('Number of active games: ', games.length);
    playersSearching.length = 0;

    const regrowthObj = gameController.startTreeRegrowthAlgorithm(gameObject.gameId);

    const packet = {
      eventName: 'tree regrowth',
      data: regrowthObj
    };

    const gamePlayers = gameObject.players;
    /*for (let j = 0; j < gamePlayers.length; j++){
      sendToSocket(gamePlayers[j].socket, packet);
    }*/
  }else{
    console.log('Number of players searching for game: '+ playersSearching.length)
  }
};

function sendToSocket(socket, packet){
  socket.emit('sentFromServer',packet)
};



function readyToStart(playerId){
  const playerSocket = onlinePlayers.find(player => player.id === playerId).socket;
  sendToSocket(playerSocket, {eventName: 'start game'});
};


function broadcastToAllGamePlayers(gameId, packet){
  const game = games.find(game => game.id === gameId);

  game.players.forEach(gamePlayer => {
    const player = onlinePlayers.find(onlinePlayer => gamePlayer.id === onlinePlayer.id);
    player.socket.emit('sentFromServer',packet)
  });
}


const broadcastToAllOtherPlayers = function (gameId, mainPlayerId, packet) {
  const game = games.find(game => game.id === gameId);

  game.players.forEach(gamePlayer => {
    if(gamePlayer.id !== mainPlayerId){
      const player = onlinePlayers.find(onlinePlayer => gamePlayer.id === onlinePlayer.id);
      player.socket.emit('sentFromServer',packet)
    }
  });
};






