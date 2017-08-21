import { Player } from '../the-game/player/player'
import { Tile } from '../the-game/tile/tile.component'
import { TileService } from '../the-game/tile-service';
import { GameBoardEntity } from './interface-definitions';

export class Packet{
    eventName: string;
    data?: any;
}

export class WindowDimensions{
  width: number;
  height: number;
}

export class TileData{
    id: number;
    column: number;
    row: number;
    bgx: number;
    bgy: number;
    size: number;
}


export class ServerGameObject{
    gameId: number;
    yourPlayerNumber: number;
    players: number[];
    gameSettings: GameSettings
}

export interface GameSettings{
    initialTreeLocations: number[];
    tileSize: number;
    gameCols: number;
    gameRows: number;

}





export enum BombItem {
    "noBombs" = null,
    "oneBomb" = 1 ,
    "threeBombs" = 3,
}

export enum EssenceColour {
    "yellow",
    "blue",
    "green",
    "purple",

}

export class Loot implements GameBoardEntity{
    bombs: BombItem
    essenceColour: EssenceColour
    essencePosition: { x: number, y: number }
}

export enum Direction {
    "up",
    "right",
    "down",
    "left",

}



export class Explosion{
    causedByPlayer: Player;
    damage: number = 2;

}
export class TreeAcid{
    damage: number = 1;
}


export class FailOrSucceed {
    FailOrSucceed: Boolean;
    reason?: String;
    returnObj?: any;
}

export enum Ability{
    "Siphon Tree",
    "Throw Bomb",
    "Go Invisible",
    "Plant Vine Trap",
    "Use ForceField",
    "Place Fake Tree",
    "Place Tree Mine",
    "Speed Burst",
    "Use Player Detector",
    "Pickup / Drop Volatile Detector"
}

export class PlayerStats{
    maxHealth: number = 6;
    maxLives: number = 3;
    health: number = this.maxHealth;
    lives: number = this.maxLives;
    blueEssence: number = 0;
    yellowEssence: number = 0;
    greenEssence: number = 0;
    purpleEssence: number = 0
    bombThrowRange: number = 2
    bombExplosionSize: number = 1
    maximumBombs: number = 3
    bombs: number = this.maximumBombs;
}

export enum PlayerStatsItem{
    "health",
    "lives",
    "bombs",
    "blueEssence",
    "yellowEssence",
    "greenEssence",
    "purpleEssence",
    "maxHealth",
    "maxLives",
    "maximumBombs"
}


export class AbilitiesHud{

}

export class PlayerHud{
  lives: number;
  health: number;
  bombs: number;
  blueEssence: number = 0;
  yellowEssence: number = 0;
  greenEssence: number = 0;
  purpleEssence: number = 0;
  maximumBombs: number = 3;
  maxLives: number = 3;
  maxHealth: number = 2;
}


