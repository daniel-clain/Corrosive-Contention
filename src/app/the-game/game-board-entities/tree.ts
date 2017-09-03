import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';
import { Explosion, FailOrSucceed, TreeAcid, PlayerStats, Loot } from '../../definitions/class-definitions'
import { Tile } from '../../the-game/tile/tile.component';
import { StaticMethods } from '../../definitions/static-methods'
import { TileService } from '../tile-service';
import { Player } from '../player/player';


export class Tree implements GameBoardEntity{
    isVolatile: Boolean;
    treeModelType
    tile: Tile;
    teeExplodeSound = new Audio('../../assets/acid_burn_sound.mp3');
    

    constructor( tile: Tile, treeModelType, isVolatile: Boolean, private tileService: TileService){
        this.tile = tile;
        this.treeModelType = treeModelType;
        this.isVolatile = isVolatile
        this.teeExplodeSound.load()
    }

    treeExplode(){
        let explosion: TreeAcid = new TreeAcid();
        this.teeExplodeSound.play()
        let tilesInExplosionRadius: Tile[] = this.tileService.getTilesWithXRadius(1, this.tile)
        for(let i = 0; i < tilesInExplosionRadius.length; i++){
            let playerInTile: Player = tilesInExplosionRadius[i].playerInTile;
            if(playerInTile){
                playerInTile.hitByTreeAcid(explosion)
            }
        }
        this.remove()

    };

    treeIsSiphoned(){
        this.spawnItems('siphon')
        this.remove()
    }

    remove(){
        this.tile.entityRemovedFromTile(this)
    }

    private spawnItems(spawnType){
        let bombsItem: string
        let essenceColour: string
        let essencePosition: {x:number, y:number};

        let bombItemDrop: Boolean;
        let essenceItemDrop: Boolean;

        let oneBombChance: number;
        let threeBombChance: number;
        let essenceChance: number;


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
            bombsItem = 'oneBomb'
        } else {
            bombItemDrop = StaticMethods.percentageChance(threeBombChance)
            if(bombItemDrop){
                bombsItem = 'threeBombs'
            } else {
                bombsItem = 'noBombs'
            }
        }
            
        essenceItemDrop = StaticMethods.percentageChance(essenceChance)
        if(essenceItemDrop){
            let numberOfColours = 4
            let randomNum = Math.floor(Math.random()*numberOfColours)
            let colors = ['blue','green','yellow','purple']
            essenceColour = colors[randomNum]
            let x = Math.floor(Math.random()*50)
            let y = Math.floor(Math.random()*50)
            essencePosition = {x:x, y:y}
        }
        let loot: Loot = new Loot(this.tile, bombsItem, essenceColour, essencePosition)
        this.tile.entityEnterTile(loot)
        
    }
    

}