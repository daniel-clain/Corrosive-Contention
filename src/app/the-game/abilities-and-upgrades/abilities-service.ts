import { FailOrSucceed, EssenceAbilities, EssenceAbility, ActivatedAbility } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component'
import { Bomb } from '../game-board-entities/bomb';
import { TheGame } from '../the-game.component';

export class Abilities{

  activateAbilities: ActivatedAbility[];
  abilities: Ability[];
  get essenceAbilities(){
    return this._essenceAbilities;
  }


    };
  constructor(private theGame: TheGame){}

    siphonTree(): FailOrSucceed{
        const targetTile: Tile = this.theGame.tileService.getTileRelativeToAnotherTile(this.theGame.mainPlayer.tile, this.theGame.mainPlayer.facing);
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
        const bomb: Bomb = new Bomb(this.theGame.mainPlayer, this.theGame.tileService);
        bomb.tile.entityEnterTile(bomb);
        bomb.bombTravel();
        this.theGame.broadcastEventToOtherPlayers('player throwBomb update', { playerNumber: this.theGame.mainPlayer.playerNumber });
        return <FailOrSucceed>{ FailOrSucceed: true }
    };

    throwBombLevelUp(){
        this.theGame.mainPlayer.stats.bombThrowRange++;
    };

    bombExplosionSizeLevelUp(){
        this.theGame.mainPlayer.stats.bombExplosionSize++;
    };

    invisibilityLevelUp(){
      console.log('invisibilityLevelUp()')
    }

    goInvisible(){
      console.log('goInvisible()')
    }
    getActivatedAbilities(): ActivatedAbility[]{
      if(this.activatedAbilities){
        return this.activateAbilities;
      } else {
        this.activateAbilities = [];
        this.abilitiesList.forEach((ability: Ability) => {
        if (ability instanceof ActivatedAbility){
          this.activateAbilities.push(ability)
        }
      })
    }
}
