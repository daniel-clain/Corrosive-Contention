
import { Player } from './player';
import { FailOrSucceed, EssenceAbilities, EssenceAbility } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component'
import { Bomb } from '../game-board-entities/bomb';
import { TheGame } from '../the-game.component';
import { TileService } from '../tile-service';

export class Abilities{
  get essenceAbilities(): EssenceAbilities{
    return this._essenceAbilities;
  }


    private _essenceAbilities: EssenceAbilities = {
        blue: [
            <EssenceAbility>{name: 'Invisibility', thisRequired: 1, purpleRequired: 0,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Speed Increase', thisRequired: 2, purpleRequired: 1,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Player Detector', thisRequired: 3, purpleRequired: 2,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
        ],
        green: [
            <EssenceAbility>{name: 'Bomb Throw Range', thisRequired: 1, purpleRequired: 0,
            doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Tentacle', thisRequired: 2, purpleRequired: 1,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Acid Trap', thisRequired: 3, purpleRequired: 2,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
        ],
        yellow: [
            <EssenceAbility>{name: 'Health Regeneration', thisRequired: 1, purpleRequired: 0,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Force Field', thisRequired: 2, purpleRequired: 1,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
            <EssenceAbility>{name: 'Build Tower Defence', thisRequired: 3, purpleRequired: 2,
                doLevelUp: () => this.theGame.mainPlayer.abilities.throwBombLevelUp()
            },
        ],
        purple: [
            <EssenceAbility>{name: 'Explosion Size', thisRequired: 3, purpleRequired: 3,
                doLevelUp: () => this.theGame.mainPlayer.abilities.bombExplosionSizeLevelUp()
            },
        ]
    };
  constructor(private player: Player, private theGame: TheGame, private tileService: TileService){}

    siphonTree(): FailOrSucceed{
        const targetTile: Tile = this.tileService.getTileRelativeToAnotherTile(this.player.tile, this.player.facing);
        if (targetTile && targetTile.treeInTile){
            if (targetTile.treeInTile.isVolatile){
                targetTile.treeInTile.treeExplode();
                console.log('tree is volatile and exploded');
                this.theGame.broadcastEventToOtherPlayers('treeExplode update', { tileId: targetTile.id });
                return <FailOrSucceed>{ FailOrSucceed: false, reason: 'tree was volatile and exploded', returnObj: {tile: targetTile}}
            } else {
                targetTile.treeInTile.treeIsSiphoned();
                return <FailOrSucceed>{ FailOrSucceed: true}
            }
        } else {
            return <FailOrSucceed>{ FailOrSucceed: false, reason: 'either no tree in tile or tile does not exist', returnObj: {targetTile: targetTile} }
        }
    }

    throwBomb(): FailOrSucceed{
        const bomb: Bomb = new Bomb(this.player, this.tileService);
        bomb.tile.entityEnterTile(bomb);
        bomb.bombTravel();
        this.theGame.broadcastEventToOtherPlayers('player throwBomb update', { playerNumber: this.player.playerNumber });
        return <FailOrSucceed>{ FailOrSucceed: true }
    };

    throwBombLevelUp(){
        this.player.stats.bombThrowRange++;
    };

    bombExplosionSizeLevelUp(){
        this.player.stats.bombExplosionSize++;
    };
}
