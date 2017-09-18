import { Player } from '../the-game/player/player'
import { Tile } from '../the-game/tile/tile.component'
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

export class Loot implements GameBoardEntity{
    tile: Tile;
    bombs: string;
    essenceColour: string;
    essencePosition: { x: number, y: number };
    remove: Function;

    constructor(tile: Tile, bombs: string, essenceColour: string, essencePosition: any){
        this.tile = tile;
        this.bombs = bombs;
        this.essenceColour = essenceColour;
        this.essencePosition = essencePosition
    }
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
export class EssenceAbilities{
    blue: EssenceAbility[];
    yellow: EssenceAbility[];
    green: EssenceAbility[];
    purple: EssenceAbility[];
}
export class EssenceAbility{
    thisRequired: number;
    purpleRequired: number;
    name: string;
    doLevelUp: Function;
}

export class PlayerHud{
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

export class ActivatedAbility{
  cooldown: number;
  icon: string;
  useActivatedAbility: void;
  triggerKey: string;
}
