import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { ConnectionService } from '../connection-service/connection-service'
import { GameComponent } from './the-game.component';
import { Packet } from '../type-definitions/type-definitions';
import { TileComponent } from './tile/tile.component'
import { Tile } from './tile/tile'



@Injectable()
export class GameController{


    serverEventsSubject = new Subject();
    gameComponentRegisterSubject = new Subject<GameComponent>();
    tileRegisterSubject = new Subject<TileComponent>();
    explosionSubject = new Subject<any>();
    connectionService: ConnectionService
    

    constructor(){
        this.connectionService = new ConnectionService;
    }

    
    listenForServerEvents(): Subject<any>{
        return this.connectionService.serverEvents;
    }

    sendPacket(packet: Packet){
         this.connectionService.sendPacket(packet);
    }

    registerGameComponent(gameComponent: GameComponent){
        this.gameComponentRegisterSubject.next(gameComponent)
    }
    registerTileComponent(tileComponent: TileComponent){
        this.tileRegisterSubject.next(tileComponent)
    }

    listenForGameComponentRegister(): Subject<GameComponent>{
        return this.gameComponentRegisterSubject
    }

    listenForTileRegister(): Subject<TileComponent>{
        return this.tileRegisterSubject
    }

    watchForBombExplosions(): Subject<any>{
        return this.explosionSubject
    }

    bombExplosion(tile: Tile){
        this.explosionSubject.next(tile)
    }



    
}