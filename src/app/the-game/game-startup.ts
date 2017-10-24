
import { TileData, GameSettings, CreateGameBoardEntityObject } from '../definitions/class-definitions';
import { Tile } from './tile/tile.component';

import { TheGame } from './the-game.component'
import { GameHud } from './hud/game-hud.component'

export class GameStartup{
  private gameSettings: GameSettings;
  tilesReadyResolve: any;
  hudReadyResolve: any;

  constructor(private theGame: TheGame){

    const hudReady = new Promise((resolve) => {
      this.hudReadyResolve = resolve;
    });
    const tilesReady = new Promise((resolve) => {
      this.tilesReadyResolve = resolve;
    });


    this.theGame.players = [];
    this.gameSettings = this.theGame.serverGameObject.gameSettings;
    this.renderGameBoard(this.gameSettings.gameCols, this.gameSettings.gameRows, this.theGame.tileSize);

    Promise.all([hudReady, tilesReady]).then(() => {
      this.gameBoardReady()
    })

  }

  private renderGameBoard(columns, rows, tileSize){
    let columnCount = 1, rowCount = 1;
    this.theGame.tileData = [];
    for (let i = 0; i < columns * rows; i++){
      const num = 512 - tileSize;
      const random_x: number = Math.floor(Math.random() * num) * -1;
      const random_y: number = Math.floor(Math.random() * num) * -1;
      this.theGame.tileData.push(<TileData>{id: i, column: columnCount, row: rowCount, bgx: random_x, bgy: random_y, size: tileSize });
      columnCount ++;
      if (columnCount > columns){
        rowCount ++;
        columnCount = 1
      }
    }
  }

  gameHudCreated(gameHud: GameHud){
    this.theGame.gameHud = gameHud;
    this.hudReadyResolve();
  }

  createPlayers(){
    const players: any[] = this.theGame.serverGameObject.players;
    const createPlayerObject: CreateGameBoardEntityObject = {
      template: this.theGame.playerTemplate,
      tile: null,
      assets: [{name: 'playerNumber', value: null}]
    };
    players.forEach( player => {
      createPlayerObject.tile = this.theGame.getTileByPlayerStartLocation(player.playerNumber);
      createPlayerObject.assets[0].value = player.playerNumber;
      this.theGame.createGameBoardEntityComponent(createPlayerObject);
    })
  }
  

  gameTileCreated(tile: Tile){
      (this.theGame.tiles ? this.theGame.tiles.push(tile) : this.theGame.tiles = [tile]);
      if (this.theGame.tiles.length === this.gameSettings.gameCols * this.gameSettings.gameRows){
          this.tilesReadyResolve();
      }
  }


  private gameBoardReady(){
    this.spawnInitialTrees();
    this.createPlayers();
    this.placeVolatileDetectors();
    this.theGame.gameReady = true;
    this.theGame.gameSetupDone()
  }


  private spawnInitialTrees(){
    const tileIds = this.gameSettings.initialTreeLocations;
    const chanceToBeVolatile = 30;
    const tiles: Tile[] = this.theGame.tiles;
    for(let i = 0; i < tiles.length; i++){
      if(tileIds.indexOf(tiles[i].id) >= 0){
        const createTreeObject: CreateGameBoardEntityObject = {
          template: this.theGame.treeTemplate,
          tile: tiles[i],
          assets: [
            {name: 'treeModelType', value: Math.floor(Math.random() * 2)},
            {name: 'isVolatile', value: Math.random() * 100 < chanceToBeVolatile}
          ]
        };
        this.theGame.createGameBoardEntityComponent(createTreeObject)
      }
    }
  }

  private placeVolatileDetectors(){
    const tileIds = this.gameSettings.volatileDetectorLocations;
    const tiles: Tile[] = this.theGame.tiles;
    for (let i = 0; i < tiles.length; i++){
      if (tileIds.indexOf(tiles[i].id) >= 0){
        if (tiles[i].treeInTile){
          tiles[i].treeInTile.remove()
        }
        const createVolatileDetectorObject: CreateGameBoardEntityObject = {
          template: this.theGame.detectorTemplate,
          tile: tiles[i]
        };
        setTimeout(() => this.theGame.createGameBoardEntityComponent(createVolatileDetectorObject),1);
      }
    }
  }

}
