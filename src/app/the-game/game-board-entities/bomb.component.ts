import { Component, OnInit, Input, ViewRef } from '@angular/core';
import { Explosion, Sounds } from '../../definitions/class-definitions';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Direction } from '../../definitions/enum-definitions';

import { Player } from '../player/player.component';
import { Tile } from '../tile/tile.component';
import { TheGame } from '../the-game.component';

@Component({
  selector: 'bomb',
  template: `
    <div class="bombModel"
         [style.zIndex]="tile.row"
         [style.left.rem]="leftVal"
         [style.top.rem]="topVal">
      <div [class]="'bombGraphic'" *ngIf = "!exploded"> </div>
      <div class="bombExplosion" *ngIf = "exploded"></div>
    </div>
  `
})

export class Bomb implements GameBoardEntity, OnInit{
  
  @Input() theGame: TheGame;
  
  player: Player;
  elementRef: ViewRef;
  topVal: number;
  leftVal: number;
  explosionDamage = 2;
  explosionSize: number;
  bounceRange: number;
  bouncesLeft: number;
  direction: Direction;
  exploded = false;
  tile: Tile;

  constructor(private sounds: Sounds){}

  ngOnInit(){
    this.direction = Direction[this.player.status.facing];
    this.explosionSize = this.player.stats.bombExplosionSize;
    this.bounceRange = this.player.stats.bombThrowRange;
    this.bouncesLeft = this.bounceRange;
    this.tile = this.theGame.getTileById(this.player.tile.id);
    this.setLocation();
    setTimeout(() => {
      this.bombTravel();
    }, 1)
  }
  
  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }
  
  private bombTravel(){
    this.bouncesLeft--;
    const nextTile: Tile = this.theGame.getTileRelativeToAnotherTile(this.tile, this.direction);
    nextTile ? (this.tile = nextTile) && this.setLocation() : this.explode();
    
    setTimeout(() => {
      const bombHitSomething: GameBoardEntity = this.tile.checkWhatsInTile();
      bombHitSomething !== this || this.bouncesLeft === 0 ? this.explode() : this.bombTravel();
    }, 300)
  }
  
  private explode(){
    this.exploded = true;
    this.elementRef.detectChanges();
    this.sounds.doBombExplodeSound();
    const explosion: Explosion = {
      damage: this.explosionDamage,
      causedByPlayer: this.player
    };
    const tilesInExplosionRadius: Tile[] = this.theGame.getTilesWithXRadius(this.explosionSize, this.tile);

    for (let i = 0; i < tilesInExplosionRadius.length; i++){
      if (tilesInExplosionRadius[i].treeInTile){
          tilesInExplosionRadius[i].treeInTile.treeExplode();
      }
      if (tilesInExplosionRadius[i].playerInTile){
          tilesInExplosionRadius[i].playerInTile.hitByExplosion(explosion);
      }
    }
    setTimeout(() => this.remove(), 500)
  }
  
  remove(){
    this.tile.entityRemovedFromTile(this);
    this.elementRef.destroy()
  }
}
