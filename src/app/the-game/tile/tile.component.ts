import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { GameService } from '../game-service';
import { BombItem, EssenceColour, Direction } from '../../type-definitions/type-definitions';
import { RegisterComponentsService } from '../register-components-service';



@Component({
  selector: 'app-tile',
  templateUrl: 'tile.component.html'
})
export class TileComponent implements OnInit {

  playerInTile: Boolean;
  treeInTile: Boolean;
  essenceInTile: Boolean;
  bombInTile: Boolean;

  bombItemInTile: Boolean;
  numberOfBombItems: string;
  treeType = 0;
  treeExplode: Boolean;
  playerFacing = 'down';
  movingFromVal: string;
  movingToVal: string;
  bombMovingFromVal: string;
  bombMovingToVal: string;
  centerBombExplode: Boolean;
  @Input()tileInstance;
  activeEssence: ActiveEssence = new ActiveEssence();



  constructor(private registerComponentsService: RegisterComponentsService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.registerComponentsService.registerTileComponent(this);
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


  setEssenceDisplay(val: Boolean, essenceColour: EssenceColour, x: number, y: number){
    this.cdRef.detach();
    this.essenceInTile = val;
    this.activeEssence = {
      color: EssenceColour[essenceColour],
      bgx: x,
      bgy: y
    };

    this.cdRef.detectChanges();
  }


  setBombItemDisplay(val: Boolean, bombs: BombItem){
    this.cdRef.detach();
    this.bombItemInTile = val;
    this.numberOfBombItems = BombItem[bombs];
    this.cdRef.detectChanges();
  }

  doTreeExplode(){
    this.cdRef.detach();
    this.treeExplode = true;
    setTimeout(() => {
      this.cdRef.detach();
      this.treeExplode = false;
      this.cdRef.detectChanges();
    }, 400);
    this.cdRef.detectChanges();
  }

  setBombDisplay(val: Boolean){
    this.cdRef.detach();
    this.bombInTile = val;
    this.cdRef.detectChanges();
  }

  doCenterBombExplode(){
    this.cdRef.detach();
    this.centerBombExplode = true;
    setTimeout(() => {
      this.cdRef.detach();
      this.centerBombExplode = false;
      this.cdRef.detectChanges();
    }, 800);
    this.cdRef.detectChanges();

  }

  setTreeType(type){
    this.treeType = type;
  }

  setPlayerFacingDirection(direction: Direction){
      this.cdRef.detach();
      this.playerFacing = Direction[direction];
      this.cdRef.detectChanges();
  }

  movingTo(direction: Direction){
    this.cdRef.detach();
    this.playerFacing = Direction[direction];
    this.movingToVal = Direction[direction];
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.cdRef.detach();
      this.movingToVal = null;
      this.cdRef.detectChanges();
    }, 400);
  }

  bombMovingTo(direction: Direction){
    this.cdRef.detach();
    this.bombMovingToVal = Direction[direction];
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.cdRef.detach();
      this.bombMovingToVal = null;
      this.cdRef.detectChanges();
    }, 200);
  }

}

class ActiveEssence {
  color: string;
  bgx: number;
  bgy: number;
}


