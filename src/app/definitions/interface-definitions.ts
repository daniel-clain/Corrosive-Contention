import { Explosion, TreeAcid, PlayerStats, Loot } from './class-definitions';
import { Tile } from '../the-game/tile/tile.component';
import { Player } from '../the-game/player/player';
import { Bomb } from '../the-game/game-board-entities/bomb';
import { Tree } from '../the-game/game-board-entities/tree';

export interface PlayerDefinition{
    playerNumber: number;
    facing: string;
    tile: Tile;
    stats: PlayerStats
    startLocation: Tile;
    playerIsOut: Boolean;
    move(direction: string);
    useAbility(ability: string);
    hitByExplosion(explosion: Explosion);
    hitByTreeAcid(explosion: TreeAcid);
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
    tile: Tile;
    remove: Function;
}

