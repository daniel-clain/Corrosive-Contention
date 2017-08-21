import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TheGame } from '../the-game.component';
import { BombItem, EssenceColour, Direction, Explosion, Loot, TileData } from '../../definitions/class-definitions';
import { TileInterface } from '../../definitions/interface-definitions';
import { Player } from '../player/player'
import { Tree } from '../game-board-entities/tree';
import { Bomb } from '../game-board-entities/bomb';
import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';


@Component({
  selector: 'app-tile',
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

  treeType: number = 0;

  playerFacing: string;
  movingFromVal: string
  movingToVal: string
  bombMovingFromVal: string
  bombMovingToVal: string


  treeExplodeAnimation: Boolean = false;
  centerBombExplodeAnimation: Boolean = false;

  @Input() tileInstance: TileData;
  @Input() theGame: TheGame;


  constructor(private cdRef:ChangeDetectorRef) {}

  ngOnInit(){
    this.id = this.tileInstance.id;
    this.column = this.tileInstance.column;
    this.row = this.tileInstance.row;
    this.theGame.gameStartup.gameTileCreated(this)
  }

  entityLeaveTile(entity: GameBoardEntity){
    this.cdRef.detach();

    if(entity instanceof Player){
      this.movingTo(entity.facing)
      setTimeout(() => {
          this.cdRef.detach();
          this.playerInTile = null;
          this.cdRef.detectChanges();
        }, 400)
    }

    if(entity instanceof Bomb){
      this.bombMovingTo(entity.direction)
      entity.direction
      this.bombInTile = null;
    }

    if(entity instanceof Loot){
      this.lootInTile = null;
    }
    
    this.cdRef.detectChanges();
  }

  

    entityEnterTile(entity: GameBoardEntity){
      this.cdRef.detach();
      
      if(entity instanceof Player){
        this.playerInTile = entity;
          if(this.lootInTile){
              entity.pickUpLoot(this.lootInTile)
              this.lootInTile = null;
          }
          entity.playerTile = this
      }
      
      if(entity instanceof Tree){
        this.treeInTile = entity;
      }

      if(entity instanceof Bomb){
        this.bombInTile = entity;
      }
      
      if(entity instanceof Loot){
        this.lootInTile = entity;
      }
      this.cdRef.detectChanges();
    }

    entityRemovedFromTile(entity: GameBoardEntity){
      this.cdRef.detach();
      if(entity instanceof Player){
        this.playerInTile = null;
      }
      if(entity instanceof Bomb){
        this.bombInTile = null;
      }
      if(entity instanceof Loot){
        this.lootInTile = null;
      }
      this.cdRef.detectChanges();
    }


    playerMovingInToTile(): Boolean {
        if(this.playerInTile || this.treeInTile) {
            return false;
        }
        return true;
    }

    playerMovingOutOfTile(direction: Direction, tile: Tile): Boolean {
        return true;
    }

    checkWhatsInTile(): GameBoardEntity{
      if(this.playerInTile){
            return this.playerInTile
        }
        if(this.treeInTile){
            return this.treeInTile
        }        
        if(this.bombInTile){
            return this.bombInTile
        }        
        if(this.lootInTile){
            return this.lootInTile
        }
    }

  doTreeExplode(){
    this.treeExplodeAnimation = true;
    setTimeout(() => {
      this.treeExplodeAnimation = false;
    },400)
  }

  doCenterBombExplode(){
    this.centerBombExplodeAnimation = true;
    setTimeout(() => {
      this.centerBombExplodeAnimation = false;
    },800)
    this.cdRef.detectChanges();
  }
  
  bombExplosion(explosion: Explosion){
      if(this.treeInTile){
          this.treeInTile.treeExplode()
      }

      if(this.playerInTile){
          this.playerInTile.hitByExplosion(explosion)
      }
  }

  setTreeType(type){
    this.treeType = type;
  }

  movingFrom(direction: Direction){
    this.movingFromVal = Direction[direction]
    setTimeout(() => {
      this.movingFromVal = null;
    },1)
  }

  movingTo(direction: Direction){
    this.movingToVal = Direction[direction]
    setTimeout(() => {
      this.movingToVal = null;
    },400)
  }
  setFacingDirection(direction: Direction){
    this.playerFacing = Direction[direction]
  }

  bombMovingFrom(direction: Direction){
    this.bombMovingFromVal = Direction[direction]
    setTimeout(() => {
      this.bombMovingFromVal = null;
    },1)
  }

  bombMovingTo(direction: Direction){
    this.bombMovingToVal = Direction[direction]
    setTimeout(() => {
      this.bombMovingToVal = null;
    },200)
  }


  lootDropped(loot: Loot){
    console.log('loot dropped')
    this.theGame.broadcastEventToOtherPlayers('loot drop update', {
        tileId: this.id,
        itemsDropped: {loot: loot}
    })
  }

}

class ActiveEssence {
  color: string;
  bgx: number;
  bgy: number;
}


