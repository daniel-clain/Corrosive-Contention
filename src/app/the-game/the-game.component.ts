import { Component, OnInit, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { WindowDimensions, TileData, EssenceColour, Direction, Ability, ServerGameObject } from '../definitions/class-definitions';
import { StaticMethods } from '../definitions/static-methods';
import { ConnectionService } from '../connection-service/connection-service';
import { GameStartup } from './game-startup';
import { TileService } from './tile-service';
import { Player } from './player/player';
import { Subject } from 'rxjs/Subject'
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
    let windowDimensions: WindowDimensions = {
      height: event.target.innerHeight, 
      width: event.target.innerWidth
    }
    if(this.gameReady){
      this.onWindowResize(windowDimensions)
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(e) {this.keyboardEvents(e.key,'down')}

  @HostListener('window:keyup', ['$event'])
  keyUp(e) {this.keyboardEvents(e.key,'up')}

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
            let direction: Direction
            if(action==='down'){
                switch (key) {
                  case 'ArrowUp': { this.mainPlayer.move(Direction.up) }; break;
                  case 'ArrowRight': { this.mainPlayer.move(Direction.right) } ; break;
                  case 'ArrowDown': { this.mainPlayer.move(Direction.down) } ; break;
                  case 'ArrowLeft': { this.mainPlayer.move(Direction.left) } ; break;
                  case 'r': this.mainPlayer.useAbility(Ability['Siphon Tree']); break;
                  case ' ': this.mainPlayer.useAbility(Ability['Throw Bomb']); break;
                }
            }
            if(action==='up'){
                switch (key) {
                  case 'ArrowUp': {this.mainPlayer.keyReleased()}; break;
                  case 'ArrowRight': {this.mainPlayer.keyReleased()}; break;
                  case 'ArrowDown': {this.mainPlayer.keyReleased()}; break;
                  case 'ArrowLeft': {this.mainPlayer.keyReleased()}; break;
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
        this.moveBoard(this.mainPlayer.playerTile)
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




