var app = require('express')();
var server = app.listen(3000);
var io = require('socket.io')(server);
var fs = require('fs');

var playersCurrentlySearchingForGames = [];
var numberOfPlayersInEachGame = 1;
var activeGames = [];

var treeInitialPercentageCoverage = 80;

treeRegrowthRate = {
  'whenUnder5%': {
    treesSpawnedPerPeriod: 3,
    period: 5
  },
  'whenUnder25%': {
    treesSpawnedPerPeriod: 2,
    period: 10
  },
  'whenUnder50%': {
    treesSpawnedPerPeriod: 2,
    period: 20
  },
  'whenUnder75%': {
    treesSpawnedPerPeriod: 1,
    period: 20
  },
  'whenUnder95%': {
    treesSpawnedPerPeriod: 0,
    period: 20
  }
}

var gameSettings = {
    tileSize: 80,
    gameCols: 12,
    gameRows: 7,
    initialTreeLocations: []
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('sentFromGame', function(sentFromGame) {
    processPacketFromClient(socket, sentFromGame)
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

processPacketFromClient = function(socket, packet){
  if(packet.eventName === 'searching for game'){
    console.log('player is searching for game');
    searchingForGame(socket);
  }
  else if(packet.eventName === 'ready for game to start'){
    console.log('player is ready for game to start');
    readyToStart(socket);
  }else if(packet.eventName === 'tree regrowth cycle'){
    console.log('tree regrow');
    readyToStart(socket);
  }
  else if(packet.data && packet.data.gameId){
    standardGameBroadcast(socket, packet);
  }
};


searchingForGame = function(socket){
  playersCurrentlySearchingForGames.push(socket);
  if(playersCurrentlySearchingForGames.length === numberOfPlayersInEachGame){
    newGame()
  }else{
    console.log('Number of players searching for game: '+playersCurrentlySearchingForGames.length)
  }
};


readyToStart = function(socket){
    socket.emit('sentFromServer', {
        eventName: 'start game',
        data: {blerg:'narl'}
    });
    console.log('game starts after is ready to start')
};

getPlayersGameObject = function(gameId){
  var game;
  for(var i = 0; i < activeGames.length; i++){
    if(activeGames[i].gameId === gameId){
      game = activeGames[i];
      break;
    }
  }
  return game;
};

broadcastToAllOtherPlayers = function(gamePlayers, socketId, packet){
  console.log('broadcast: ',packet.eventName);
  for(var j = 0; j < gamePlayers.length; j++){
    if(gamePlayers[j].socketInstance.id !==socketId){
      gamePlayers[j].socketInstance.emit('sentFromServer', packet)
    }
  }
};

standardGameBroadcast = function(socket, packet){
  var game = getPlayersGameObject(packet.data.gameId);
  broadcastToAllOtherPlayers(game.players, socket.id, packet);
};

setGameInitialRandomTreeLocationsTileIdArray = function(){
  var randomTileIds = [];
  var tiles = gameSettings.gameRows*gameSettings.gameCols;
  var numberOfRandomTrees = tiles*treeInitialPercentageCoverage/100;
  for(var i = 0; i < numberOfRandomTrees; i++){

    var randomTile = Math.round(Math.random()*(tiles - 1));
    if(randomTileIds.indexOf(randomTile) === -1){
      randomTileIds.push(randomTile)
    }else{
      while(randomTileIds.indexOf(randomTile) !== -1){
        if(randomTileIds.indexOf(randomTile) === -1){
          randomTileIds.push(randomTile)
        }else{
          randomTile = Math.round(Math.random()*(tiles - 1))
        }
      }
    }
  }
  return randomTileIds
};

startTreeRegrowthAlgorithm = function(gameId){

  calculateTreeRegrowth(treeInitialPercentageCoverage, gameId)

}

calculateTreeRegrowth = function(percentageCoverage, gameId){

  var regrowthObj;

  if(percentageCoverage < 5){
    regrowthObj = treeRegrowthRate['whenUnder5%']
  }
  if(percentageCoverage < 25){
    regrowthObj = treeRegrowthRate['whenUnder25%']
  }
  if(percentageCoverage < 50){
    regrowthObj = treeRegrowthRate['whenUnder50%']
  }
  if(percentageCoverage < 75){
    regrowthObj = treeRegrowthRate['whenUnder75%']
  }
  if(percentageCoverage < 95){
    regrowthObj = treeRegrowthRate['whenUnder95%']
  }

  var packet = {
    eventName: 'tree regrowth',
    data: regrowthObj
  };

  var gamePlayers = getPlayersGameObject(gameId).players;
  for(var j = 0; j < gamePlayers.length; j++){
    gamePlayers[j].socketInstance.emit('sentFromServer', packet)
  }
}


newGame = function(){
  var timeNow = new Date().getTime();
  gameSettings.initialTreeLocations = setGameInitialRandomTreeLocationsTileIdArray();
  var gameObject = {
    gameId: timeNow,
    players: [],
    gameSettings: gameSettings
  };

  for(var j=0; j < playersCurrentlySearchingForGames.length; j++){
    var player = {
      playerNumber: j+1
    };
    gameObject.players.push(player)
  }

  for(var i=0; i < playersCurrentlySearchingForGames.length; i++){
    gameObject.yourPlayerNumber = i+1;
    playersCurrentlySearchingForGames[i].emit('sentFromServer', {eventName: 'game found', data: gameObject})
  }


  for(var q=0; q < gameObject.players.length; q++){
    gameObject.players[q].socketInstance = playersCurrentlySearchingForGames[q]
  }
  activeGames.push(gameObject);
  console.log('Enough players ('+numberOfPlayersInEachGame+') -> Starting Game');
  console.log('Number of active games: ', activeGames.length);
  playersCurrentlySearchingForGames = []
  
  startTreeRegrowthAlgorithm(gameObject.gameId)
};
