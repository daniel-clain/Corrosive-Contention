import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { ConnectionService } from '../connection-service/connection-service'
import { GameComponent } from './the-game.component';
import { GameConfig } from './game-config';
import { Player } from './player/player';
import { Packet, Bomb, EssenceColour, BombItem, Loot, WindowDimensions, Direction, ServerGameObject } from '../type-definitions/type-definitions';
import { TileComponent } from './tile/tile.component'
import { Tile } from './tile/tile'



@Injectable()
export class GameService extends GameConfig{


    serverEventsSubject = new Subject();
    gameComponentRegisterSubject = new Subject<GameComponent>();
    tileRegisterSubject = new Subject<TileComponent>();
    explosionSubject = new Subject<any>();
    gameBoardReadySubject = new Subject()
    windowResizeSubject = new Subject<WindowDimensions>()
    bombExplodeSound = new Audio('../../assets/acid-burn.mp3');
    gameComponent
    player: Player
    otherPlayers: Player[]

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        let windowDimensions: WindowDimensions = {
            height: event.target.innerHeight,
            width: event.target.innerWidth
        }
        this.windowResizeSubject.next(windowDimensions)
    }

    constructor(protected connectionService: ConnectionService){
        super()
        this.createPlayerInstance()
        

        this.listenForGameComponentRegister().subscribe(gameComponent => this.gameComponentReady(gameComponent))
         
        this.listenForGameBoardReady().subscribe(() => this.gameBoardReady())
        this.listenForServerEvents().subscribe(serverEvent => this.manageEventsFromServer(serverEvent))

        let serverGameObject: ServerGameObject = this.connectionService.serverGameObject
        
        this.gameCols = serverGameObject.gameSettings.gameCols
        this.gameRows = serverGameObject.gameSettings.gameRows
        this.tileSize = serverGameObject.gameSettings.tileSize
        //this.otherPlayers = 
        this.otherPlayers = []
        let players = serverGameObject.players;

        players.forEach(player => {
            let otherPlayer: Player = new Player(player.playerNumber, this, this.connectionService)
            this.otherPlayers.push(otherPlayer)
        })
    }

    createPlayerInstance(){
        let playerNumber: number = this.connectionService.serverGameObject.yourPlayerNumber
        this.player = new Player(playerNumber, this, this.connectionService)
    }

    gameBoardReady(){
        this.spawnInitialTrees()
        this.player.moveToStartLocation()
    }


    listenForGameBoardReady(): Subject<any>{
        return this.gameBoardReadySubject;
    }

    
    listenForServerEvents(): Subject<any>{
        return this.connectionService.serverEvents;
    }

    sendPacket(packet: Packet){
         this.connectionService.sendPacket(packet);
    }

    registerGameComponent(gameComponent: GameComponent){
        this.gameComponent = gameComponent
        this.gameComponentRegisterSubject.next(gameComponent)
    }
    registerTileComponent(tileComponent: TileComponent){
        this.createTileInstance(tileComponent)
    }

    listenForGameComponentRegister(): Subject<GameComponent>{
        return this.gameComponentRegisterSubject
    }

    watchForBombExplosions(): Subject<Tile>{
        return this.explosionSubject
    }

    bombExplosion(tile: Tile){
        this.explosionSubject.next(tile)
    }


    bombTravel(bomb: Bomb, tile: Tile){
        tile.bombLeaveTile(bomb.direction)
        setTimeout(() => {
            let nextTile: Tile = this.getTileRelativeToAnotherTile(tile, bomb.direction)
            let bombResponse = nextTile.bombEnterTile(bomb, bomb.direction)
            if(bombResponse === 'hit' || bombResponse === 'at the end'){
                this.bombExplode(bomb, nextTile)
            }
            if(!bomb.exploded && bomb.bouncesLeft !== 0){
                bomb.bouncesLeft--
                this.bombTravel(bomb, nextTile)
            }
        }, 200)
    }

  spawnInitialTrees(){
    let tileIds = this.connectionService.serverGameObject.gameSettings.initialTreeLocations
    for(let i = 0; i < this.tiles.length; i++){
        if(tileIds.indexOf(this.tiles[i].id) >= 0){
            this.tiles[i].treeEnterTile()
        }
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

  bombExplode(bomb: Bomb, tile: Tile){
    tile.bombLeaveTile(null)
    let tilesInExplosionRadius = this.getTilesWithXRadius(bomb.explosionSize, tile)
    this.bombExplodeSound.load()
    this.bombExplodeSound.play()
    tile.centerExplosion()
    for(let i = 0; i < tilesInExplosionRadius.length; i++){
      if(tilesInExplosionRadius[i].treeInTile){
        let fiftyPercentChanceForBombToDrop: Boolean = this.percentageChance(10)
          if(fiftyPercentChanceForBombToDrop){
            let bombs = BombItem.oneBomb
            let fivePercentChanceForThreeBombs: Boolean = this.percentageChance(1)
            if(fivePercentChanceForThreeBombs)  bombs = BombItem.threeBombs
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
      if(tilesInExplosionRadius[i].id !== tile.id) tilesInExplosionRadius[i].explosion()

    }    
    bomb.exploded = true
  }

  gameComponentReady(gameComponent: GameComponent){
    this.gameComponent = gameComponent
    this.gameComponent.renderGameBoard(this.gameCols, this.gameRows, this.tileSize)
    this.gameComponent.watchForWindowResizeEvent().subscribe(
      windowDimensions => {
        this.windowWidth = windowDimensions.width
        this.windowHeight = windowDimensions.height
        this.moveBoard(this.player.playerTile)
      }
    )
    
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }

  
  percentageChance(percentage: number): Boolean{
    return Math.random()*100<percentage?true:false
  }

  moveBoard(focusTile: Tile){
    let numOfTilesToTheLeft = focusTile.column - 1
    let tileSpaceToLeft = numOfTilesToTheLeft*this.tileSize
    this.leftVal = (this.windowWidth/2 - this.tileSize/2 - tileSpaceToLeft)
    let numOfTilesAbove = focusTile.row - 1
    let tileSpaceAbove = numOfTilesAbove*this.tileSize
    this.topVal = (this.windowHeight/2 - this.tileSize/2 - tileSpaceAbove)
    this.gameComponent.gameBoardMove(this.topVal, this.leftVal)
  }

  createTileInstance(tileComponentInstance: TileComponent){
    let tile: Tile = new Tile(tileComponentInstance, this)
    this.tiles.push(tile)
    if(this.tiles.length === this.gameCols*this.gameRows){
      this.gameBoardReadySubject.next()
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
      case 'bottom right': columnAndRow = {row: this.gameRows-3, col: this.gameCols-3}; break;
      case 'top right': columnAndRow = {row: 3, col: this.gameCols-3}; break;
      case 'bottom left': columnAndRow = {row: this.gameRows-3, col: 3}; break;
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
      if(baseTile.row === this.gameRows){
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
      if(baseTile.column === this.gameCols){
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



  /************************** Server Events *************************************************************/

  
  manageEventsFromServer(serverEvent){
    let eventsObject = {
      "bomb and essence tile update": serverEvent => this.updateEssenceAndBombsInTile(serverEvent),
      "player move update": serverEvent => this.updatePlayersLocation(serverEvent)
    }
    if(eventsObject[serverEvent.eventName]){
      eventsObject[serverEvent.eventName](serverEvent.data)
    }
  }

  

  updateEssenceAndBombsInTile(data){
    let leavingTile = this.getTileById(data.leavingTileId)
    let enteringTile = this.getTileById(data.enteringTileId)
    let player = this.getPlayerByPlayerNumber(data.playerNumber)
    if(leavingTile){
      leavingTile.playerLeaveTile(player)
    }
    data.targetTile.essenceEnterTile(...data.essenceEnterTileData);
    data.targetTile.bombEnterTile(data.bombs);
  }

  

  updatePlayersLocation(data){
    let leavingTile: Tile = this.getTileById(data.leavingTileId)
    let enteringTile: Tile = this.getTileById(data.enteringTileId)
    let player: Player = this.getPlayerByPlayerNumber(data.playerNumber)
    leavingTile.tileComponent.setPlayerFacingDirection(data.facing);
    enteringTile.tileComponent.setPlayerFacingDirection(data.facing);
    player.facing = data.facing;


    if(player.playerNumber !== this.player.playerNumber){
        
        leavingTile.playerLeaveTile(player)
        setTimeout(() => {
            enteringTile.playerEnterTile(player)
            
        }, 400)

    }
  }

}