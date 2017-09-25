import { Component, OnInit, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { WindowDimensions, TileData, ServerGameObject } from '../definitions/class-definitions';
import { AbilityName } from '../definitions/enum-definitions';
import { ConnectionService } from '../connection-service/connection-service';
import { GameStartup } from './game-startup';
import { Player } from './player/player.component';
import { Tile } from './tile/tile.component';
import { GameHud } from './hud/game-hud.component';
import { ManageServerUpdates } from './manage-sever-updates';
import { TileService } from './tile-service';
import { AbilitiesService } from './abilities-and-upgrades/abilities-service';


@Component({
  selector: 'the-game',
  templateUrl: 'the-game.component.html'
})
export class TheGame implements OnInit {

  @Input() serverGameObject: ServerGameObject;
  @Input() connectionService: ConnectionService;

  manageServerUpdates: ManageServerUpdates;

  mainPlayer: Player;
  players: Player[];
  tiles: Tile[];
  topVal: number;
  leftVal: number;
  gameHud: GameHud;
  gameReady: Boolean = false;
  abilitiesService: AbilitiesService = new AbilitiesService(this);
  tileService: TileService;
  gameStartup: GameStartup;


  tileData: TileData[];
  windowWidth: number = window.innerWidth;
  windowHeight: number = window.innerHeight;

  constructor(private cdRef: ChangeDetectorRef) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const windowDimensions: WindowDimensions = {
      height: event.target.innerHeight,
      width: event.target.innerWidth
    };
    if (this.gameReady){
      this.onWindowResize(windowDimensions)
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDown(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents(e.key, 'down')
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents(e.key, 'up')
  }

  ngOnInit(){
    this.manageServerUpdates = new ManageServerUpdates(this);
    this.gameStartup = new GameStartup(this)
  }


  gameSetupDone(){

    this.broadcastEventToOtherPlayers('player ready', {playerNumber: this.serverGameObject.yourPlayerNumber});
    if (this.players.length === 0 || this.players.forEach(player => player.ready)){
      this.startGame()
    }else{
      this.manageServerUpdates.waitForOtherPlayersReady().subscribe(() => this.startGame())
    }
  }

  startGame(){
    this.gameReady = true;
  }


  broadcastEventToOtherPlayers(eventName: string, data: any){
      this.connectionService.sendPacket({ eventName: eventName, data: data })
  }

  keyboardEvents(key, action){

      if (this.gameReady){
            if (action === 'down'){
              switch (key) {
                case 'ArrowUp': {
                  this.mainPlayer.keydown('up')
                }
                  break;
                case 'ArrowRight': {
                  this.mainPlayer.keydown('right')
                }
                  break;
                case 'ArrowDown': {
                  this.mainPlayer.keydown('down')
                }
                  break;
                case 'ArrowLeft': {
                  this.mainPlayer.keydown('left')
                }
                  break;
                case 'r': this.mainPlayer.useAbility(AbilityName['Siphon Tree']); break;
                case ' ': this.mainPlayer.useAbility(AbilityName['Throw Bomb']); break;
              }
            }
            if (action === 'up'){
              switch (key) {
                case 'ArrowUp': {
                  this.mainPlayer.keyReleased('up')
                }
                  break;
                case 'ArrowRight': {
                  this.mainPlayer.keyReleased('right')
                }
                  break;
                case 'ArrowDown': {
                  this.mainPlayer.keyReleased('down')
                }
                  break;
                case 'ArrowLeft': {
                  this.mainPlayer.keyReleased('left')
                }
                  break;
              }
            }
      }
  }

  getPlayerByPlayerNumber(playerNumber: number): Player{
    let matchingPlayer: Player;
    this.players.forEach(player => {
        if (player.playerNumber === playerNumber){
            matchingPlayer = player;
        }
    });
    if (matchingPlayer){
        return matchingPlayer
    }
    console.log('player number not found')
  }

  onWindowResize(windowDimensions){
        this.windowWidth = windowDimensions.width;
        this.windowHeight = windowDimensions.height;
        this.moveBoard(this.mainPlayer.tile)
    }


  moveBoard(focusTile: Tile){
    const numOfTilesToTheLeft = focusTile.column - 1;
    const tileSpaceToLeft = numOfTilesToTheLeft * this.serverGameObject.gameSettings.tileSize;
    const numOfTilesAbove = focusTile.row - 1;
    const tileSpaceAbove = numOfTilesAbove * this.serverGameObject.gameSettings.tileSize;
    const hudAtTheBottom = 100;

    this.cdRef.detach();
    this.leftVal = (this.windowWidth / 2 - this.serverGameObject.gameSettings.tileSize / 2 - tileSpaceToLeft);
    this.topVal = (this.windowHeight / 2 - this.serverGameObject.gameSettings.tileSize / 2 - tileSpaceAbove - hudAtTheBottom);
    this.cdRef.detectChanges();
  }


}




