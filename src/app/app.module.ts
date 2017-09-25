import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TheGame } from './the-game/the-game.component';
import { Tile } from './the-game/tile/tile.component';
import { Player } from './the-game/player/player.component';
import { GameHud } from './the-game/hud/game-hud.component';

/*
import { GameService } from './the-game/game.service'
import { TileService } from './the-game/game.service'
import { AbilitesService } from './the-game/abilities-and-upgrades/abilites'
*/


@NgModule({
  declarations: [
    AppComponent,
    TheGame,
    Tile,
    Player,
    GameHud
  ],
  /* providers: [
    GameService,
    TilesService,
    AbilitiesService,
    ServerUpdatesService,
    UserInputService
  ], */
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
