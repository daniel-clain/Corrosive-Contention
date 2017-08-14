import { HostListener } from '@angular/core'
import { PlayerDefinition } from '../../class-definitions/class-definitions'
import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, Bomb, EssenceColour, BombItem, Loot } from '../../type-definitions/type-definitions'
import { Tile } from '../../the-game/tile/tile'
import { ConnectionService } from '../../connection-service/connection-service'
import { PlayerService } from './player-service'


export class Player implements PlayerDefinition{
    playerNumber: number;
    facing: Direction = Direction.down;
    playerTile: Tile;
    stats: PlayerStats = new PlayerStats();
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean = true;


    constructor(playerNumber: number, startLocation: Tile, private playerService: PlayerService){
        this.playerNumber = playerNumber;
        this.startLocation = startLocation;
        this.playerTile = startLocation;
    }
    useAbility(ability: Ability): FailOrSucceed{
       
        return this.playerService.useAbility(ability, this)
    };

    throwBomb(): FailOrSucceed{
        return this.playerService.throwBomb(this)
    }
    siphonTree(): FailOrSucceed{
        let result: FailOrSucceed =  this.playerService.siphonTree(this)
        if(result.FailOrSucceed){
            this.playerService.broadcastEventToOtherPlayers('itemDrop update', { 
                tileId: result.returnObj.targetTile.id, 
                bombs: result.returnObj.bombsItem, 
                essenceObj: result.returnObj.essenceItemObj 
            })
        }else if(result.reason === 'tree was volatile and exploded'){
            this.playerService.broadcastEventToOtherPlayers('treeExplode update', { tileId: result.returnObj.tile.id })
        }
        return result;

    }
    move(direction: Direction): FailOrSucceed{
        this.setFacingDirection(direction)
        let result: FailOrSucceed = this.playerService.move(direction, this);
        if(result.FailOrSucceed){
            this.playerService.broadcastEventToOtherPlayers('player move update', { playerNumber: this.playerNumber, direction: direction })
        }
        return result;
    }
    
    hitByExplosion(explosion: Explosion){
        this.playerService.hitByExplosion(explosion, this)
    };

    hitByTreeAcid(explosion: TreeAcid){
        this.playerService.hitByTreeAcid(explosion, this)
    };

    setFacingDirection(direction: Direction){
        this.playerService.setFacingDirection(direction, this)
        this.playerService.broadcastEventToOtherPlayers('player facingDirection update', { playerNumber: this.playerNumber, direction: direction })
        
    }

    playerHealthChange(health: number){
        this.playerService.playerHealthChange(health, this)
    }

    playerDies(){
        this.playerService.playerDies(this)
    }

    pickUpLoot(loot: Loot){
        this.playerService.pickUpLoot(loot, this)
    }

    moveToStartLocation(){
        this.playerService.moveToStartLocation(this);
    }

}