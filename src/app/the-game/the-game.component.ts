import { Component, OnInit, HostListener, ChangeDetectorRef, Input, ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { WindowDimensions, TileData, ServerGameObject, CreateGameBoardEntityObject } from '../definitions/class-definitions';
import { GameBoardEntity } from '../definitions/interface-definitions';
import { ConnectionService } from '../connection-service/connection-service';
import { GameStartup } from './game-startup';
import { Player } from './player/player.component';
import { User } from './player/user';
import { Tile } from './tile/tile.component';
import { GameHud } from './hud/game-hud.component';
import { ManageServerUpdates } from './manage-sever-updates';
import { AbilitiesService } from './abilities-and-upgrades/abilities-service';


@Component({
  selector: 'the-game',
  templateUrl: 'the-game.component.html'
})
export class TheGame implements OnInit {

  @Input() serverGameObject: ServerGameObject;
  @Input() connectionService: ConnectionService;
  @Input() user: User;

  tileSize = 77;

  manageServerUpdates: ManageServerUpdates;

  mainPlayer: Player;
  players: Player[];
  tiles: Tile[];
  topVal: number;
  leftVal: number;
  gameHud: GameHud;
  gameReady: Boolean = false;
  abilitiesService: AbilitiesService;
  gameStartup: GameStartup;

  @ViewChild('bombTemplate') bombTemplate: TemplateRef<any>;
  @ViewChild('detectorTemplate') detectorTemplate: TemplateRef<any>;
  @ViewChild('treeTemplate') treeTemplate: TemplateRef<any>;
  @ViewChild('lootTemplate') lootTemplate: TemplateRef<any>;
  @ViewChild('playerTemplate') playerTemplate: TemplateRef<any>;
  @ViewChild('tentacleTemplate') tentacleTemplate: TemplateRef<any>;
  
  @ViewChild('gameBoardEntitiesContainer', {read: ViewContainerRef}) gameBoardEntitiesContainer: ViewContainerRef;
  
  

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


  ngOnInit(){
    this.manageServerUpdates = new ManageServerUpdates(this);
    this.abilitiesService = new AbilitiesService(this);
    this.gameStartup = new GameStartup(this)
  }


  gameSetupDone(){
    if (this.players.length === 0 || this.players.forEach(player => player.ready)){
      this.startGame()
    }else{
      this.manageServerUpdates.waitForOtherPlayersReady().subscribe(() => this.startGame())
    }
  }

  startGame(){
    this.gameReady = true;
  }

  
  createGameBoardEntityComponent(createGameBoardEntityObject: CreateGameBoardEntityObject){
    const newEntity = createGameBoardEntityObject.template.createEmbeddedView(null);
    const gameBoardEntityComponent: GameBoardEntity = newEntity['_view'].nodes.find(node => node.componentView).componentView.component;
    
    gameBoardEntityComponent.tile = createGameBoardEntityObject.tile;
    gameBoardEntityComponent.elementRef = newEntity;
    (createGameBoardEntityObject.assets && createGameBoardEntityObject.assets.forEach(
      asset => gameBoardEntityComponent[asset.name] = asset.value
    ));
    
    this.gameBoardEntitiesContainer.insert(newEntity);
    gameBoardEntityComponent.elementRef.detectChanges();
  }
  

  broadcastEventToOtherPlayers(eventName: string, data: any){
    console.log('broadcastEventToOtherPlayers: ', eventName)
    this.connectionService.sendPacket({ eventName: eventName, data: data })
  }

  getPlayerByPlayerNumber(playerNumber: number): Player{
    return this.players.find(player => player.playerNumber === playerNumber);
  }

  onWindowResize(windowDimensions){
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.moveBoard(this.mainPlayer.tile)
  }


  moveBoard(focusTile: Tile){
    const numOfTilesToTheLeft = focusTile.column - 1;
    const tileSpaceToLeft = numOfTilesToTheLeft * this.tileSize;
    const numOfTilesAbove = focusTile.row - 1;
    const tileSpaceAbove = numOfTilesAbove * this.tileSize;
    // const hudAtTheBottom = 100;
    
    this.cdRef.detach();
    this.leftVal = (this.windowWidth / 2 - this.tileSize / 2 - tileSpaceToLeft);
    this.topVal = (this.windowHeight / 2 - this.tileSize / 2 - tileSpaceAbove/* - hudAtTheBottom*/);
    this.cdRef.detectChanges();
  }
  
  getTileByPlayerStartLocation(playerNumber: number): Tile{
    let describedLocation;
    switch (playerNumber){
      case 1: describedLocation = 'top left'; break;
      case 2: describedLocation = 'bottom right'; break;
      case 3: describedLocation = 'top right'; break;
      case 4: describedLocation = 'bottom left'; break;
    }
    return this.getTileByDescribedLocation(describedLocation);
  }

  getTileByDescribedLocation(location: string): Tile{
    let columnAndRow;
    switch (location){
      case 'top left': columnAndRow = {
        row: 3,
        col: 3
      }; break;
      case 'bottom right': columnAndRow = {
        row: this.serverGameObject.gameSettings.gameRows - 3,
        col: this.serverGameObject.gameSettings.gameCols - 3
      }; break;
      case 'top right': columnAndRow = {
        row: 3,
        col: this.serverGameObject.gameSettings.gameCols - 3
      }; break;
      case 'bottom left': columnAndRow = {
        row: this.serverGameObject.gameSettings.gameRows - 3,
        col: 3
      }; break;
    }
    return this.getTileByColumnAndRow(columnAndRow.col, columnAndRow.row);
  }

  getTileByColumnAndRow(column, row): Tile{
  
    return this.tiles.find(tile =>
      tile.column === column &&
      tile.row === row
    );
  }

  getTileRelativeToAnotherTile(baseTile: Tile, direction: string): Tile{
    let params: {col: number; row: number;};
    switch(direction){
      case 'up': (baseTile.row !== 1) &&
        (params = {col: baseTile.column, row: baseTile.row - 1}); break;
      case 'down': (baseTile.row !== this.serverGameObject.gameSettings.gameRows) &&
        (params = {col: baseTile.column, row: baseTile.row + 1});break;
      case 'left': (baseTile.column !== 1) &&
        (params = {col: baseTile.column - 1, row: baseTile.row});break;
      case 'right': (baseTile.row !== this.serverGameObject.gameSettings.gameCols) &&
        (params = {col: baseTile.column + 1, row: baseTile.row});break;
    }
    (!params) && console.log('target tile is out of bounds');
    return (params && this.getTileByColumnAndRow(params.col, params.row));
  }

  getTileById(id): Tile{
    for (let i = 0; this.tiles.length; i++){
      if (this.tiles[i].id === id){
        return this.tiles[i];
      }
    }
  }

  getTilesWithXRadius(radius: number, centerTile: Tile): Tile[]{
    const matchingTiles: Tile[] = [];
    for (let i = 0; i < this.tiles.length; i++){
      if (this.tiles[i].column >= (centerTile.column - radius)){
        if (this.tiles[i].column <= (centerTile.column + radius)){
          if (this.tiles[i].row >= (centerTile.row - radius)){
            if (this.tiles[i].row <= centerTile.row + radius){
              matchingTiles.push(this.tiles[i])
            }
          }
        }
      }
    }
    return matchingTiles
  }

  getDestinationTile(tile: Tile, direction: string): Tile{
    const destinationTile: Tile =
    direction === 'up' && tile.row !== 1 &&
    this.getTileByColumnAndRow(tile.column, tile.row - 1)
    ||
    direction === 'right' && tile.column !== this.serverGameObject.gameSettings.gameCols &&
    this.getTileByColumnAndRow(tile.column + 1, tile.row)
    ||
    direction === 'down' && tile.row !== this.serverGameObject.gameSettings.gameRows &&
    this.getTileByColumnAndRow(tile.column, tile.row + 1)
    ||
    direction === 'left' && tile.column !== 1 &&
    this.getTileByColumnAndRow(tile.column - 1, tile.row);

    if (!destinationTile){
      console.log('destination tile out of bounds')
    }else{
      return destinationTile
    }
  }

}




