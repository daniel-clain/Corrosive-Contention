'use strict';

const GameSettings = require('./gameSettings.js');




module.exports = class GameController{

  constructor(){
    this.gameSettings = new GameSettings();
  }

  setGameInitialRandomTreeLocationsTileIdArray(){
    const randomTileIds = [];
    const tiles = this.gameSettings.gameRows * this.gameSettings.gameCols;
    const numberOfRandomTrees = tiles * this.gameSettings.treeInitialPercentageCoverage / 100;
    let randomTile;
    for (let i = 0; i < numberOfRandomTrees; i++){
      randomTile = Math.round(Math.random()*(tiles - 1));
      if(!randomTileIds.indexOf(randomTile) >= 0){
        randomTileIds.push(randomTile)
      }else{
        while(!randomTileIds.indexOf(randomTile) >= 0){
          randomTile = Math.round(Math.random()*(tiles - 1));
          if(!randomTileIds.indexOf(randomTile) >= 0){
            randomTileIds.push(randomTile)
          }
        }
      }
    }
    return randomTileIds
  };

  newGame(playerObjects){
    const players = playerObjects.map((player, i) => {
      return {
        playerNumber: i+1,
        id: player.id
      }
    });

    const gameObject = {
      id: new Date().getTime(),
      players: players,
      gameSettings: this.gameSettings
    };



    gameObject.gameSettings.initialTreeLocations = this.setGameInitialRandomTreeLocationsTileIdArray();
    gameObject.gameSettings.volatileDetectorLocations = this.getVolatileDetectorLocations();

    return gameObject;
  };


  getVolatileDetectorLocations(){
    const returnLocations = [];
    const numberOfDetectors = Math.ceil(this.gameSettings.gameCols*this.gameSettings.gameRows*0.06);
    const tiles = this.gameSettings.gameCols*this.gameSettings.gameRows;
    for (let i = 0; i < numberOfDetectors; i++){
      const randomTile = Math.round(Math.random()*(tiles - 1));
      returnLocations.push(randomTile)
    }

    return returnLocations;
  };


  startTreeRegrowthAlgorithm(){
    this.calculateTreeRegrowth(this.gameSettings.treeInitialPercentageCoverage)
  };

  calculateTreeRegrowth (percentageCoverage){

    let regrowthObj;

    if(percentageCoverage < 5){
      regrowthObj = this.gameSettings.treeRegrowthRate['whenUnder5%']
    }
    if(percentageCoverage < 25){
      regrowthObj = this.gameSettings.treeRegrowthRate['whenUnder25%']
    }
    if(percentageCoverage < 50){
      regrowthObj = this.gameSettings.treeRegrowthRate['whenUnder50%']
    }
    if(percentageCoverage < 75){
      regrowthObj = this.gameSettings.treeRegrowthRate['whenUnder75%']
    }
    if(percentageCoverage < 95){
      regrowthObj = this.gameSettings.treeRegrowthRate['whenUnder95%']
    }

    return regrowthObj;

  };

};
