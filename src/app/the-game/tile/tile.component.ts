import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { GameController } from '../game-controller';
import { BombItems, EssenceColours } from '../../type-definitions/type-definitions';



@Component({
  selector: 'app-tile',
  template: `
    <div class='player' 
        [style.visibility] = "playerInTile?'visible':'hidden'"
        [ngClass]="{
          'left': playerFacing==='left', 
          'right': playerFacing==='right', 
          'down': playerFacing==='down', 
          'up': playerFacing==='up',
          'movingRight': movingFrom==='right',
          'movingUp': movingFrom==='up',
          'movingDown': movingFrom==='down',
          'movingLeft': movingFrom==='left'
      }"></div>
    <div class='tree' [style.visibility] = "treeInTile?'visible':'hidden'"
        [ngStyle]="{'background-image': 'url(assets/c-tree' + treeType + '.png)'}"></div>
    <div class = 'essence'
        [ngClass]="essenceColour"
        [style.background-position-y.px]="activeEssence.bgy + 20"
        [style.background-position-x.px]="activeEssence.bgx + 20">{{numberOfBombs}}
    </div>
    <div class = 'bombContainer'
        [ngClass]="numberOfBombItems">
    </div>
    <div class="treeExplosion" *ngIf = "treeExplode"></div>
    
    <div class="centerBombExplode" *ngIf = "centerBombExplode"></div>
    <div class="bombExplosion" *ngIf = "bombExplode"></div>
    <div class="bombInTile"  [style.visibility] = "bombInTile?'visible':'hidden'"
      [ngClass]="{
        'movingRight': bombMovingFrom==='right',
        'movingUp': bombMovingFrom==='up',
        'movingDown': bombMovingFrom==='down',
        'movingLeft': bombMovingFrom==='left'
      }"></div>
  `
})
export class TileComponent implements OnInit {

  playerInTile: Boolean
  treeInTile: Boolean
  essenceInTile: Boolean
  bombInTile: Boolean

  bombItemInTile: Boolean
  numberOfBombItems: string
  essenceColour: string
  treeType: number = 0
  playerSpeed: number = 0.8
  treeExplode: Boolean
  bombExplode: Boolean
  playerFacing: string = 'down'
  movingFrom: string
  bombMovingFrom: string
  centerBombExplode: Boolean
  @Input()tileInstance;
  activeEssence: ActiveEssence = new ActiveEssence();



  constructor(private gameController: GameController, private cdRef:ChangeDetectorRef) {
  }

  ngOnInit(){
    this.gameController.registerTileComponent(this)
  }
  setPlayerDisplay(val: Boolean){
    this.cdRef.detach();
    this.playerInTile = val;
    this.cdRef.detectChanges();
  }
  setTreeDisplay(val: Boolean){
    this.cdRef.detach();
    this.treeInTile = val;
    this.cdRef.detectChanges();
  }


  setEssenceDisplay(val: Boolean, essenceColour: string, x: number, y: number){
    this.cdRef.detach();
    this.essenceInTile = val;
    this.essenceColour = essenceColour
    this.activeEssence.bgx = x
    this.activeEssence.bgy = y

    this.cdRef.detectChanges();
  }


  setBombItemDisplay(val: Boolean, bombs: BombItems){
    this.cdRef.detach();
    this.bombItemInTile = val;
    this.numberOfBombItems = BombItems[bombs]
    this.cdRef.detectChanges();
  }

  doTreeExplode(){
    this.cdRef.detach();
    this.treeExplode = true;
    setTimeout(() => {
      this.cdRef.detach();
      this.treeExplode = false;
      this.cdRef.detectChanges();
    },400)
    this.cdRef.detectChanges();
  }

  setBombDisplay(val: Boolean){
    this.cdRef.detach();
    this.bombInTile = val;
    this.cdRef.detectChanges();
  }

  doBombExplode(){
    this.cdRef.detach();
    this.bombExplode = true;
    setTimeout(() => {
      this.cdRef.detach();
      this.bombExplode = false;
      this.cdRef.detectChanges();
    },800)
    this.cdRef.detectChanges();
  }

  doCenterBombExplode(){
    this.cdRef.detach();
    this.centerBombExplode = true;
    setTimeout(() => {
      this.cdRef.detach();
      this.centerBombExplode = false;
      this.cdRef.detectChanges();
    },800)
    this.cdRef.detectChanges();

  }

  setTreeType(type){
    this.treeType = type;
  }

  setPlayerFacingDirection(direction){
      this.cdRef.detach();
      this.playerFacing = direction;
      this.cdRef.detectChanges();
  }


  moving(direction){
    this.cdRef.detach();
    this.movingFrom = direction
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.cdRef.detach();
      this.movingFrom = null;
      this.cdRef.detectChanges();
    },1)
  }

  bombMoving(direction){
    this.cdRef.detach();
    this.bombMovingFrom = direction
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.cdRef.detach();
      this.bombMovingFrom = null;
      this.cdRef.detectChanges();
    },1)
  }



}

class ActiveEssence {
  color: string;
  bgx: number;
  bgy: number;
}


