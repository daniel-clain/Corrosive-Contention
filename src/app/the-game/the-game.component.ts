import { Component, OnInit, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { WindowDimensions, TileData, ServerGameObject } from '../definitions/class-definitions';
import { StaticMethods } from '../definitions/static-methods';
import { ConnectionService } from '../connection-service/connection-service';
import { GameStartup } from './game-startup';
import { TileService } from './tile-service';
import { Player } from './player/player';
import { Subject, Observable } from 'rxjs/'
import { Tile } from './tile/tile.component';
import { GameHud } from './hud/game-hud.component';
import { ManageServerUpdates } from './manage-sever-updates';




@Component({
  selector: 'the-game',
  templateUrl: 'the-game.component.html'
})
export class TheGame implements OnInit {

  @Input() serverGameObject: ServerGameObject
  @Input() connectionService: ConnectionService

   tileService: TileService;
   manageServerUpdates: ManageServerUpdates;


  mainPlayer: Player;
  otherPlayers: Player[];
  tiles: Tile[];
  topVal: number;
  leftVal: number;
  showBoard: Boolean;
  gameHud: GameHud;
  gameReady: Boolean = false;
  gameStartup: GameStartup;
  

  tileData: TileData[];
  windowResizeSubject = new Subject()
  windowWidth: number = window.innerWidth;
  windowHeight: number = window.innerHeight;
  
  constructor(private cdRef:ChangeDetectorRef) {
    this.manageServerUpdates = new ManageServerUpdates(this)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const windowDimensions: WindowDimensions = {
      height: event.target.innerHeight,
      width: event.target.innerWidth
    }
    if(this.gameReady){
      this.onWindowResize(windowDimensions)
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(e) {if(e.repeat)return false;this.keyboardEvents(e.key,'down')}

  @HostListener('window:keyup', ['$event'])
  keyUp(e) {if(e.repeat)return false;this.keyboardEvents(e.key,'up')}

  ngOnInit(){
    this.gameStartup = new GameStartup(this)
  }  
  
  
  gameSetupDone(){
    
    this.broadcastEventToOtherPlayers('player ready', {playerNumber: this.serverGameObject.yourPlayerNumber})
    if(this.otherPlayers.length === 0 || this.otherPlayers.forEach(player=>player.ready)){
      this.startGame()
    }else{
      this.manageServerUpdates.waitForOtherPlayersReady().subscribe(()=>this.startGame())
    }
  }

  startGame(){
    this.gameReady = true;
  }

  
  broadcastEventToOtherPlayers(eventName: string, data: any){
      this.connectionService.sendPacket({ eventName: eventName, data: data })
  }
  
  keyboardEvents(key, action){
    
      if(this.gameReady){
            if(action==='down'){
              switch (key) {
                case 'ArrowUp': { this.mainPlayer.keydown('up') } ; break;
                case 'ArrowRight': { this.mainPlayer.keydown('right') } ; break;
                case 'ArrowDown': { this.mainPlayer.keydown('down') } ; break;
                case 'ArrowLeft': { this.mainPlayer.keydown('left') } ; break;
                case 'r': this.mainPlayer.useAbility('Siphon Tree'); break;
                case ' ': this.mainPlayer.useAbility('Throw Bomb'); break;
              }
            }
            if(action==='up'){
              switch (key) {
                case 'ArrowUp': {this.mainPlayer.keyReleased('up')}; break;
                case 'ArrowRight': {this.mainPlayer.keyReleased('right')}; break;
                case 'ArrowDown': {this.mainPlayer.keyReleased('down')}; break;
                case 'ArrowLeft': {this.mainPlayer.keyReleased('left')}; break;
              }
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

  onWindowResize(windowDimensions){
        this.windowWidth = windowDimensions.width
        this.windowHeight = windowDimensions.height
        this.moveBoard(this.mainPlayer.tile)
    }

  
  moveBoard(focusTile: Tile){
    let numOfTilesToTheLeft = focusTile.column - 1
    let tileSpaceToLeft = numOfTilesToTheLeft*this.serverGameObject.gameSettings.tileSize
    let numOfTilesAbove = focusTile.row - 1
    let tileSpaceAbove = numOfTilesAbove*this.serverGameObject.gameSettings.tileSize
    let hudAtTheBottom = 100

    this.cdRef.detach();
    this.leftVal = (this.windowWidth/2 - this.serverGameObject.gameSettings.tileSize/2 - tileSpaceToLeft)
    this.topVal = (this.windowHeight/2 - this.serverGameObject.gameSettings.tileSize/2 - tileSpaceAbove - hudAtTheBottom)
    this.cdRef.detectChanges();
  }


}




