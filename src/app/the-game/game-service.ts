import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { ConnectionService } from '../connection-service/connection-service';
import { GameComponent } from './the-game.component';
import { TileComponent } from './tile/tile.component';
import { UserControlledPlayer } from './player/user-controlled-player';
import { Player } from './player/player';
import { Packet, Bomb, EssenceColour, BombItem, Loot, WindowDimensions, Direction, ServerGameObject, GameSettings, TreeAcid, Explosion, HudItem, Hud } from '../type-definitions/type-definitions';
import { Tile } from './tile/tile'
import { PlayerService } from './player/player-service'
import { RegisterComponentsService } from './register-components-service';


export class GameService{
    windowResizeSubject = new Subject<WindowDimensions>();
    bombExplodeSound = new Audio('../../assets/acid-burn.mp3');
    
    gameSettings: GameSettings;
    gameComponent: GameComponent;
    otherPlayers: Player[];
    serverGameObject: ServerGameObject;
    playerService: PlayerService;
    tiles: Tile[] = [];
    topVal: number = 0;
    leftVal: number = 0;
    windowWidth: number;
    windowHeight: number;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        let windowDimensions: WindowDimensions = {
            height: event.target.innerHeight,
            width: event.target.innerWidth
        }
        this.windowResizeSubject.next(windowDimensions)
    }

    constructor(public user: UserControlledPlayer, private connectionService: ConnectionService) {
        this.playerService = new PlayerService(this.connectionService, this);
        this.gameSettings = this.connectionService.serverGameObject.gameSettings;
        this.bombExplodeSound.load()

    }
    gameBoardReady(){

        this.spawnInitialTrees()

        let startLocation = this.getTileByPlayerStartLocation(this.connectionService.serverGameObject.yourPlayerNumber);
        this.user.player = new Player(this.connectionService.serverGameObject.yourPlayerNumber, startLocation, this.playerService);
        
        this.user.player.moveToStartLocation();
        

        this.otherPlayers = []
        let players = this.connectionService.serverGameObject.players;
        players.forEach(player => {
            if(player.playerNumber !== this.user.player.playerNumber){
                let startLocation = this.getTileByPlayerStartLocation(player.playerNumber);
                let otherPlayer: Player = new Player(player.playerNumber, startLocation, this.playerService)
                this.otherPlayers.push(otherPlayer);
                otherPlayer.moveToStartLocation();
            }
        })



        let hudObject: Hud
        hudObject = this.user.player.stats
        this.gameComponent.setHudObject(hudObject)
    }

    bombTravel(bomb: Bomb, tile: Tile){
        tile.bombLeaveTile(bomb.direction)
        setTimeout(() => {
            let nextTile: Tile = this.getTileRelativeToAnotherTile(tile, bomb.direction)
            if(nextTile){
              let bombResponse: string = nextTile.bombEnterTile(bomb)
              if(bombResponse === 'hit' || bombResponse === 'at the end'){
                  this.bombExplode(bomb, nextTile)
                  bomb.exploded = true;
              }
              if(!bomb.exploded && bomb.bouncesLeft !== 0){
                  bomb.bouncesLeft--
                  this.bombTravel(bomb, nextTile)
              }
            } else {
              console.log('bomb went off the edge of the map')
            }
        }, 200)
    }

  spawnInitialTrees(){
    let tileIds = this.gameSettings.initialTreeLocations
    for(let i = 0; i < this.tiles.length; i++){
        if(tileIds.indexOf(this.tiles[i].id) >= 0){
            this.tiles[i].treeEnterTile()
        }
    }
  }

  updateHud(player: Player, hudItem: HudItem, value: number){
    if(player.playerNumber === this.user.player.playerNumber){
      this.gameComponent.updateHud(hudItem, value)
    }

  }

  getPlayerByPlayerNumber(playerNumber: number): Player{
    let matchingPlayer: Player
    this.otherPlayers.forEach(player => {
        if(player.playerNumber === playerNumber){
            matchingPlayer = player;
        }
    })
    if(matchingPlayer){
        return matchingPlayer
    }
    console.log('player number not found')
  }

  treeExplode(tile: Tile){
    let explosion: TreeAcid = new TreeAcid();
    let tilesInExplosionRadius: Tile[] = this.getTilesWithXRadius(1, tile)
    this.bombExplodeSound.play()
    for(let i = 0; i < tilesInExplosionRadius.length; i++){
      let playerInTile: Player = tilesInExplosionRadius[i].playerInTile;
      if(playerInTile){
        playerInTile.hitByTreeAcid(explosion)
      }
    }
  }



  bombExplode(bomb: Bomb, tile: Tile){
    tile.bombLeaveTile(null)
    let explosion: Explosion = {
      damage: bomb.explosionDamage,
      causedByPlayer: bomb.playerWhoThrewIt
    }
    let tilesInExplosionRadius: Tile[] = this.getTilesWithXRadius(bomb.explosionSize, tile);
    this.bombExplodeSound.play();
    tile.centerExplosionDisplay();
    for(let i = 0; i < tilesInExplosionRadius.length; i++){
      if(tilesInExplosionRadius[i].treeInTile){
        let fiftyPercentChanceForBombToDrop: Boolean = this.percentageChance(10)
          if(fiftyPercentChanceForBombToDrop){
            let bombs = BombItem.oneBomb;
            let fivePercentChanceForThreeBombs: Boolean = this.percentageChance(1);
            if(fivePercentChanceForThreeBombs)  bombs = BombItem.threeBombs;
            tilesInExplosionRadius[i].bombItemEnterTile(bombs);
          }
          let seventyPercentChanceForEssenceToDrop: Boolean = this.percentageChance(20)
          if(seventyPercentChanceForEssenceToDrop){
            let randomColour: EssenceColour = EssenceColour[EssenceColour[Math.floor(Math.random()*(Object.keys(EssenceColour).length/2))]]
            let randomPositionX: number = Math.floor(Math.random()*50)
            let randomPositionY: number = Math.floor(Math.random()*50)
            tilesInExplosionRadius[i].essenceEnterTile(randomColour, randomPositionX, randomPositionY);
          }
      }
      tilesInExplosionRadius[i].bombExplosion(explosion);
      
    }
    bomb.exploded = true
  }


  
  percentageChance(percentage: number): Boolean{
    return Math.random()*100<percentage?true:false
  }

  moveBoard(focusTile: Tile){
    let numOfTilesToTheLeft = focusTile.column - 1
    let tileSpaceToLeft = numOfTilesToTheLeft*this.gameSettings.tileSize
    this.leftVal = (this.windowWidth/2 - this.gameSettings.tileSize/2 - tileSpaceToLeft)
    let numOfTilesAbove = focusTile.row - 1
    let tileSpaceAbove = numOfTilesAbove*this.gameSettings.tileSize
    this.topVal = (this.windowHeight/2 - this.gameSettings.tileSize/2 - tileSpaceAbove)
    this.gameComponent.gameBoardMove(this.topVal, this.leftVal)
  }

  
  gameComponentReady(gameComponent: GameComponent){
    this.gameComponent = gameComponent
    this.gameComponent.renderGameBoard(this.gameSettings.gameCols, this.gameSettings.gameRows, this.gameSettings.tileSize)
    this.gameComponent.watchForWindowResizeEvent().subscribe(
      windowDimensions => {
        this.windowWidth = windowDimensions.width
        this.windowHeight = windowDimensions.height
        this.moveBoard(this.user.player.playerTile)
      }
    )
    
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }

  tileComponentReady(tileComponentInstance: TileComponent){
    let tile: Tile = new Tile(tileComponentInstance, this)
    this.tiles.push(tile)
    if(this.tiles.length === this.gameSettings.gameCols*this.gameSettings.gameRows){
      this.gameBoardReady()
    }
  }

  /******************************** Get tiles in different ways **************************************************************/

  
  getRandomTile(): Tile{
    return this.tiles[Math.floor(Math.random()*(this.tiles.length - 1))]
  }

  getTileByPlayerStartLocation(playerNumber: number): Tile{
    let describedLocation
    switch(playerNumber){
      case 1: describedLocation = 'top left'; break;
      case 2: describedLocation = 'bottom right'; break;
      case 3: describedLocation = 'top right'; break;
      case 4: describedLocation = 'bottom left'; break;
    }
    return this.getTileByDescribedLocation(describedLocation)
  }

  getTileByDescribedLocation(location: string): Tile{
    let columnAndRow
    switch(location){
      case 'top left': columnAndRow = {row: 3, col: 3}; break;
      case 'bottom right': columnAndRow = {row: this.gameSettings.gameRows-3, col: this.gameSettings.gameCols-3}; break;
      case 'top right': columnAndRow = {row: 3, col: this.gameSettings.gameCols-3}; break;
      case 'bottom left': columnAndRow = {row: this.gameSettings.gameRows-3, col: 3}; break;
    }
    return this.getTileByColumnAndRow(columnAndRow.col, columnAndRow.row)
  }

  getTileByColumnAndRow(column, row): Tile{
    for(let i = 0; this.tiles.length; i++){
      if(this.tiles[i].column === column && this.tiles[i].row === row){
        return this.tiles[i];
      }
    }
  }

  getTileRelativeToAnotherTile(baseTile: Tile, direction: Direction): Tile{
    if(direction === Direction.up){
      if(baseTile.row === 1){
        console.log('no above tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column, baseTile.row - 1)
      }
    }
    if(direction === Direction.down){
      if(baseTile.row === this.gameSettings.gameRows){
        console.log('no below tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column, baseTile.row + 1)
      }
    }
    if(direction === Direction.left){
      if(baseTile.column === 1){
        console.log('no left tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column - 1, baseTile.row)
      }
    }
    if(direction === Direction.right){
      if(baseTile.column === this.gameSettings.gameCols){
        console.log('no right tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column + 1, baseTile.row)
      }
    }
  }

  getTileById(id): Tile{
    for(let i = 0; this.tiles.length; i++){
      if(this.tiles[i].id === id){
        return this.tiles[i];
      }
    }
  }

  getTilesWithXRadius(radius: number, centerTile: Tile): Tile[]{
    let matchingTiles: Tile[] = []
    for(let i = 0; i < this.tiles.length; i++){
      let ok = true;
      if(this.tiles[i].column >= (centerTile.column - radius)){
        if(this.tiles[i].column <= (centerTile.column + radius)){
          if(this.tiles[i].row >= (centerTile.row - radius)){
            if(this.tiles[i].row <= centerTile.row + radius){
              matchingTiles.push(this.tiles[i])
            }
          }
        }
      }
    }

    return matchingTiles
  }

  getDestinationTile(playerTile: Tile, direction: Direction): Tile{
    let settings = this.gameSettings;
    let destinationTile
    if(direction === Direction.up){
        if(playerTile.row === 1)return;
        destinationTile = this.getTileByColumnAndRow(playerTile.column, playerTile.row - 1);
    }
    if(direction === Direction.right){
        if(playerTile.column === settings.gameCols)return;
        destinationTile = this.getTileByColumnAndRow(playerTile.column + 1, playerTile.row);
    }
    if(direction === Direction.down){
        if(playerTile.row === settings.gameRows)return;
        destinationTile = this.getTileByColumnAndRow(playerTile.column, playerTile.row + 1);
    }
    if(direction === Direction.left){
        if(playerTile.column === 1)return;
        destinationTile = this.getTileByColumnAndRow(playerTile.column - 1, playerTile.row);
    }
    if(!destinationTile){
        console.log('destination tile out of bounds')
    }else{
        return destinationTile
    }
  }
}