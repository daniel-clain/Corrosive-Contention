import { TileComponent } from './tile.component';
import { GameService } from '../game-service';
import { Player } from '../player/player';
import { BombItem, EssenceColour, Bomb, Loot, Direction, Explosion } from '../../type-definitions/type-definitions';

export class Tile{
    playerInTile: Player;
    treeInTile: Boolean;
    id: number;
    column: number;
    row: number;
    itemInTile: Boolean;
    essenceInTile: Boolean;
    bombInTile: Boolean;
    essenceColour: EssenceColour;
    numberOfBombs: BombItem;
    volatileTree: Boolean;
    bombExplodeSound = new Audio('../../assets/acid-burn.mp3');



    constructor(public tileComponent: TileComponent, private gameService: GameService) {
        this.id = this.tileComponent.tileInstance.id;
        this.column = this.tileComponent.tileInstance.column;
        this.row = this.tileComponent.tileInstance.row;
    }

    playerEnterTile(player: Player){
        let essenceColor: EssenceColour;
        let numberOfBombs: BombItem;
        this.playerInTile = player;
        this.tileComponent.setPlayerFacingDirection(player.facing);
        this.tileComponent.setPlayerDisplay(true);
        if (this.essenceColour in EssenceColour){
            essenceColor = this.essenceColour;
            this.essenceLeaveTile();
        }
        if (this.numberOfBombs in BombItem){
            numberOfBombs = this.numberOfBombs;
            this.bombItemLeaveTile();
        }
        if (essenceColor in EssenceColour || numberOfBombs in BombItem){
            player.pickUpLoot(<Loot>{essenceColour: essenceColor, bombs: numberOfBombs});
        }
        player.playerTile = this;

    }

    playerRemovedFromTile(){
        this.playerInTile = null;
        this.tileComponent.setPlayerDisplay(false);
    }

    playerLeaveTile(player: Player){
        this.tileComponent.movingTo(player.facing);
        setTimeout(() => {
            this.playerInTile = null;
            this.tileComponent.setPlayerDisplay(false);
        }, 400);

    }

    playerMovingInToTile(): Boolean {
        return (!this.playerInTile && !this.treeInTile);
    }

    treeEnterTile(){
        const chanceToBeVolatile = 20;
        const treeModelType = Math.floor(Math.random() * 2);
        this.volatileTree = (Math.random() * 100 < chanceToBeVolatile);
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
        this.treeLeaveTile();
        this.gameService.treeExplode(this);
    }
    itemDrop(bombs: BombItem, essenceObj: any){
        if (essenceObj && essenceObj.randomColour){
            this.essenceEnterTile(essenceObj.randomColour, essenceObj.randomPositionX, essenceObj.randomPositionY);
        }
        if (bombs){
            this.bombItemEnterTile(bombs);
        }
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
        if (this.bombInTile){
          this.itemInTile = false;
        }
        this.tileComponent.setEssenceDisplay(false, null, null, null);
    }


    bombItemEnterTile(bombs: BombItem){
        this.bombInTile = true;
        this.itemInTile = true;
        this.numberOfBombs = bombs;
        this.tileComponent.setBombItemDisplay(true, bombs);

    }
    bombItemLeaveTile(){
        this.bombInTile = false;
        if (!this.essenceInTile){
          this.itemInTile = false;
        }
        this.tileComponent.setBombItemDisplay(false, null);
    }


    bombEnterTile(bomb: Bomb): string{
        this.bombInTile = true;
        this.tileComponent.setBombDisplay(true);
        if (this.playerInTile){
            console.log('hit player');
            return 'hit';
        }
        if (this.treeInTile){
            console.log('hit tree');
            return 'hit';
        }
        if (bomb.bouncesLeft === 0){
            console.log('out of bounces');
            return 'at the end';
        }
    }

    bombLeaveTile(direction: Direction){
        this.tileComponent.bombMovingTo(direction);
        setTimeout(() => {
            this.tileComponent.setBombDisplay(false);
            this.bombInTile = false;

        }, 200);
    }

    centerExplosionDisplay(){
        this.bombExplodeSound.autoplay = false;
        this.bombExplodeSound.preload = 'auto';
        this.tileComponent.doCenterBombExplode();
    }

    bombExplosion(explosion: Explosion){
        if (this.treeInTile){
            this.treeExplode();
        }

        if (this.playerInTile){
            this.playerInTile.hitByExplosion(explosion);
        }

    }

}
