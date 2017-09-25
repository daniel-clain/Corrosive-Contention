import { Explosion } from '../../definitions/class-definitions';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Player } from '../player/player.component';
import { Tile } from '../tile/tile.component';
import { TileService } from '../tile-service';

export class Bomb implements GameBoardEntity{
    explosionDamage = 2;
    explosionSize: number;
    bounceRange: number;
    bouncesLeft: number;
    direction: string;
    exploded: Boolean = false;
    playerWhoThrewIt: Player;
    tile: Tile;
    bombExplodeSound = new Audio('../../assets/bomb_explode.mp3');

    constructor(player: Player, private tileService: TileService){
      this.direction = player.facing;
      this.explosionSize = player.stats.bombExplosionSize;
      this.bounceRange = player.stats.bombThrowRange;
      this.bouncesLeft = this.bounceRange;
      this.playerWhoThrewIt = player;
      this.tile = player.tile;
      this.bombExplodeSound.load();
    }

    bombTravel(){
      setTimeout(() => {
        this.bouncesLeft--;
        this.tile.entityLeaveTile(this)
        .then(() => {
            const nextTile: Tile = this.tileService.getTileRelativeToAnotherTile(this.tile, this.direction);
            if (nextTile){
                nextTile.entityEnterTile(this);
                const bombHitSomething: Boolean = this.tileService.checkIfBombHitsAnything(nextTile);
                if (bombHitSomething || this.bouncesLeft === 0 ){
                    this.explode()
                }
                if (!this.exploded && this.bouncesLeft !== 0){
                    setTimeout(() => {
                            this.bombTravel()
                    }, 10)
                }
            } else {
                console.log('bombs next tile was undefined')
            }
        })
      })
    }

    explode(){
        this.exploded = true;
        this.tile.entityRemovedFromTile(this);
        this.bombExplodeSound.play();
        const explosion: Explosion = {
            damage: this.explosionDamage,
            causedByPlayer: this.playerWhoThrewIt
        };
        this.tile.doCenterBombExplode();

        const tilesInExplosionRadius: Tile[] = this.tileService.getTilesWithXRadius(this.explosionSize, this.tile);

        for (let i = 0; i < tilesInExplosionRadius.length; i++){
            if (tilesInExplosionRadius[i].treeInTile){
                tilesInExplosionRadius[i].treeInTile.treeExplode();
            }
            if (tilesInExplosionRadius[i].playerInTile){
                tilesInExplosionRadius[i].playerInTile.hitByExplosion(explosion);
            }
        }

        this.remove()
    }

    remove(){
        this.tile.entityRemovedFromTile(this)
    }
}
