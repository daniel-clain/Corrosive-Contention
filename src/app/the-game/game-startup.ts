
import { WindowDimensions, TileData, GameSettings, PlayerHud } from '../definitions/class-definitions';
import { Tile } from './tile/tile.component';
import { Player } from './player/player';
import { Subject } from 'rxjs';
import { Tree } from '../the-game/game-board-entities/tree';
import { TheGame } from './the-game.component'
import { GameHud } from './hud/game-hud.component'
import { TileService } from './tile-service';

export class GameStartup{
    private gameSettings: GameSettings
    constructor(private theGame: TheGame){
        this.gameSettings = this.theGame.serverGameObject.gameSettings
        this.renderGameBoard(this.gameSettings.gameCols, this.gameSettings.gameRows, this.gameSettings.tileSize)
    }
       

    private renderGameBoard(columns, rows, tileSize){
        let columnCount = 1, rowCount = 1;
        this.theGame.tileData = []
        for(let i = 0; i < columns*rows; i++){
            let random_x: number = this.getRandomBg('x', tileSize)
            let random_y: number = this.getRandomBg('y', tileSize)
            this.theGame.tileData.push(<TileData>{id: i, column: columnCount, row: rowCount, bgx: random_x, bgy: random_y, size: tileSize })
            columnCount ++
            if(columnCount > columns){
                rowCount ++
                columnCount = 1
            }
        }
    }

    gameHudCreated(gameHud: GameHud){
        this.theGame.gameHud = gameHud;
    }

    gameTileCreated(tile: Tile){
        if(this.theGame.tiles === undefined){
            this.theGame.tiles=[tile]
        } else { 
            this.theGame.tiles.push(tile);
        }
        if(this.theGame.tiles.length === this.gameSettings.gameCols * this.gameSettings.gameRows){
            this.gameBoardReady()
        }
    }
    private gameBoardReady(){
        this.theGame.tileService = new TileService(this.theGame.tiles, this.theGame.serverGameObject.gameSettings);
        this.spawnInitialTrees()
        this.createPlayerInstances()
        this.theGame.gameHud.setupStats(this.theGame.mainPlayer.stats)
        this.theGame.gameSetupDone()
    }

    private createPlayerInstances(){
        this.theGame.mainPlayer = new Player(this.theGame);
        this.theGame.mainPlayer.ready = true;
        this.theGame.moveBoard(this.theGame.mainPlayer.tile)

        let mainPlayerNumber: number = this.theGame.mainPlayer.playerNumber
        this.theGame.otherPlayers = []
        let players: any[number] = this.theGame.serverGameObject.players;
        players.map(player=>player.playerNumber).forEach((playerNumber: number) => {
            if(playerNumber!==mainPlayerNumber){
                this.theGame.otherPlayers.push(new Player(this.theGame));
            }
        })
    }

  private spawnInitialTrees(){
    let tileIds = this.gameSettings.initialTreeLocations
    let chanceToBeVolatile = 20
    for(let i = 0; i < this.theGame.tiles.length; i++){
        if(tileIds.indexOf(this.theGame.tiles[i].id) >= 0){
            let randomTreeType = Math.floor(Math.random()*2)
            let randomChanceVolatile: Boolean = (Math.random()*100<chanceToBeVolatile)
            this.theGame.tiles[i].entityEnterTile(new Tree(this.theGame.tiles[i], randomTreeType, randomChanceVolatile, this.theGame.tileService))
        }
    }
  }
  
    private getRandomBg(dimension, tileSize:number): number{
        if(dimension === 'x'){
            let num = 512 - tileSize
            return Math.floor(Math.random()*num)*-1;
        }else {
            let num = 512 - tileSize
            return Math.floor(Math.random()*num)*-1;
        }
    }

}