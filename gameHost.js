var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

playersCurrentlySearchingForGames = []
numberOfPlayersInEachGame = 1
activeGames = []


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});




searchingForGame = function(socket){  
  playersCurrentlySearchingForGames.push(socket)
  if(playersCurrentlySearchingForGames.length === numberOfPlayersInEachGame){
    newGame()
  }else{
    console.log('Number of players searching for game: '+playersCurrentlySearchingForGames.length)
  }
}


readyToStart = function(socket){
    socket.emit('sentFromServer', {
        eventName: 'start game',
        data: {blerg:'narl'}
    });
    console.log('game starts after is ready to start')
}

playerMoveUpdate = function(socket, packet){
  var game;
  for(var i = 0; i < activeGames.length; i++){
    if(activeGames[i].gameId === packet.data.gameId){
      game = activeGames[i];
      break;
    }
  }

  for(var j = 0; j < game.players.length; j++){
    game.players[j].socketInstance.emit('sentFromServer', {
      eventName: 'player move update', 
      data: packet.data
    })
  }

}

bombAndEssenceTileUpdate = function(socket, packet){
  var game;
  for(var i = 0; i < activeGames.length; i++){
    if(activeGames[i].gameId === packet.data.gameId){
      game = activeGames[i];
      break;
    }
  }

  for(var j = 0; j < game.players.length; j++){
    game.players[j].socketInstance.emit('sentFromServer', {
      eventName: 'bomb and essence tile update', 
      data: packet.data
    })
  }
}



processPacketFromServer = function(socket, packet){
  if(packet.eventName === 'searching for game'){
    console.log('player is searching for game');
    searchingForGame(socket);
  }  
  if(packet.eventName === 'ready for game to start'){
    console.log('player is ready for game to start');
    readyToStart(socket);
  }
  if(packet.eventName === 'player move update'){
    console.log('player move update');
    playerMoveUpdate(socket, packet);
  }
  if(packet.eventName === 'essence and bomb enter tile'){
    console.log('essence and bomb enter tile');
    bombAndEssenceTileUpdate(socket, packet);
  }



  
}





io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('sentFromGame', function(sentFromGame) {
    processPacketFromServer(socket, sentFromGame)
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
http.listen(3000, function(){
  console.log('Server: listening on *:3000');
});


newGame = function(){
  timeNow = new Date().getTime()
  gameObject = {
    gameId: timeNow,
    players: []
  }

  for(j=0; j < playersCurrentlySearchingForGames.length; j++){
    player = {
      playerNumber: j+1
    }
    gameObject.players.push(player)
  }

  for(i=0; i < playersCurrentlySearchingForGames.length; i++){
    gameObject.yourPlayerNumber = i+1
    console.log(gameObject)
    playersCurrentlySearchingForGames[i].emit('sentFromServer', {eventName: 'game found', data: gameObject})
  }

  
  for(q=0; q < gameObject.players.length; q++){
    gameObject.players[q].socketInstance = playersCurrentlySearchingForGames[q]
  }

  activeGames.push(gameObject)
  console.log('Enough players -> Starting Game')
  console.log('Number of active games: ', activeGames.length)
  playersCurrentlySearchingForGames = []
}
