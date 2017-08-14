import { Player } from '../the-game/player/player';

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


export class Bomb{
    explosionDamage = 2;
    explosionSize: number;
    bounceRange: number;
    bouncesLeft: number;
    direction: Direction;
    exploded: Boolean = false;
    playerWhoThrewIt: Player;
    constructor(direction: Direction,  explosionSize: number, bounceRange: number, player: Player){
        this.direction = direction;
        this.explosionSize = explosionSize;
        this.bounceRange = bounceRange;
        this.bouncesLeft = this.bounceRange;
        this.playerWhoThrewIt = player;
    }
}


export enum BombItem {
    'noBombs' = null,
    'oneBomb' = 1 ,
    'threeBombs' = 3,
}

export enum EssenceColour {
    'yellow',
    'blue',
    'green',
    'purple',

}

export class Loot{
    bombs: BombItem;
    essenceColour: EssenceColour;
}

export enum Direction {
    'up',
    'right',
    'down',
    'left',

}



export class Explosion{
    causedByPlayer: Player;
    damage = 2;

}
export class TreeAcid{
    damage = 1;
}


export class FailOrSucceed {
    FailOrSucceed: Boolean;
    reason?: String;
    returnObj?: any;
}

export enum Ability{
    'Siphon Tree',
    'Throw Bomb',
    'Go Invisible',
    'Plant Vine Trap',
    'Use ForceField',
    'Place Fake Tree',
    'Place Tree Mine',
    'Speed Burst',
    'Use Player Detector',
    'Pickup / Drop Volatile Detector'
}

export class Hud{
  lives: number;
  health: number;
  bombs: number;
  blueEssence = 0;
  yellowEssence = 0;
  greenEssence = 0;
  purpleEssence = 0;
  maximumBombs = 3;
  maxLives = 3;
  maxHealth = 2;
}

export enum HudItem{
    'health',
    'lives',
    'bombs',
    'blueEssence',
    'yellowEssence',
    'greenEssence',
    'purpleEssence',
    'maxHealth',
    'maxLives',
    'maximumBombs'
}

export class PlayerStats{
    maxHealth = 6;
    maxLives = 3;
    health: number = this.maxHealth;
    lives: number = this.maxLives;
    blueEssence = 0;
    yellowEssence = 0;
    greenEssence = 0;
    purpleEssence = 0;
    bombThrowRange = 2;
    bombExplosionSize = 1;
    maximumBombs = 3;
    bombs: number = this.maximumBombs;
}
