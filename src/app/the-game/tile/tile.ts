import { ChangeDetectorRef } from '@angular/core';
import { TileComponent } from '../tile/tile.component'
import { GameService } from '../game-service';
import { Player } from '../player/player';
import { BombItem, EssenceColour, Bomb, Loot, Direction } from '../../type-definitions/type-definitions';

export class Tile{
    playerInTile: Boolean
    treeInTile: Boolean
    id: number
    column: number
    row: number
    itemInTile: Boolean
    essenceInTile: Boolean
    bombItemInTile: Boolean
    bombInTile: Boolean
    essenceColour: EssenceColour
    numberOfBombs: BombItem
    volatileTree: Boolean
    bombExplodeSound = new Audio('../../assets/acid-burn.mp3');
   


    constructor(public tileComponent: TileComponent, private gameService: GameService) { 
        this.id = this.tileComponent.tileInstance.id;
        this.column = this.tileComponent.tileInstance.column;
        this.row = this.tileComponent.tileInstance.row;
    }

    playerEnterTile(player: Player){
        let loot: Loot;
        let essenceColor: EssenceColour
        let numberOfBombs: BombItem
        this.playerInTile = true;
        this.tileComponent.setPlayerDisplay(true);
        if(this.essenceColour in EssenceColour){
            essenceColor = this.essenceColour;
            this.essenceLeaveTile()
        }
        if(this.numberOfBombs in BombItem){
            numberOfBombs = this.numberOfBombs;
            this.bombItemLeaveTile()
        }
        if(essenceColor in EssenceColour || numberOfBombs in BombItem){
            player.pickUpLoot(<Loot>{essenceColour: essenceColor, bombs: numberOfBombs})
        }
        player.playerTile = this

    }

    playerLeaveTile(player: Player){
        this.tileComponent.movingTo(player.facing)
        setTimeout(() => {
            this.playerInTile = false;
            this.tileComponent.setPlayerDisplay(false);

        }, 400)
       
    }


    playerMovingInToTile(direction): Boolean {
        if(this.playerInTile || this.treeInTile) {
            return false;
        }
        return true;
    }

    playerMovingOutOfTile(direction): Boolean {
        return true;
    }


    treeEnterTile(){
        let chanceToBeVolatile = 20
        let treeModelType = Math.floor(Math.random()*2)
        this.volatileTree = (Math.random()*100<chanceToBeVolatile?true:false)
        this.treeInTile = true;
        this.tileComponent.setTreeType(treeModelType);
        this.tileComponent.setTreeDisplay(true);
      
    }

    treeLeaveTile() {
        this.treeInTile = false;
        this.tileComponent.setTreeDisplay(false);

    }

    treeExplode(){
        this.tileComponent.doTreeExplode();
        this.treeLeaveTile()
    }

    essenceEnterTile(color: EssenceColour, x: number, y: number){
        this.essenceInTile = true;
        this.essenceColour = color;
        this.itemInTile = true;
        this.tileComponent.setEssenceDisplay(true, color, x, y);
    }
    
    essenceLeaveTile(){
        this.essenceInTile = false;
        this.essenceColour = null;
        if(this.bombInTile) this.itemInTile = false;
        this.tileComponent.setEssenceDisplay(false, null, null, null)
    }
    
    
    bombItemEnterTile(bombs: BombItem){
        this.bombInTile = true;
        this.itemInTile = true;
        this.numberOfBombs = bombs
        this.tileComponent.setBombItemDisplay(true, bombs)
        
    }
    bombItemLeaveTile(){
        this.bombInTile = false;
        if(!this.essenceInTile) this.itemInTile= false;        
        this.tileComponent.setBombItemDisplay(false, null)
    }

    
    bombEnterTile(bomb: Bomb, direction){
        this.bombInTile = true;
        this.tileComponent.setBombDisplay(true)
        if(this.playerInTile){
            console.log('hit player')
            return 'hit'
        }
        if(this.treeInTile){
            console.log('hit tree')
            this.treeExplode()
            return 'hit'
        }
        if(bomb.bouncesLeft === 0){
            console.log('out of bounces')
            return 'at the end'
        }
    }
    
    bombLeaveTile(direction: Direction){
        this.tileComponent.bombMovingTo(direction)
        setTimeout(() => {
            this.tileComponent.setBombDisplay(false)
            this.bombInTile = false;

        }, 200)
    }

    centerExplosion(){
        if(this.treeInTile){
            this.treeExplode()
        }
        if(this.playerInTile){
            this.gameService.bombExplosion(this)
        }
        
        this.bombExplodeSound.autoplay = false;
        this.bombExplodeSound.preload = 'auto';
        
        this.tileComponent.doCenterBombExplode()

    }

    explosion(){
        if(this.treeInTile){
            this.treeExplode()
        }
        if(this.playerInTile){
            this.gameService.bombExplosion(this)
        }
        
        this.tileComponent.doBombExplode()

    }
    
    
}