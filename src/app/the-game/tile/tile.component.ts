import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TheGame } from '../the-game.component';
import { Loot, TileData } from '../../definitions/class-definitions';
import { TileInterface } from '../../definitions/interface-definitions';
import { Player } from '../player/player'
import { Tree } from '../game-board-entities/tree';
import { Bomb } from '../game-board-entities/bomb';
import { GameBoardEntity } from '../../definitions/interface-definitions';

@Component({
  selector: 'game-tile',
  templateUrl: 'tile.component.html'
})

export class Tile implements OnInit, TileInterface {

  playerInTile: Player;
  treeInTile: Tree;
  lootInTile: Loot;
  bombInTile: Bomb;

  id: number;
  column: number;
  row: number;

  movingToDirection: string;
  bombMovingToVal: string;

  treeExplodeAnimation: Boolean = false;
  centerBombExplodeAnimation: Boolean = false;

  takingDamage: Boolean;

  @Input() tileInstance: TileData;
  @Input() theGame: TheGame;


  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(){
    this.id = this.tileInstance.id;
    this.column = this.tileInstance.column;
    this.row = this.tileInstance.row;
    this.theGame.gameStartup.gameTileCreated(this)
  }


  entityEnterTile(entity: GameBoardEntity){
    this.cdRef.detach();

    entity.tile = this;

    if (entity instanceof Player){
      this.playerInTile = entity;
        if (this.lootInTile){
            entity.pickUpLoot(this.lootInTile);
            this.lootInTile = null;
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
    this.cdRef.detectChanges();
  }


  entityLeaveTile(entity: GameBoardEntity): Promise<any>{
    return new Promise((resolve) => {
      if (entity instanceof Player){
        this.cdRef.detach();
        this.movingToDirection = this.playerInTile.facing;
        this.cdRef.detectChanges();
        setTimeout(() => {
          this.cdRef.detach();
          this.playerInTile = null;
          this.movingToDirection = null;
          this.cdRef.detectChanges();
          resolve();
          }, 410);
      }

      if (entity instanceof Bomb){
        this.cdRef.detach();
        this.bombMovingToVal = this.bombInTile.direction;
          this.cdRef.detectChanges();
        setTimeout(() => {
          this.cdRef.detach();
          this.bombInTile = null;
          this.bombMovingToVal = null;
          this.cdRef.detectChanges();
          resolve();
          }, 210);
      }

    });
  }

    entityRemovedFromTile(entity: GameBoardEntity){
      this.cdRef.detach();
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
      this.cdRef.detectChanges();
    }


    playerMovingInToTile(): Boolean {
        return (!(this.playerInTile || this.treeInTile));
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
    }

  doTreeExplode(){
    this.cdRef.detach();
    this.treeExplodeAnimation = true;
    this.cdRef.detectChanges();

    setTimeout(() => {
      this.cdRef.detach();
      this.treeExplodeAnimation = false;
      this.cdRef.detectChanges();
    }, 400)
  }

  doCenterBombExplode(){
    this.cdRef.detach();
    this.centerBombExplodeAnimation = true;
    this.cdRef.detectChanges();

    setTimeout(() => {
      this.cdRef.detach();
      this.centerBombExplodeAnimation = false;
      this.cdRef.detectChanges();
    }, 800);
  }

  lootDropped(loot: Loot){
    this.theGame.broadcastEventToOtherPlayers('loot drop update', {
        tileId: this.id,
        itemsDropped: {loot: loot}
    })
  }

  setFacingDirection(){
      this.cdRef.detach();
      this.cdRef.detectChanges();
  }

  playerTakesDamage(){
    this.cdRef.detach();
    this.takingDamage = true;
    this.cdRef.detectChanges();

    setTimeout(() => {
      this.cdRef.detach();
      this.takingDamage = false;
      this.cdRef.detectChanges();
    }, 500)
  }
}

