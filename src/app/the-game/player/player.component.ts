import {Component, OnInit, Input, ViewRef} from '@angular/core';
import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';
import {BombItem, AbilityName, Direction} from '../../definitions/enum-definitions';
import { Explosion, TreeAcid, PlayerStats, PlayerStatus } from '../../definitions/class-definitions';
import { Loot } from '../game-board-entities/loot.component'
import { Tile } from '../tile/tile.component';
import { TheGame } from '../the-game.component';
import { Subject } from 'rxjs/Subject';
import {Tentacle} from '../game-board-entities/tentacle.component';

@Component({
  selector: 'player',
  template: `
  <div class="playerModel"
    [style.zIndex]="tile.row"
    [style.top.rem]="topVal"
    [style.left.rem]="leftVal">
    
    <div
        [class]="
          'playerGraphic' +
          ' facing ' + status['facing'] +
          [status['takingDamage']?' takingDamage':''] +
          [status['dead']?' dead':''] +
          [status['invisible']?' invisible':'']
        " >
    </div>
    
    <div [class] = "'playerInfo' +
    ' | column ' + tile?.column + ' row ' + tile?.row +
    ' | facing ' + status['facing']">
    </div>
  </div>
  `
})


export class Player implements PlayerDefinition, GameBoardEntity, OnInit{
  @Input() theGame: TheGame;

  playerNumber: number;
  facing = 'down';
  tile: Tile;
  elementRef: ViewRef;
  topVal: number;
  leftVal: number;
  stats: PlayerStats = new PlayerStats();
  startLocation: Tile;
  playerIsOut: Boolean;
  status: PlayerStatus = new PlayerStatus();
  ready: Boolean;
  moveLoopActive;
  moveKeyActive: Boolean;
  abilities: any;
  moveDirection: Direction;
  playerMoveSubject: Subject<Tile> = new Subject();
  moveSpeed = 400;

  constructor(){}

  ngOnInit(){
    this.theGame.gameStartup.registerPlayer(this);
    this.startLocation = this.theGame.getTileByPlayerStartLocation(this.playerNumber);
    this.abilities = this.theGame.abilitiesService.defaultAbilitiesList;
    const userPlayerNum = this.theGame.serverGameObject.yourPlayerNumber;
    (this.playerNumber === userPlayerNum) && this.mainPlayerSetup();
    this.moveToStartLocation();
  }

  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.playerMoveSubject.next(this.tile);
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }

  mainPlayerSetup(){
    this.theGame.mainPlayer = this;

    this.playerMoveSubject.subscribe(tile => {
      this.theGame.moveBoard(tile)
    });
    
    this.theGame.gameHud.setupStats(this.stats);
  }


  setStatus(status, val){
    this.status[status] = val;
    this.elementRef.detectChanges();
  }
  
  
  moveKeyUp(direction: Direction){
    (direction === this.moveDirection) && (this.moveKeyActive = false);
  }
  
  moveKeyDown(direction: Direction){
    this.moveKeyActive = true;
    if(!this.status.dead && !this.status.grabbedByTentacle && !this.moveLoopActive) {
      this.moveDirection = direction;
      this.move(direction);
    }
  }
  
  move(direction: Direction) {
    this.moveLoopActive = true;
    const destinationTile: Tile = this.theGame.getDestinationTile(this.tile, direction);
    if (destinationTile && destinationTile.playerMovingInToTile()) {
      this.tile.entityLeaveTile(this);
      this.status.facing = Direction[direction];
      this.tile = destinationTile;
      this.setLocation();
      setTimeout(() => {
        this.tile.entityEnterTile(this);
        this.moveKeyActive ? this.move(this.moveDirection) : this.moveLoopActive = false;
      }, this.moveSpeed)
    } else {
      this.setStatus('facing', direction);
      setTimeout(() => {
        this.moveLoopActive = false;
      }, 1);
      
    }
  }
  
  
  
  
  
  
  
  useAbility(abilityName: AbilityName){
    this.abilities[abilityName].useAbility(this);
  };

  pickUpLoot(loot: Loot){
    if (loot.bombs && this.stats.bombs !== this.stats.maximumBombs){
      this.stats.bombs += BombItem[loot.bombs];
      this.theGame.gameHud.updateStats( 'bombs', this.stats.bombs)
    }
    if (loot.essenceColour === 'blue'){
      this.stats.blueEssence++;
      this.theGame.gameHud.updateStats( 'blueEssence', this.stats.blueEssence)
    }
    if (loot.essenceColour === 'green'){
      this.stats.greenEssence++;
      this.theGame.gameHud.updateStats( 'greenEssence', this.stats.greenEssence)
    }
    if (loot.essenceColour === 'yellow'){
      this.stats.yellowEssence++;
      this.theGame.gameHud.updateStats( 'yellowEssence', this.stats.yellowEssence)
    }
    if (loot.essenceColour === 'purple'){
      this.stats.purpleEssence++;
      this.theGame.gameHud.updateStats( 'purpleEssence', this.stats.purpleEssence)
    }
  }

  moveToStartLocation(){
    const surroundingTiles = this.theGame.getTilesWithXRadius(1, this.startLocation);
    surroundingTiles.forEach(tile => {
      if (tile.treeInTile){
        tile.treeInTile.remove();
      }
    });
    setTimeout(() => {
      this.tile = this.startLocation;
      this.status.facing = Direction.down;
      this.setLocation();
      this.tile.entityEnterTile(this);
    }, 1)
  }

  playerHealthChange(health: number){
    this.stats.health += health;
    if (health < 0){
      this.playerTakesDamage()
    }
    console.log('health change: ', health);
    this.theGame.gameHud.updateStats('health', this.stats.health);
    if (this.stats.health <= 0){
      this.playerDies();
    }
  }

  playerTakesDamage(){
    this.setStatus('takingDamage', true);
    setTimeout(() => {
      this.setStatus('takingDamage', false);
    }, 1000)
  }

  playerDies(){
    this.remove();
    this.setStatus('dead', true);
    this.stats.lives--;
    this.theGame.gameHud.updateStats('lives', this.stats.lives);
    this.moveToStartLocation();
    if (this.stats.lives <= 0 ){
      console.log('Game Over!');
      this.playerIsOut = true;
    }else {
      setTimeout(() => {
        this.stats.health = this.stats.maxHealth;
        // this.stats.bombs = this.stats.maximumBombs;
        this.theGame.gameHud.updateStats('health', this.stats.health);
        this.setStatus('dead', false);
      }, 5000)
    }
  }

  remove(){
    this.tile.entityRemovedFromTile(this);
  }

  hitByExplosion(explosion: Explosion){
    this.playerHealthChange(-explosion.damage);
  };
  hitByTreeAcid(explosion: TreeAcid){
    this.playerHealthChange(-explosion.damage);
  };

  grabbedByTentacle(tentacle: Tentacle){
    this.setStatus('grabbedByTentacle', tentacle)
  }

  releasedByTentacle(){
    this.setStatus('grabbedByTentacle', null)
  }


}
