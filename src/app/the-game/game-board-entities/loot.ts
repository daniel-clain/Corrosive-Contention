import { Component, OnInit, Input, ViewRef } from '@angular/core';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Tile } from '../tile/tile.component';
import { TheGame } from '../the-game.component';

@Component({
  selector: 'loot',
  template: `
    <div class="lootModel"
     [style.left.rem]="leftVal"
     [style.top.rem]="topVal"
     [style.zIndex]="39"
    >
      <div class="essenceLoot"
         *ngIf = "essenceColour"
         [ngClass]="essenceColour"
         [style.background-position-y.px]="essencePosition.y"
         [style.background-position-x.px]="essencePosition.x">
      </div>
      <div class = 'bombLoot'
           *ngIf = "bombs"
           [ngClass]="bombs">
      </div>
    </div>
  `
})

export class Loot implements GameBoardEntity, OnInit{
  @Input() theGame: TheGame;
  tile: Tile;
  elementRef: ViewRef;
  topVal: number;
  leftVal: number;
  bombs: string;
  essenceColour: string;
  essencePosition: { x: number, y: number };
  
  constructor(){}
  
  ngOnInit(){
    this.setLocation()
  }
  
  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }
  remove(){
    this.tile.entityRemovedFromTile(this);
    this.elementRef.destroy();
  }
}
