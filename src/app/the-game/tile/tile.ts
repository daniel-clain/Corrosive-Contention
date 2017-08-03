import { ChangeDetectorRef } from '@angular/core';
import { TileComponent } from '../tile/tile.component'
import { GameController } from '../game-controller';
import { BombItems, EssenceColours, Bomb } from '../../type-definitions/type-definitions';

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
    essenceColour: string
    numberOfBombs: string
    volatileTree: Boolean
   


    constructor(public tileComponent: TileComponent, private gameController: GameController) { 
        this.id = this.tileComponent.tileInstance.id;
        this.column = this.tileComponent.tileInstance.column;
        this.row = this.tileComponent.tileInstance.row;
    }

    playerEnterTile(direction){
        this.tileComponent.moving(direction)
        let essenceColor: string
        let numberOfBombs: string
        this.playerInTile = true;
        this.tileComponent.setPlayerDisplay(true);
        if(this.essenceColour){
            essenceColor = this.essenceColour;
            this.essenceLeaveTile()
        }
        if(this.numberOfBombs){
            numberOfBombs = this.numberOfBombs;
            this.bombItemLeaveTile()
        }
        return {essenceColor, numberOfBombs}
        
    }

    playerLeaveTile(){
        this.playerInTile = false;
        this.tileComponent.setPlayerDisplay(false);
       
    }


    playerMovingInToTile(direction): Boolean {
        if(this.playerInTile || this.treeInTile) {
            return false;
        }
        return true;
    }

    playerMovingOutOfTile(direction): Boolean {
        /*switch(direction){
            case 'ArrowUp': this.tileComponent.movingUp(); break;
            case 'ArrowRight': this.tileComponent.movingRight(); break;
            case 'ArrowLeft': this.tileComponent.movingLeft(); break;
            case 'ArrowDown': this.tileComponent.movingDown(); break;
        }
        setTimeout(()=>{
            this.tileComponent.stopMoving()
        },1000)*/
        return true;
    }


    treeEnterTile(){
        let chanceToBeVolatile = 40
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

    essenceEnterTile(color: string, x: number, y: number){
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
    
    
    bombItemEnterTile(bombs: BombItems){
        this.bombInTile = true;
        this.itemInTile = true;
        this.numberOfBombs = BombItems[bombs]
        this.tileComponent.setBombItemDisplay(true, bombs)
        
    }
    bombItemLeaveTile(){
        this.bombInTile = false;
        if(!this.essenceInTile) this.itemInTile= false;        
        this.tileComponent.setBombItemDisplay(false, null)
    }

    
    bombEnterTile(bomb: Bomb, direction){
        this.bombInTile = true;        
        this.tileComponent.bombMoving(direction)
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

    centerExplosion(){
        if(this.treeInTile){
            this.treeExplode()
        }
        if(this.playerInTile){
            this.gameController.bombExplosion(this)
        }
        
        this.tileComponent.doCenterBombExplode()

    }

    explosion(){
        if(this.treeInTile){
            this.treeExplode()
        }
        if(this.playerInTile){
            this.gameController.bombExplosion(this)
        }
        
        this.tileComponent.doBombExplode()

    }
    
    bombLeaveTile(){
        this.tileComponent.setBombDisplay(false)
        this.bombInTile = false;
    }
}