import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { GameComponent } from './the-game/the-game.component';
import { TileComponent } from './the-game/tile/tile.component';
import { GameService } from './the-game/game-service';
import { ConnectionService } from './connection-service/connection-service'

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    TileComponent
  ],
  imports: [BrowserModule],
  providers: [GameService, ConnectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
