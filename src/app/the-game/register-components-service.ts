import { Injectable } from '@angular/core';
import { GameComponent } from './the-game.component';
import { TileComponent } from './tile/tile.component';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RegisterComponentsService{
    tileRegisterSubject = new Subject<TileComponent>();
    gameRegisterSubject = new Subject<GameComponent>();

    registerGameComponent(gameComponent: GameComponent){
        this.gameRegisterSubject.next(gameComponent);
    }

    registerTileComponent(tileComponent: TileComponent){
        this.tileRegisterSubject.next(tileComponent);
    }

    gameWatchForTileRegister(): Subject<TileComponent>{
        return this.tileRegisterSubject;
    }

    gameWatchForGameRegister(): Subject<GameComponent>{
        return this.gameRegisterSubject;
    }

}
