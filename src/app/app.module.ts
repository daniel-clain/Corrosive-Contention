import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TheGame } from './the-game/the-game.component';
import { Tile } from './the-game/tile/tile.component';
import { Bomb } from './the-game/game-board-entities/bomb';
import { Tree } from './the-game/game-board-entities/tree';
import { Tentacle } from './the-game/game-board-entities/tentacle';
import { VolatileDetector } from './the-game/game-board-entities/volatile-detector';
import { Loot } from './the-game/game-board-entities/loot';
import { Player } from './the-game/player/player.component';
import { User } from './the-game/player/user.component';
import { GameHud } from './the-game/hud/game-hud.component';
import { ConnectionService } from './connection-service/connection-service';
import { KeysPipe } from './definitions/pipe-definitions';
import { Sounds } from './definitions/class-definitions';

@NgModule({
  declarations: [
    AppComponent,
    TheGame,
    Tile,
    User,
    GameHud,
    KeysPipe,
    Bomb,
    Tree,
    Tentacle,
    VolatileDetector,
    Loot,
    Player
  ],
  entryComponents: [
    Bomb,
    Tree,
    Tentacle,
    VolatileDetector,
    Loot,
    Player
  ],
  providers: [ConnectionService, Sounds],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
