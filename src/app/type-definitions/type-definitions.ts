import { Player } from '../the-game/player/player'

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

export interface GameSettings{
    initialTreeLocations: number[];
    tileSize: number;
    gameCols: number;
    gameRows: number;

}

export interface ServerGameObject{
    gameId: number;
    players: Array<ServerGamePlayer>;
    yourPlayerNumber: number;
    gameSettings: GameSettings;
}
interface ServerGamePlayer{
    playerNumber: number;
}


export class Data{

}

export class Bomb{
    explosionDamage: number = 2;
    explosionSize: number;
    bounceRange: number;
    bouncesLeft: number;
    direction: Direction;
    exploded: Boolean = false;
    playerWhoThrewIt: Player
    constructor(direction: Direction,  explosionSize: number, bounceRange: number, player: Player){
        this.direction = direction;
        this.explosionSize = explosionSize;
        this.bounceRange = bounceRange;
        this.bouncesLeft = this.bounceRange;
        this.playerWhoThrewIt = player;
    }
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

export class Loot{
    bombs: BombItem
    essenceColour: EssenceColour
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

export class Hud{
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

export enum HudItem{
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