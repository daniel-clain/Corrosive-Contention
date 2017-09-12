import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TheGame } from './the-game/the-game.component';
import { Tile } from './the-game/tile/tile.component';
import { GameHud } from './the-game/hud/game-hud.component';


@NgModule({
  declarations: [
    AppComponent,
    TheGame,
    Tile,
    GameHud
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
