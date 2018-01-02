import { Component, Input, OnInit, ViewRef} from '@angular/core';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Sounds, CreateGameBoardEntityObject } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component';
import { StaticMethods } from '../../definitions/static-methods'
import { TheGame } from '../the-game.component';
import { Player } from '../player/player.component';

@Component({
  selector: 'tentacle',
  template: `
    <div
      class="tentacleModel"
      [style.zIndex]="tile.row"
      [style.left.rem]="leftVal"
      [style.top.rem]="topVal">
      <div
        [class]="'tentacleGraphic' +
      ' facing ' + status['facing'] +
      [status['startAttack']?' startAttack':''] +
      [status['holdGrab']?' holdGrab':''] +
      [['releaseGrab']?' releaseGrab':'']">
      </div>
    </div>
  `
})

export class Tentacle implements GameBoardEntity, OnInit{
  @Input() theGame: TheGame;
  tile: Tile;
  topVal: number;
  leftVal: number;
  isVolatile: Boolean;
  tentacleModelType;
  elementRef: ViewRef;
  tentacleAttackAnimation = false;
  holdDuration: number;
  attackOnCoolDown: boolean;
  attackCoolDown: 15;
  status


  constructor(private sounds: Sounds){}
  
  ngOnInit(){
    console.log('tentacle spawned')
    this.tile.entityEnterTileSubject.subscribe(entity => entity instanceof Player && this.tentacleAttack(entity))
    this.setLocation();
  }
  
  
  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }
  
  

  tentacleAttack(player: Player){
    player.grabbedByTentacle(this);
    this.tentacleAttackAnimation = true;
    this.elementRef.detectChanges();
  
    setTimeout(() => {
      player.releasedByTentacle();
      this.startCoolDown()
      this.tentacleAttackAnimation = false;
      this.elementRef.detectChanges();
    }, this.holdDuration * 1000);
    
  };
  
  startCoolDown(){
    this.attackOnCoolDown = true;
    setTimeout(() => this.attackOnCoolDown = false, this.attackCoolDown * 1000)
  }
  
  

  remove(){
    this.tile.entityRemovedFromTile(this);
    this.elementRef.destroy();
  }

  
}
