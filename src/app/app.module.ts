import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GameComponent } from './the-game/the-game.component';
import { TileComponent } from './the-game/tile/tile.component';
import { GameController } from './the-game/game-controller';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    TileComponent
  ],
  imports: [BrowserModule],
  providers: [GameController],
  bootstrap: [AppComponent]
})
export class AppModule { }
