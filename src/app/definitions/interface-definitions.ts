import { Direction, Explosion, Ability, TreeAcid, PlayerStats, Loot, AbilitiesHud, PlayerHud} from './class-definitions';
import { FailOrSucceed, Packet } from './class-definitions';
import { Tile } from '../the-game/tile/tile.component';
import { Player } from'../the-game/player/player';
import { TheGame } from '../the-game/the-game.component'
import { Bomb } from '../the-game/game-board-entities/bomb';
import { Tree } from '../the-game/game-board-entities/tree';

export interface PlayerDefinition{
    playerNumber: number;
    facing: Direction;
    playerTile: Tile;
    stats: PlayerStats
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean;
    move(direction: Direction): FailOrSucceed;
    useAbility(ability: Ability): FailOrSucceed;
    hitByExplosion(explosion: Explosion);
    hitByTreeAcid(explosion: TreeAcid);
    setFacingDirection(direction: Direction)
    playerHealthChange(health: number)
    playerDies()
    pickUpLoot(loot: Loot)
}

export interface UserControlledPlayerDefinition{
    name: string;
    queForGame()
    setName(name: string)
    joinExistingGame(gameId: number)
    rejoinGame()
}

export interface TileInterface{
    column: number;
    row: number;
    id: number;
    treeInTile: Tree;
    playerInTile: Player;
    bombInTile: Bomb;
}

export interface GameBoardEntity{
}
