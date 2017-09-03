
import { Player } from '../player/player';
import { Explosion, FailOrSucceed, TreeAcid, PlayerStats, Loot } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component'
import { Bomb } from '../game-board-entities/bomb';
import { TheGame } from '../the-game.component';
import { TileService } from '../tile-service';

export class Abilities{

    constructor(private player: Player, private theGame: TheGame, private tileService: TileService){}

    siphonTree(): FailOrSucceed{
        let targetTile: Tile = this.tileService.getTileRelativeToAnotherTile(this.player.tile, this.player.facing)
        if(targetTile && targetTile.treeInTile){
            if(targetTile.treeInTile.isVolatile){
                targetTile.treeInTile.treeExplode()
                console.log('tree is volatile and exploded')
                this.theGame.broadcastEventToOtherPlayers('treeExplode update', { tileId: targetTile.id })
                return <FailOrSucceed>{ FailOrSucceed: false, reason: 'tree was volatile and exploded', returnObj: {tile: targetTile}}
            } else {
                targetTile.treeInTile.treeIsSiphoned()
                return <FailOrSucceed>{ FailOrSucceed: true} 
            }
        } else {
            return <FailOrSucceed>{ FailOrSucceed: false, reason: 'either no tree in tile or tile does not exist', returnObj:{targetTile: targetTile} }
        }
    }

    throwBomb(): FailOrSucceed{
        let bomb: Bomb = new Bomb(this.player, this.tileService)
        this.theGame.broadcastEventToOtherPlayers('player throwBomb update',{ playerNumber: this.player.playerNumber })
        return <FailOrSucceed>{ FailOrSucceed: true }
    };
}