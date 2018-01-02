import {Injectable, TemplateRef} from '@angular/core'
import {Player} from '../the-game/player/player.component'
import {Tile} from '../the-game/tile/tile.component'
import {Tentacle} from '../the-game/game-board-entities/tentacle.component';
import {GameBoardEntity} from './interface-definitions';
import {Direction} from './enum-definitions';
import {Inject} from '@angular/core';


export class Packet {
  eventName: string;
  connectionId?: number;
  data?: any;
}

export class WindowDimensions {
  width: number;
  height: number;
}

export class KeyboardInput {
  key: string;
  action: string;
}

export class TileData {
  id: number;
  column: number;
  row: number;
  bgx: number;
  bgy: number;
  size: number;
}

export class ServerGameObject {
  gameId: number;
  yourPlayerNumber: number;
  players: [{
    playerNumber: number;
  }];
  gameSettings: GameSettings
}

export interface GameSettings {
  initialTreeObjects: any[];
  tileSize: number;
  gameCols: number;
  gameRows: number;
  volatileDetectorLocations: number[];
}

export class CreateGameBoardEntityObject {
  assets?: [{
    name: string;
    value: any;
  }];
  tile: Tile;
  template: TemplateRef<any>;
}

export class Explosion {
  causedByPlayer: Player;
  damage = 2;
  
}

export class TreeAcid {
  damage = 1;
}


export class PlayerStatus {
  facing: Direction = Direction.down;
  takingDamage: boolean;
  grabbedByTentacle: Tentacle;
  dead: boolean;
}

export class PlayerStats {
  maxHealth = 4;
  maxLives = 3;
  health: number = this.maxHealth;
  lives: number = this.maxLives;
  blueEssence = 0;
  yellowEssence = 0;
  greenEssence = 0;
  purpleEssence = 0;
  bombThrowRange = 3;
  bombExplosionSize = 1;
  maximumBombs = 3;
  bombs = 0;
}

export class PlayerHud {
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


@Injectable()
export class Sounds {
  acidBurnSound = new Audio('../../assets/acid_burn.mp3');
  acidBurstSound = new Audio('../../assets/acid_burst.mp3');
  bombExplodeSound = new Audio('../../assets/bomb_explode.mp3');
  
  constructor() {
    this.acidBurnSound.load()
    this.acidBurstSound.load();
    this.bombExplodeSound.load();
    this.acidBurnSound.volume = 0.2;
    this.acidBurstSound.volume = 0.2;
    this.bombExplodeSound.volume = 0.2;
  }
  
  
  doAcidBurnSound() {
    this.acidBurnSound.play();
  }
  
  doAcidBurstSound() {
    this.acidBurstSound.play();
  }
  
  doBombExplodeSound() {
    this.bombExplodeSound.play();
  }
  
}
