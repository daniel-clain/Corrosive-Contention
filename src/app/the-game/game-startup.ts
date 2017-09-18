
import { TileData, GameSettings } from '../definitions/class-definitions';
import { Tile } from './tile/tile.component';
import { Player } from './player/player';
import { Tree } from './game-board-entities/tree';
import { TheGame } from './the-game.component'
import { GameHud } from './hud/game-hud.component'
import { TileService } from './tile-service';

export class GameStartup{
    private gameSettings: GameSettings;
    tilesReadyResolve: any;
    hudReadyResolve: any;
  playersReadyResolve: any;

    constructor(private theGame: TheGame){

      const hudReady = new Promise((resolve) => {
        this.hudReadyResolve = resolve;
      });
      const tilesReady = new Promise((resolve) => {
        this.tilesReadyResolve = resolve;
      });


      const playersReady = new Promise((resolve) => {
        this.playersReadyResolve = resolve;
      });




      this.gameSettings = this.theGame.serverGameObject.gameSettings;
      this.renderGameBoard(this.gameSettings.gameCols, this.gameSettings.gameRows, this.gameSettings.tileSize);

      Promise.all([hudReady, tilesReady, playersReady]).then(() => {
        this.gameBoardReady()
      })

    }

    private renderGameBoard(columns, rows, tileSize){
        let columnCount = 1, rowCount = 1;
        this.theGame.tileData = [];
        for (let i = 0; i < columns * rows; i++){
            const random_x: number = this.getRandomBg('x', tileSize);
            const random_y: number = this.getRandomBg('y', tileSize);
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

  playerCreated(player: Player){
      if (player.playerNumber === this.theGame.serverGameObject.yourPlayerNumber){
        this.theGame.mainPlayer = player;
      }else {
        this.theGame.otherPlayers.push(player)
      }
      if (this.theGame.mainPlayer && (this.theGame.otherPlayers.length + 1 === this.theGame.serverGameObject.players.length)){
        this.playersReadyResolve();
      }
  }

    gameTileCreated(tile: Tile){
        if (this.theGame.tiles === undefined){
            this.theGame.tiles = [tile]
        } else {
            this.theGame.tiles.push(tile);
        }
        if (this.theGame.tiles.length === this.gameSettings.gameCols * this.gameSettings.gameRows){
          this.tilesReadyResolve();
        }
    }

    private createPlayerInstances(){
      /*const mainPlayerNumber: number = this.theGame.serverGameObject.yourPlayerNumber;
      this.theGame.mainPlayer = new Player(this.theGame, mainPlayerNumber);
      this.theGame.mainPlayer.ready = true;
      this.theGame.otherPlayers = [];
      const players: any[number] = this.theGame.serverGameObject.players;
      players.map(player => player.playerNumber).forEach((playerNumber: number) => {
          if (playerNumber !== mainPlayerNumber){
              this.theGame.otherPlayers.push(new Player(this.theGame, playerNumber));
          }
      })
      */
    }

    private gameBoardReady(){
      this.theGame.tileService = new TileService(this.theGame.tiles, this.theGame.serverGameObject.gameSettings);
      this.spawnInitialTrees();
      this.createPlayerInstances();
      this.theGame.mainPlayer.moveToStartLocation();
      this.theGame.gameHud.setupStats(this.theGame.mainPlayer.stats);
      this.theGame.gameSetupDone()
    }


  private spawnInitialTrees(){
    const tileIds = this.gameSettings.initialTreeLocations;
    const chanceToBeVolatile = 20;
    for (let i = 0; i < this.theGame.tiles.length; i++){
        if (tileIds.indexOf(this.theGame.tiles[i].id) >= 0){
            const randomTreeType = Math.floor(Math.random() * 2);
            const randomChanceVolatile: Boolean = (Math.random() * 100 < chanceToBeVolatile);
            this.theGame.tiles[i].entityEnterTile(new Tree(this.theGame.tiles[i], randomTreeType, randomChanceVolatile, this.theGame.tileService))
        }
    }
  }

    private getRandomBg(dimension, tileSize: number): number{
        if (dimension === 'x'){
            const num = 512 - tileSize;
            return Math.floor(Math.random() * num) * -1;
        }else {
            const num = 512 - tileSize;
            return Math.floor(Math.random() * num) * -1;
        }
    }
}
