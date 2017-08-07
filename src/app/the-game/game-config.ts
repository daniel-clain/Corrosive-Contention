import { GameService } from './game-service';
import { ConnectionService } from '../connection-service/connection-service'
import { Tile } from './tile/tile';

export class GameConfig{
    tileSize: number;
    gameCols: number;
    gameRows: number;
    topVal: number = 0;
    leftVal: number = 0;
    windowWidth: number;
    windowHeight: number;
    tiles: Tile[] = []
}