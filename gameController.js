'use strict';

const GameSettings = require('./gameSettings.js');




module.exports = class GameController{

  constructor(){
    this.gameSettings = new GameSettings();
  }

  randomTileIdArray(){
    const randomTileIds = [];
    const tiles = this.gameSettings.gameRows * this.gameSettings.gameCols;
    const numberOfTrees = tiles * this.gameSettings.treeInitialPercentageCoverage / 100;
    let randomTile;

    const getRandomTile = () => {
      const randomTile = Math.round(Math.random()*(tiles - 1));
      if(randomTileIds.indexOf(randomTile) === -1){
        return randomTile
      }else{
        return getRandomTile();
      }
    }

    for (let i = 0; i < numberOfTrees; i++){
      randomTile = getRandomTile();
      randomTileIds.push(randomTile);
    }
    console.log('randomTileIds: ', randomTileIds);
    return randomTileIds;


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


    gameObject.gameSettings.initialTreeObjects = this.getInitialTreeObjects();
    gameObject.gameSettings.volatileDetectorLocations = this.getVolatileDetectorLocations();

    return gameObject;
  };

  getInitialTreeObjects(){
    const ids = this.randomTileIdArray();
    let treeObjects = [];
    const chanceToBeVolatile = 50;

    for(let i = 0; i < ids.length; i++){
      let treeObject = {};
      treeObject.volatile = Math.random() * 100 < chanceToBeVolatile;
      if(!treeObject.volatile){
        treeObject.siphonLoot = this.getRandomSiphonLoot();
      }
      treeObject.treeModelType = Math.floor(Math.random() * 2);
      treeObject.tileId = ids[i];
      treeObjects.push(treeObject)
    }

    return treeObjects;

  }
  getRandomSiphonLoot(){
    let bombsItem;
    let essenceColour;
    let essencePosition;

    let bombItemDrop;
    let essenceItemDrop;

    let oneBombChance;
    let threeBombChance;
    let essenceChance;


    const testChances = (spawnType) => {

      if (spawnType === 'siphon'){
        oneBombChance = 50;
        threeBombChance = 0;
        essenceChance = 70
      }
      if (spawnType === 'explode'){
        oneBombChance = 10;
        threeBombChance = 5;
        essenceChance = 30
      }

      bombItemDrop = (Math.random() * 100) < oneBombChance;
      if (bombItemDrop){
        bombsItem = 'oneBomb'
      } else {
        bombItemDrop = (Math.random() * 100) < threeBombChance;
        if (bombItemDrop){
          bombsItem = 'threeBombs'
        } else {
          bombsItem = 'noBombs'
        }
      }

      essenceItemDrop = (Math.random() * 100) < essenceChance;
      if (essenceItemDrop){
        const numberOfColours = 4;
        const randomNum = Math.floor(Math.random() * numberOfColours);
        const colors = ['blue', 'green', 'yellow', 'purple'];
        essenceColour = colors[randomNum];
        const x = Math.floor(Math.random() * 50);
        const y = Math.floor(Math.random() * 50);
        essencePosition = {x: x, y: y}
      }

      const returnResults = {
        bombsItem: bombsItem,
        essenceColour: essenceColour,
        essencePosition: essencePosition
      }

      return returnResults;

    }

    const explodeResults = testChances('explode')
    const siphonResults = testChances('siphon')

    return {explodeResults: explodeResults, siphonResults: siphonResults}

  }


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
