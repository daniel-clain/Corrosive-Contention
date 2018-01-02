import { NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TheGame } from './the-game/the-game.component';
import { Tile } from './the-game/tile/tile.component';
import { Bomb } from './the-game/game-board-entities/bomb.component';
import { Tree } from './the-game/game-board-entities/tree.component';
import { Tentacle } from './the-game/game-board-entities/tentacle.component';
import { VolatileDetector } from './the-game/game-board-entities/volatile-detector.component';
import { Loot } from './the-game/game-board-entities/loot.component';
import { Player } from './the-game/player/player.component';
import { GameHud } from './the-game/hud/game-hud.component';
import { ConnectionService } from './connection-service/connection-service';
import { KeysPipe } from './definitions/pipe-definitions';
import { Sounds } from './definitions/class-definitions';

@NgModule({
  declarations: [
    AppComponent,
    TheGame,
    Tile,
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
