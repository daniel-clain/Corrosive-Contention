import { Component, OnInit, Input, ViewRef } from '@angular/core';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Sounds } from '../../definitions/class-definitions'

import { NumberNames } from '../../definitions/enum-definitions'

import { Tile } from '../tile/tile.component';
import { Tree } from './tree'
import { TheGame } from '../the-game.component';


@Component({
  selector: 'volatile-detector',
  template: `
    <div class="volatileDetectorModel"
         [style.zIndex]="tile.row"
         [style.left.rem]="leftVal"
         [style.top.rem]="topVal">
      <div class="pulseAnimation" *ngIf = "volatileDetectorPulseAnimation"></div>
      <div class="volatileDetectorGraphic"></div>
    </div>
  `
})
export class VolatileDetector implements GameBoardEntity, OnInit{
  @Input() theGame: TheGame;
  tile: Tile;
  topVal: number;
  leftVal: number;
  elementRef: ViewRef;
  volatileDetectorPulseAnimation = false;
  pulseSignal = new PulseSignal(this);
  constructor(private sounds: Sounds){}
  
  ngOnInit() {
    this.setLocation();
  }
  
  start(){
    this.pulseSignal.activate(this.tile).then(
      () => console.log('Detector turned off')
    )
  }
  
  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }

  getPickedUp(){
  }
  
  remove(){
  }
}


class PulseSignal{
  chargeUpTime = 1;
  duration = 8;
  range = 3;
  tile: Tile;
  surroundingTiles: Tile[];

  constructor(private volatileDetector: VolatileDetector ){}

  activate(tile): Promise<boolean>{
    this.tile = tile;
    this.surroundingTiles = this.volatileDetector.theGame.getTilesWithXRadius(this.range, this.tile);
    return this.pulseChargeUp().then(
      () => this.fireOutRunes().then(
        () => this.channelEnergy().then(
          () => this.turnOff()
        )
      )
    )
  }
  
  pulseChargeUp(): Promise<any>{
    this.doVolativeDetectorPulse(this.duration + this.chargeUpTime);
    return new Promise(
      resolve => setTimeout(() => resolve(), this.chargeUpTime * 1000)
    )
  }
  fireOutRunes(): Promise<any>{
    return new Promise(
      resolve => {
        const markedTiles = this.getListOfMarkedTiles();
        this.fireOutRunesPromise(markedTiles).then(
          () => resolve()
        )
      }
    )

  }
  channelEnergy(): Promise<any>{
    return new Promise(
      resolve => setTimeout(() => resolve(), this.duration * 1000)
    )
  }
  turnOff(): Promise<any>{
    return new Promise(
      resolve => {
        this.surroundingTiles.forEach(affectedTile => {
          affectedTile.doShowSurroundingVolatileTrees(false);
        });
        resolve(true)
      }
    )
  }
  
  
  doVolativeDetectorPulse(duration: number){
    this.volatileDetector.volatileDetectorPulseAnimation = true;
    this.volatileDetector.elementRef.detectChanges();
    
    setTimeout(() => {
      this.volatileDetector.volatileDetectorPulseAnimation = false;
      this.volatileDetector.elementRef.detectChanges();
    }, duration * 1000)
  }

  private getListOfMarkedTiles(): Tile[]{
    const markedTiles: Tile[] = [];
    this.surroundingTiles.forEach(affectedTile => {
      if (!(affectedTile.checkWhatsInTile() instanceof Tree) && !(affectedTile.checkWhatsInTile() instanceof VolatileDetector)) {
        let surroundingVolatileTrees = 0;

        this.volatileDetector.theGame.getTilesWithXRadius(1, affectedTile).forEach((tile: Tile) => {
          const treeInTile = tile.checkWhatsInTile();
          if (treeInTile instanceof Tree && !treeInTile.isVolatile) {
            surroundingVolatileTrees++;
          }
        });
        if (surroundingVolatileTrees){
          affectedTile.volatileRunesNumber = NumberNames[surroundingVolatileTrees];
          markedTiles.push(affectedTile)
        }
      }
    });
    return markedTiles;
  }

  private fireOutRunesPromise(markedTiles): Promise<any>{
    return new Promise(
      resolve => markedTiles.length > 0 ? this.randomlyFireOutRunesRecursive(markedTiles, resolve) : resolve()
    )
  }

  private randomlyFireOutRunesRecursive(markedTiles: Tile[], resolve){
    const randomIndex = Math.floor(Math.random() * markedTiles.length);
    const randomTile: Tile = markedTiles[randomIndex];

    randomTile.fireRuneFromTower(this.tile);
    markedTiles.splice(randomIndex, 1);
    markedTiles.length !== 0 ? setTimeout(() => this.randomlyFireOutRunesRecursive(markedTiles, resolve), 100) : resolve();
  }
}
