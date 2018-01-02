import { Component, Input, OnInit, ViewRef} from '@angular/core';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { TreeAcid, Sounds, CreateGameBoardEntityObject } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component';
import { StaticMethods } from '../../definitions/static-methods'
import { TheGame } from '../the-game.component';
import { Player } from '../player/player.component';

@Component({
  selector: 'tree',
  template: `
    <div
      class="treeModel"
      [style.zIndex]="tile.row"
      [style.left.rem]="leftVal"
      [style.top.rem]="topVal">
      <div
        class="treeGraphic"
        [ngStyle]="{'background-image': 'url(assets/c-tree' + treeModelType + '.png)'}">
      </div>
      <div class="treeAcidAnimation" [ngClass]="{'start': treeAcidAnimation}"></div>
    </div>
  
  `
})

export class Tree implements GameBoardEntity, OnInit{
  @Input() theGame: TheGame;
  tile: Tile;
  topVal: number;
  leftVal: number;
  isVolatile: Boolean;
  treeModelType;
  elementRef: ViewRef;
  treeAcidAnimation = false;
  siphonLoot: any;


  constructor(private sounds: Sounds){}

  ngOnInit(){
    this.setLocation();
  }


  setLocation(){
    this.topVal = (this.tile.row - 1) * 6;
    this.leftVal = (this.tile.column - 1) * 6;
    this.tile.entityEnterTile(this);
    this.elementRef.detectChanges();
  }

  treeExplode(){
    const explosion: TreeAcid = new TreeAcid();
    this.sounds.doAcidBurstSound();
    this.sounds.doAcidBurnSound();
    this.treeAcidAnimate().then(() => {
      const tilesInExplosionRadius: Tile[] = this.theGame.getTilesWithXRadius(1, this.tile);
      for (let i = 0; i < tilesInExplosionRadius.length; i++) {
        const playerInTile: Player = tilesInExplosionRadius[i].playerInTile;
        if (playerInTile) {
          playerInTile.hitByTreeAcid(explosion)
        }
        this.remove()
      }
    });
  };

  treeAcidAnimate(): Promise<any>{
    this.treeAcidAnimation = true;
    this.elementRef.detectChanges();
    let promiseResolve;
    const promise: Promise<any> = new Promise((resolve) => promiseResolve = resolve);

    setTimeout(() => {
      this.treeAcidAnimation = false;
      (!this.elementRef.destroyed) && this.elementRef.detectChanges();
      return promiseResolve();
    }, 1000);

    return promise

  }

  treeIsSiphoned(){
    this.spawnItems('siphon');
    this.remove();
  }

  remove() {
    this.tile.entityRemovedFromTile(this);
    this.elementRef.destroy();
  }

  private spawnItems(spawnType){
    if(!this.siphonLoot){
      return
    }
    
    let bombsItem, essenceColour, essencePosition;
    
    switch(spawnType){
      case 'explosion': {
        bombsItem = this.siphonLoot.explodeResults.bombsItem;
        essenceColour = this.siphonLoot.explodeResults.essenceColour;
        essencePosition = this.siphonLoot.explodeResults.essencePosition;
      }; break;
      case 'siphon': {
        bombsItem = this.siphonLoot.siphonResults.bombsItem;
        essenceColour = this.siphonLoot.siphonResults.essenceColour;
        essencePosition = this.siphonLoot.siphonResults.essencePosition;
      }; break;
    }
    
    if(essenceColour || bombsItem) {
      const createLootObject: CreateGameBoardEntityObject = {
        template: this.theGame.lootTemplate,
        tile: this.tile,
        assets: [
          {name: 'bombs', value: bombsItem},
          {name: 'essenceColour', value: essenceColour},
          {name: 'essencePosition', value: essencePosition}
        ]
      }
      this.theGame.createGameBoardEntityComponent(createLootObject);
    }
  }
}

