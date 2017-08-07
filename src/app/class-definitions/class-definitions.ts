import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, Loot } from '../type-definitions/type-definitions'
import { Tile } from '../the-game/tile/tile';
import { Player } from'../the-game/player/player';

export interface PlayerDefinition{
    playerNumber: number;
    facing: Direction;
    playerTile: Tile;
    stats: PlayerStats
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean;
    move(tile: Tile): FailOrSucceed;
    useAbility(ability: Ability): FailOrSucceed;
    throwBomb(): FailOrSucceed;
    siphonTree(): FailOrSucceed;
    keyboardEvents(key: string, action: string);
    hitByExplosion(explosion: Explosion);
    hitByTreeAcid(explosion: TreeAcid);
    setFacingDirection()
    playerHealthChange(health: number)
    playerDies()
    pickUpLoot(loot: Loot)
}


export interface UserControlledPlayerDefinition{
    player: Player;
    name: string;
    connectedToHost: Boolean;
    queForGame()
    setName(name: string)
}