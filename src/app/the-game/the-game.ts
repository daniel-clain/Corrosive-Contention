import { Component, HostListener } from '@angular/core';
import { Tile } from './tile/tile';
import { Subject } from 'rxjs/Subject'
import { GameController } from './game-controller';
import { WindowDimensions, TileData, ServerGameObject, Player, EssenceColours, BombItems, Bomb } from '../type-definitions/type-definitions'
import { TileComponent } from './tile/tile.component'
import { GameComponent } from './the-game.component'
import { TileService } from './tile/tile-service'
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';

export class TheGame extends TileService {

  gameCols = 30
  gameRows = 20
  tileSize = 120
  treeInitialPercentageCoverage = 40
  setupObject
  tileDataObject
  boardWidth: number
  renderBoard: Boolean
  topVal: number = 0;
  leftVal: number = 0;
  windowResizeSubject = new Subject()
  mouseEventSubject = new Subject()
  gameBoardReadySubject = new Subject()
  windowWidth
  windowHeight
  gameConfig
  gameComponent: GameComponent
  keyboardObservable: Observable<any>

  player = new Player();
  playerMaxHealth = 2
  playerMaxLives = 3
  serverGameData: ServerGameObject
  gameActive: Boolean = true;
  bombExplodeSound
  backQuoteHeld: Boolean;
  leftHeldDown: Boolean = true
  rightHeldDown: Boolean = true
  upHeldDown: Boolean = true
  downHeldDown: Boolean = true
  moveCycle
  moveCycleContinue:Boolean = false
  ableToMove: Boolean = true



  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let windowDimensions: WindowDimensions = {
      height: event.target.innerHeight,
      width: event.target.innerWidth
    }
    this.windowResizeSubject.next(windowDimensions)
  }

  constructor(public gameController: GameController) {
    super()

  /********** SETUP LISTENERS FOR: GAME COMPONENT, TILE COMPONENT, SERVER EVENTS, KEYBOARD EVENTS AND GAME READY ***********************/

    this.gameController.listenForGameComponentRegister().subscribe(gameComponent => this.gameComponentReady(gameComponent))
    this.gameController.listenForTileRegister().subscribe(tile => this.createTileInstance(tile))
    this.listenForGameBoardReady().subscribe(() => this.gameBoardReady())
    this.gameController.listenForServerEvents().subscribe(serverEvent => this.manageEventsFromServer(serverEvent))
    Observable.fromEvent(document,'keydown').subscribe(event => {this.keyboardFunctions(event['key'], 'down')})
    Observable.fromEvent(document,'keyup').subscribe(event => {this.keyboardFunctions(event['key'], 'up')})

    Observable.fromEvent(document,'keypress').map(e => e['code']).subscribe(code => {if(code === 'Backquote')this.backQuoteHeld = true})


    this.gameController.watchForBombExplosions().subscribe(tile => this.checkIfExplosionHitPlayer(tile))

    this.bombExplodeSound = new Audio('../../assets/acid-burn.mp3');
    this.bombExplodeSound.autoplay = false;
    this.bombExplodeSound.preload = 'auto';


  }



  /********** GAME STARTUP ***********************/

  gameBoardReady(){
    this.initiatePlayerStats('new')
    this.spawnInitialTrees()
  }

  initiatePlayerStats(param: string){
    this.player.lives = this.playerMaxLives
    this.gameComponent.updateLives(this.player.lives)
    this.player.health = this.playerMaxHealth
    this.player.bombs = 3
    this.gameComponent.updateHealth(this.player.health)
    this.putPlayerInStartLocationTile()
    this.gameController.sendPacket({
      eventName: 'player move update',
      data: {
         enteringTileId: this.player.tileId,
         gameId: this.serverGameData.gameId,
         playerNumber: this.serverGameData.yourPlayerNumber
      }
    })

  }

  listenForGameBoardReady(): Subject<any>{
    return this.gameBoardReadySubject;
  }


  createTileInstance(tileComponentInstance: TileComponent){
    this.tiles.push(new Tile(tileComponentInstance, this.gameController))
    if(this.tiles.length === this.gameCols*this.gameRows){
      this.gameBoardReadySubject.next()
    }
  }

  putPlayerInStartLocationTile(){
    let startTile = this.getTileByPlayerStartLocation(this.serverGameData.yourPlayerNumber)
    let loot = startTile.playerEnterTile(this.player.facing);
    if(loot) this.addLootItems(loot);
    this.player.tileId = startTile.id;
    this.moveBoard(this.player.tileId)

  }
  addLootItems(loot){
    if(loot.numberOfBombs){
      this.player.bombs += parseInt(BombItems[loot.numberOfBombs])
      this.gameComponent.updateBombs(this.player.bombs)
    }
    if(loot.essenceColor === 'blue'){
      this.player.blueEssence++
      this.gameComponent.updateBlue(this.player.blueEssence)
    }
    if(loot.essenceColor === 'green'){
      this.player.greenEssence++
      this.gameComponent.updateGreen(this.player.greenEssence)
    }
    if(loot.essenceColor === 'yellow'){
      this.player.yellowEssence++
      this.gameComponent.updateYellow(this.player.yellowEssence)
    }
    if(loot.essenceColor === 'purple'){
      this.player.purpleEssence++
      this.gameComponent.updatePurple(this.player.purpleEssence)
    }
  }

  spawnInitialTrees(){
    let numberOfRandomTrees = this.tiles.length*this.treeInitialPercentageCoverage/100;
    let randomTile: Tile
    for(let i = 0; i < numberOfRandomTrees; i++){
      randomTile = this.getRandomTile()
      while(randomTile.treeInTile || randomTile.playerInTile){
        randomTile = this.getRandomTile()
      }
      randomTile.treeEnterTile()
    }
  }

  gameComponentReady(gameComponent: GameComponent){
    this.gameComponent = gameComponent
    this.gameComponent.renderGameBoard(this.gameCols, this.gameRows, this.tileSize)
    this.gameComponent.watchForWindowResizeEvent().subscribe(
      windowDimensions => {
        this.windowWidth = windowDimensions.width
        this.windowHeight = windowDimensions.height
        this.moveBoard(this.player.tileId)
      }
    )
    this.windowWidth = window.innerWidth
    this.windowHeight = window.innerHeight
  }

  /********** END ***********************/



  /********** PLAYER ACTIONS ***********************/

  keyboardFunctions(key, action){
    let direction: string
    if(this.gameActive){
      if(action==='down'){
        switch (key) {
            case 'ArrowUp': {
            direction = 'up'
          }; break;
          case 'ArrowRight': {
            direction = 'right'
          } ; break;
          case 'ArrowDown': {
            direction = 'down'
          } ; break;
          case 'ArrowLeft': {
            direction = 'left'
          } ; break;
            case 'r': this.playerUseAbility('Siphon Tree'); break;
            case ' ': this.playerUseAbility('Throw Bomb'); break;
        }
        if(direction && this.ableToMove){
          let pass
          if(this.player.facing !== direction){
            this.moveCycleContinue = false
            this.player.facing = direction
            pass=true
          }

          if(this.ableToMove || pass){
            this.playerMove()
          }
        }
      }

      if(action==='up'){
        switch (key) {
          case 'ArrowUp': {
            console.log('up released')
            this.moveCycleContinue = false;
          }; break;
          case 'ArrowRight': {
            console.log('right released')
            this.moveCycleContinue = false;
          } ; break;
          case 'ArrowDown': {
            console.log('down released')
            this.moveCycleContinue = false;
          } ; break;
          case 'ArrowLeft': {
            console.log('left released')
            this.moveCycleContinue = false;
          } ; break;
        }
      }
    }
  }
  playerMove(){
    let playerTile = this.getTileById(this.player.tileId);
    let destinationTile: Tile;
    if(this.player.facing === 'up'){
      if(playerTile.row === 1)return;
      destinationTile = this.getTileByColumnAndRow(playerTile.column, playerTile.row - 1);
    }
    if(this.player.facing === 'right'){
      if(playerTile.column === this.gameCols)return;
      destinationTile = this.getTileByColumnAndRow(playerTile.column + 1, playerTile.row);
    }
    if(this.player.facing === 'down'){
      if(playerTile.row === this.gameRows)return;
      destinationTile = this.getTileByColumnAndRow(playerTile.column, playerTile.row + 1);
    }
    if(this.player.facing === 'left'){
      if(playerTile.column === 1)return;
      destinationTile = this.getTileByColumnAndRow(playerTile.column - 1, playerTile.row);
    }
    let movingOut = playerTile.playerMovingOutOfTile(this.player.facing)
    let movingIn = destinationTile.playerMovingInToTile(this.player.facing)

    if(movingIn){
      destinationTile.tileComponent.setPlayerFacingDirection(this.player.facing);
    }else {
      playerTile.tileComponent.setPlayerFacingDirection(this.player.facing);
    }



    if(movingOut && movingIn){
      clearTimeout(this.moveCycle)

      this.moveCycleContinue = true;
      this.ableToMove = false;
      this.moveCycle = setTimeout(()=>{
        this.ableToMove = true;
        if(this.moveCycleContinue){
          this.playerMove()
        }
      }, 410);

      playerTile.playerLeaveTile();
      console.log('player move')
      let loot = destinationTile.playerEnterTile(this.player.facing);
      if(loot) this.addLootItems(loot);

      this.player.tileId = destinationTile.id;
      this.moveBoard(this.player.tileId)
      this.gameController.sendPacket({
        eventName: 'player move update',
        data: {
          enteringTileId: destinationTile.id,
          leavingTileId: playerTile.id,
          gameId: this.serverGameData.gameId,
          playerNumber: this.serverGameData.yourPlayerNumber
        }
      })
    }else if(!movingIn){
      this.ableToMove=true
    }
  }

  playerUseAbility(abilityName){
    if(abilityName === 'Siphon Tree'){
      this.siphonTree()
    }
    if(abilityName === 'Throw Bomb'){
      if(this.player.bombs >= 1){
        this.throwBomb()
        this.player.bombs--
        this.gameComponent.updateBombs(this.player.bombs)
      }
    }
  }

  siphonTree(){
    console.log('siphon tree')
    let targetTile = this.getTileRelativeToAnotherTile(this.player.tileId, this.player.facing)
    if(targetTile && targetTile.treeInTile){
      if(targetTile.volatileTree){
        console.log('bang!')
        targetTile.treeExplode()
        this.playerHealthChange(-1)

      } else {
        let fiftyPercentChanceForBombToDrop: Boolean = this.percentageChance(50)
        if(fiftyPercentChanceForBombToDrop){
          let bombs = BombItems.oneBomb
          let fivePercentChanceForThreeBombs: Boolean = this.percentageChance(5)
          if(fivePercentChanceForThreeBombs)  bombs = BombItems.threeBombs
          targetTile.bombItemEnterTile(bombs);
        }
        let seventyPercentChanceForEssenceToDrop: Boolean = this.percentageChance(70)
        if(seventyPercentChanceForEssenceToDrop){
          let randomColour: string = EssenceColours[Math.round(Math.random()*(Object.keys(EssenceColours).length/2-1))]
          let randomPositionX: number = Math.round(Math.random()*50)
          let randomPositionY: number = Math.round(Math.random()*50)
          targetTile.essenceEnterTile(randomColour, randomPositionX, randomPositionY);
        }
      }
      targetTile.treeLeaveTile();
    }
  }

  throwBomb(){
    console.log('throwing bomb')
    let targetTile = this.getTileRelativeToAnotherTile(this.player.tileId, this.player.facing)
    let bomb: Bomb = {
      direction: this.player.facing,
      explosionSize:this.player.bombExplosionSize,
      bouncesLeft: this.player.bombThrowRange,
      bounceRange: this.player.bombThrowRange,
      exploded: false
    }
    this.bombTravel(bomb, targetTile, this.player.facing)

  }
  bombTravel(bomb: Bomb, tile: Tile, direction){
    let bombResponse = tile.bombEnterTile(bomb, direction)
    if(bombResponse === 'hit' || bombResponse === 'at the end'){
      bomb = this.bombExplode(bomb, tile)
    }
    setTimeout(() => {
      tile.bombLeaveTile()
      if(!bomb.exploded && bomb.bouncesLeft !== 0){
        bomb.bouncesLeft--
        let nextTile: Tile = this.getTileRelativeToAnotherTile(tile.id, bomb.direction)
        this.bombTravel(bomb, nextTile, direction)
      }
      if(bomb.exploded){
      }
    },210)
  }

  bombExplode(bomb: Bomb, tile: Tile): Bomb{
    let tilesInExplosionRadius = this.getTilesWithXRadius(bomb.explosionSize, tile)
    this.bombExplodeSound.load()
    this.bombExplodeSound.play()
    tile.centerExplosion()
    for(let i = 0; i < tilesInExplosionRadius.length; i++){
      if(tilesInExplosionRadius[i].treeInTile){
        let fiftyPercentChanceForBombToDrop: Boolean = this.percentageChance(10)
          if(fiftyPercentChanceForBombToDrop){
            let bombs = BombItems.oneBomb
            let fivePercentChanceForThreeBombs: Boolean = this.percentageChance(1)
            if(fivePercentChanceForThreeBombs)  bombs = BombItems.threeBombs
            tilesInExplosionRadius[i].bombItemEnterTile(bombs);
          }
          let seventyPercentChanceForEssenceToDrop: Boolean = this.percentageChance(20)
          if(seventyPercentChanceForEssenceToDrop){
            let randomColour: string = EssenceColours[Math.round(Math.random()*(Object.keys(EssenceColours).length/2-1))]
            let randomPositionX: number = Math.round(Math.random()*50)
            let randomPositionY: number = Math.round(Math.random()*50)
            tilesInExplosionRadius[i].essenceEnterTile(randomColour, randomPositionX, randomPositionY);
          }
      }
      if(tilesInExplosionRadius[i].id !== tile.id) tilesInExplosionRadius[i].explosion()

    }
    bomb.exploded = true
    return bomb


  }
  checkIfExplosionHitPlayer(tile: Tile){
    if(tile.id === this.player.tileId){
      this.playerHitByExplosion()
    }
  }
  playerHitByExplosion(){
    this.playerDies()
  }
  playerHealthChange(number){
    this.player.health += number
    this.gameComponent.updateHealth(this.player.health)
    console.log('players health: ' + this.player.health)
    if(this.player.health <= 0) this.playerDies()
  }
  playerDies(){
    let deathTile = this.getTileById(this.player.tileId)
    this.player.lives--
    this.gameComponent.updateLives(this.player.lives)
    console.log('player has died, lives left: ' + this.player.lives)
    if(this.player.lives <= 0 ) this.playerIsOut();
    else {
      this.player.health = this.playerMaxHealth
      this.player.bombs = 3
      this.gameComponent.updateHealth(this.player.health)
      this.putPlayerInStartLocationTile()
      this.gameController.sendPacket({
        eventName: 'player move update',
        data: {
          enteringTileId: this.player.tileId,
          leavingTileId: deathTile.id,
          gameId: this.serverGameData.gameId,
          playerNumber: this.serverGameData.yourPlayerNumber
        }
      })

    }
  }

  playerIsOut(){
    this.gameActive = false;
    console.log('Game Over!')
  }





  /********** END ***********************/



  /********** DIFFERENT WAYS TO GET A TILE ***********************/


  /********** END ***********************/



  /********** GAME HOST SERVER RELATED CODE ***********************/

  setServerGameData(data: ServerGameObject){
    this.serverGameData = data
  }

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
    if(data.leavingTileId){
      this.getTileById(data.leavingTileId).playerLeaveTile()
    }
    data.targetTile.essenceEnterTile(...data.essenceEnterTileData);
    data.targetTile.bombEnterTile(data.bombs);
  }

  updatePlayersLocation(data){
    let enteringTile = this.getTileById(data.enteringTileId)
    enteringTile.playerEnterTile(this.player.facing)
    if(data.leavingTileId){
      this.getTileById(data.leavingTileId).playerLeaveTile()
    }
  }

  /********** END ***********************/



  /********** GLOBAL OPERATIONS CODE ***********************/

  percentageChance(percentage: number): Boolean{
    return Math.random()*100<percentage?true:false
  }

  moveBoard(focusTileId){
    let focusTile = this.getTileById(focusTileId);
    let numOfTilesToTheLeft = focusTile.column - 1
    let tileSpaceToLeft = numOfTilesToTheLeft*this.tileSize
    this.leftVal = this.windowWidth/2 - this.tileSize/2 -tileSpaceToLeft
    let numOfTilesAbove = focusTile.row - 1
    let tileSpaceAbove = numOfTilesAbove*this.tileSize
    this.topVal = this.windowHeight/2 - this.tileSize/2 -tileSpaceAbove

    let delay = setTimeout(()=>{
      this.gameComponent.leftVal = this.leftVal
      this.gameComponent.topVal = this.topVal
    },5)
  }

  listenForMouseWheelEvent(): Subject<any>{
    return this.mouseEventSubject
  }



  /********** END ***********************/


}





