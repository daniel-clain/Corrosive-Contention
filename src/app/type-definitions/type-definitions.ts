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
    players: Array<ServerGamePlayer>;
    yourPlayerNumber: number;
}
class ServerGamePlayer{
    playerNumber: number;
}

export class Player{
    health: number = 2;
    lives: number = 3;
    tileId: number;
    blueEssence: number = 0;
    yellowEssence: number = 0;
    greenEssence: number = 0;
    purpleEssence: number = 0
    facing: string = 'down';
    bombThrowRange: number = 2
    bombExplosionSize: number = 1
    bombs: number = 3;
}

export class MoveData{
    enteringTileId: number;
    leavingTileId: number;
    gameId: number;
    playerNumber: number;
}

export class Bomb{
    explosionSize: number;
    bounceRange: number;
    bouncesLeft: number;
    direction: string;
    exploded: Boolean;
}


export enum BombItems {
    "noBombs" = null,
    "oneBomb" = 1 ,
    "threeBombs" = 3,
}

export enum EssenceColours {
    "yellow",
    "blue",
    "green",
    "purple",

}