import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Input, ElementRef } from '@angular/core';
import { TheGame } from '../the-game.component';
import { TileData } from '../../definitions/class-definitions';
import { TileInterface } from '../../definitions/interface-definitions';
import { Player } from '../player/player.component'
import { Tree } from '../game-board-entities/tree';
import { Bomb } from '../game-board-entities/bomb';
import { Loot } from '../game-board-entities/loot';
import { VolatileDetector } from '../game-board-entities/volatile-detector';

import { GameBoardEntity } from '../../definitions/interface-definitions';

@Component({
  selector: 'game-tile',
  templateUrl: 'tile.component.html'
})

export class Tile implements OnInit, TileInterface, AfterViewInit {

  playerInTile: Player;
  treeInTile: Tree;
  lootInTile: Loot;
  bombInTile: Bomb;
  volatileDetectorInTile: VolatileDetector;

  id: number;
  column: number;
  row: number;

  volatileRunesNumber: string;
  runeX = 0;
  runeY = 0;

  showVolatileRunes = false;
  pauseRuneAnimation = false;

  takingDamage: Boolean;

  @Input() tileInstance: TileData;
  @Input() theGame: TheGame;
  
  


  constructor(private cdRef: ChangeDetectorRef, private elementRef: ElementRef) {}

  ngOnInit(){
    this.id = this.tileInstance.id;
    this.column = this.tileInstance.column;
    this.row = this.tileInstance.row;
  }

  ngAfterViewInit(){
    this.theGame.gameStartup.gameTileCreated(this);
  }

  entityEnterTile(entity: GameBoardEntity){
    if (entity instanceof Player){
      this.playerInTile = entity;
      if (this.lootInTile){
        entity.pickUpLoot(this.lootInTile);
        this.lootInTile.remove();
      }
    }
    if (entity instanceof Tree){
      this.treeInTile = entity;
    }

    if (entity instanceof Bomb){
      this.bombInTile = entity;
    }

    if (entity instanceof Loot){
      this.lootInTile = entity;
    }

    if (entity instanceof VolatileDetector){
      this.volatileDetectorInTile = entity;
    }
  }
  


  entityLeaveTile(entity: GameBoardEntity){
    if (entity instanceof Player){
      this.playerInTile = null;
    }

    if (entity instanceof Bomb){
      this.bombInTile = null;
    }
  }

    entityRemovedFromTile(entity: GameBoardEntity){
      if (entity instanceof Player){
        this.playerInTile = null;
      }
      if (entity instanceof Bomb){
        this.bombInTile = null;
      }
      if (entity instanceof Loot){
        this.lootInTile = null;
      }
      if (entity instanceof Tree){
        this.treeInTile = null;
      }
    }


    playerMovingInToTile(): Boolean {
      return !(this.treeInTile || this.volatileDetectorInTile);
    }
    checkWhatsInTile(): GameBoardEntity{
      if (this.playerInTile){
        return this.playerInTile
      }
      if (this.treeInTile){
        return this.treeInTile
      }
      if (this.bombInTile){
        return this.bombInTile
      }
      if (this.lootInTile){
        return this.lootInTile
      }
      if (this.volatileDetectorInTile){
        return this.volatileDetectorInTile
      }
    }


  lootDropped(loot: Loot){
    this.theGame.broadcastEventToOtherPlayers('loot drop update', {
        tileId: this.id,
        itemsDropped: {loot: loot}
    })
  }

  doShowSurroundingVolatileTrees(val: boolean){
    this.cdRef.detach();
    this.showVolatileRunes = val;
    this.cdRef.detectChanges();
  }

  fireRuneFromTower(centerTowerTile: Tile){
    const centerTowerElem: HTMLScriptElement = centerTowerTile.getElementRef();
    const thisTile: HTMLScriptElement = this.getElementRef();

    this.cdRef.detach();
    this.pauseRuneAnimation = true;
    this.showVolatileRunes = true;
    this.runeX = centerTowerElem.offsetLeft - thisTile.offsetLeft;
    this.runeY = centerTowerElem.offsetTop - thisTile.offsetTop;
    this.cdRef.detectChanges();
    setTimeout(() => {

      this.cdRef.detach();
        this.pauseRuneAnimation = false;
        this.runeX = 0;
        this.runeY = 0;
      this.cdRef.detectChanges();
    }, 5)
  }



  getElementRef(): HTMLScriptElement{
    return this.elementRef.nativeElement;
  }




}

