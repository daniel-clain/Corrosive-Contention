
import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';
import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, PlayerStatsItem, EssenceColour, BombItem, Loot } from '../../definitions/class-definitions'
import { Tile } from '../../the-game/tile/tile.component';
import { StaticMethods } from '../../definitions/static-methods'
import { TileService } from '../tile-service';
import { Player } from '../player/player';


export class Tree implements GameBoardEntity{
    isVolatile: Boolean;
    treeModelType
    

    constructor(private tile: Tile, treeModelType, isVolatile: Boolean, private tileService: TileService){
        this.treeModelType = treeModelType;
        this.isVolatile = isVolatile
    }

    treeExplode(){
        let explosion: TreeAcid = new TreeAcid();
        let tilesInExplosionRadius: Tile[] = this.tileService.getTilesWithXRadius(1, this.tile)
        for(let i = 0; i < tilesInExplosionRadius.length; i++){
            let playerInTile: Player = tilesInExplosionRadius[i].playerInTile;
            if(playerInTile){
                playerInTile.hitByTreeAcid(explosion)
            }
        }
        this.spawnItems('explode')
        this.tile.entityLeaveTile(this)

    };

    treeIsSiphoned(){
        this.spawnItems('siphon')
    }

    private spawnItems(spawnType){
        let bombsItem: BombItem
        let essenceColour: EssenceColour

        let bombItemDrop: Boolean;
        let essenceItemDrop: Boolean;

        let oneBombChance: number;
        let threeBombChance: number;
        let essenceChance: number;
        let essencePosition: {x:number, y:number};


        if(spawnType === 'siphon'){
            oneBombChance = 50
            threeBombChance = 5
            essenceChance = 70
        }
        if(spawnType === 'explode'){
            oneBombChance = 5
            threeBombChance = 1
            essenceChance = 20
        }

        
        bombItemDrop = StaticMethods.percentageChance(oneBombChance)
        if(bombItemDrop){
            bombsItem = BombItem.oneBomb
        } else {
            bombItemDrop = StaticMethods.percentageChance(threeBombChance)
            if(bombItemDrop){
                bombsItem = BombItem.threeBombs
            } else {
                bombsItem = BombItem.noBombs
            }
        }
            
        essenceItemDrop = StaticMethods.percentageChance(essenceChance)
        if(essenceItemDrop){
            let numberOfColours = Object.keys(EssenceColour).length/2
            essenceColour = Math.floor(Math.random()*numberOfColours)
            essencePosition.x = Math.floor(Math.random()*50)
            essencePosition.y = Math.floor(Math.random()*50)
        }
        let loot: Loot = {bombs: bombsItem, essenceColour: essenceColour, essencePosition}

        console.log('siphon tree successful, item drops: '+bombsItem+', ', EssenceColour[essenceColour])
        this.tile.entityEnterTile(loot)
    }
    

}