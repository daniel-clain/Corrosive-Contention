
import { UserControlledPlayer } from './player/user-controlled-player';
import { ConnectionService } from '../connection-service/connection-service';
import { GameService } from './game-service';

export class TheGame{
    gameService: GameService;
    constructor(user: UserControlledPlayer, connectionService: ConnectionService){
        this.gameService = new GameService(user, connectionService);
    }
}
