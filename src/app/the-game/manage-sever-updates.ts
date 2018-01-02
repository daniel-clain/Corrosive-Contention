import {CreateGameBoardEntityObject, Packet} from '../definitions/class-definitions';
import {AbilityName, Direction} from '../definitions/enum-definitions';

import {TheGame} from './the-game.component';
import {Player} from './player/player.component';
import {Subject} from 'rxjs/Subject';
import {Tile} from './tile/tile.component';

export class ManageServerUpdates {
  
  otherPlayersReadySubject: Subject<any> = new Subject();
  
  constructor(private theGame: TheGame) {
    this.theGame.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }
  
  
  manageEventsFromServer(serverEvent: Packet) {
    const data = serverEvent.data;
    switch (serverEvent.eventName) {
      case 'user action update':
        this.userActionUpdate(data);
        break;
      case 'player facing update':
        this.playerFacingEvent(data);
        break;
      case 'player throwBomb update':
        this.throwBombEvent(data);
        break;
      case 'player dies update':
        this.playerDiesEvent(data);
        break;
      case 'loot drop update':
        this.lootDropUpdate(data);
        break;
      case 'tree remove update':
        this.treeRemoveUpdate(data);
        break;
      case 'treeExplode update':
        this.treeExplodeUpdate(data);
        break;
      case 'player moveToStartLocation update':
        this.moveToStartLocationUpdate(data);
        break;
      case 'player ready':
        this.playerReadyUpdate(data);
        break;
      case 'player use ability update':
        this.playerUseAbilityEvent(data);
        break;
      default:
        console.error('Server update for event name: (' + serverEvent.eventName + '), could not be found');
    }
  }
  
  
  userActionUpdate(data) {
    /* Temporary way of doing it */
    let direction: Direction;
    let abilityName: string;
    const input = data.input;
    const player = this.theGame.getPlayerByPlayerNumber(data.playerNumber)
    switch (input.key) {
      case 'ArrowUp':
        direction = Direction.up;
        break;
      case 'ArrowRight':
        direction = Direction.right;
        break;
      case 'ArrowDown':
        direction = Direction.down;
        break;
      case 'ArrowLeft':
        direction = Direction.left;
        break;
    
      case 'r':
        abilityName = 'Interact';
        break;
      case ' ':
        abilityName = 'Throw Bomb';
        break;
      case 'q':
        abilityName = 'yellow';
        break;
      case 'w':
        abilityName = 'Go Invisible';
        break;
      case 'e':
        abilityName = 'Spawn Tentacle';
        break;
      case 'Shift':
        abilityName = 'Drag Volatile Detector';
        break;
    
    }
    if (direction) {
      switch(input.action){
        case 'up': player.moveKeyUp(direction); break;
        case 'down': player.moveKeyDown(direction); break;
      }
    }
    if (abilityName && input.action !== 'up') {
      player.useAbility(<AbilityName>abilityName)
    }
  
    /* change to something more decoupled */
  }
  
  waitForOtherPlayersReady(): Subject<any> {
    return this.otherPlayersReadySubject
  }
  
  playerReadyUpdate(data) {
    let allReady = true;
    this.theGame.players.forEach(player => {
      if (player.playerNumber === data.playerNumber) {
        player.ready = true
      }
      if (!player.ready) {
        allReady = false;
      }
    });
    if (allReady) {
      this.otherPlayersReadySubject.next();
    }
  }
  
  moveToStartLocationUpdate(data) {
    console.log('server moveToStartLocation update');
    const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
    // player.moveToStartLocation();
  }
  
  treeExplodeUpdate(data) {
    console.log('server tree explode update');
    const tile = this.theGame.getTileById(data.tileId);
    
    tile.treeInTile.treeExplode();
  }
  
  lootDropUpdate(data) {
    const createLootObject: CreateGameBoardEntityObject = {
      template: this.theGame.lootTemplate,
      tile: this.theGame.getTileById(data.tileId),
      assets: data.assets
    }
    this.theGame.createGameBoardEntityComponent(createLootObject);
  }
  
  treeRemoveUpdate(data) {
    const tile: Tile = this.theGame.getTileById(data.tileId)
    tile.treeInTile.remove();
  }
  
  throwBombEvent(data) {
    const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
    player.abilities['Throw Bomb'].createBomb(player);
  }
  
  
  playerFacingEvent(data) {
    const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
    player.setStatus('facing', data.direction);
  }
  
  playerUseAbilityEvent(data) {
    const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
    const ability: AbilityName = data.ability;
    player.useAbility(ability)
  }
  
  playerDiesEvent(data) {
    const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
    player.playerDies();
  }
}
