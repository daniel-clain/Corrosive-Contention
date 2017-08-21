import { Direction, Explosion } from '../../definitions/class-definitions';
import { GameBoardEntity } from '../../definitions/interface-definitions';
import { Player } from '../player/player';
import { Tile } from '../tile/tile.component';
import { TileService } from '../tile-service';

export class Bomb implements GameBoardEntity{
    explosionDamage: number = 2;
    explosionSize: number;
    bounceRange: number;
    bouncesLeft: number;
    direction: Direction;
    exploded: Boolean = false;
    playerWhoThrewIt: Player
    tile: Tile;
    bombExplodeSound = new Audio('../../assets/acid-burn.mp3');

    constructor(player: Player, private tileService: TileService){
        this.direction = player.facing;
        this.explosionSize = player.stats.bombExplosionSize;
        this.bounceRange = player.stats.bombThrowRange;
        this.bouncesLeft = this.bounceRange;
        this.playerWhoThrewIt = player;
        this.tile = player.playerTile;
        this.bombExplodeSound.load()
        this.bombTravel(this.tile)
    }



    bombTravel(tile: Tile){
        this.bouncesLeft--
        this.tile.entityLeaveTile(this)
        setTimeout(() => {
            let nextTile: Tile = this.tileService.getTileRelativeToAnotherTile(this.tile, this.direction)
            if(nextTile){
              let bombHitSomething: Boolean = this.tileService.checkIfBombHitsAnything(this.tile)
              if(bombHitSomething || this.bouncesLeft === 0 ){
                  this.explode()
              }
              if(!this.exploded && this.bouncesLeft !== 0){
                  this.tile.entityEnterTile(this)
                  this.bombTravel(nextTile)
              }
            } else {
              console.log('bombs next tile was undefined')
            }
        }, 200)
    }
    
    explode(){
        this.tile.entityRemovedFromTile(this)
        this.bombExplodeSound.play()
        let explosion: Explosion = {
            damage: this.explosionDamage,
            causedByPlayer: this.playerWhoThrewIt
        }
        this.tile.doCenterBombExplode();

        let tilesInExplosionRadius: Tile[] = this.tileService.getTilesWithXRadius(this.explosionSize, this.tile);
        
        for(let i = 0; i < tilesInExplosionRadius.length; i++){
        if(tilesInExplosionRadius[i].treeInTile){
            tilesInExplosionRadius[i].treeInTile.treeExplode();
            
        }
        this.tile.bombExplosion(explosion);
        
        }
        this.exploded = true
    }
}