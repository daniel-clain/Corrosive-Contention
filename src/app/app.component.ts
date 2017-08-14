import { Component, OnInit, HostListener } from '@angular/core';
import { UserControlledPlayer } from './the-game/player/user-controlled-player';
import { GameService } from './the-game/game-service';
import { ConnectionService } from './connection-service/connection-service';
import { Packet } from './type-definitions/type-definitions';
import { RegisterComponentsService } from './the-game/register-components-service';
import { GameComponent } from './the-game/the-game.component';
import { TileComponent } from './the-game/tile/tile.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  gameOn = false;
  connectionService: ConnectionService
  user: UserControlledPlayer;

  @HostListener('window:keydown', ['$event'])
  keyDown(e) {
    this.user.keyboardEvents(e.key,'down')
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(e) {
    this.user.keyboardEvents(e.key,'up')
  }

  constructor(private registerComponentsService: RegisterComponentsService){    
        this.registerComponentsService.gameWatchForGameRegister().subscribe((gameComponent: GameComponent) => this.gameComponentRegister(gameComponent))
        this.registerComponentsService.gameWatchForTileRegister().subscribe((tileComponent: TileComponent) => this.tileComponentRegister(tileComponent))

  }
  gameComponentRegister(gameComponent: GameComponent){
    this.user.theGame.gameService.gameComponentReady(gameComponent)
  }
  tileComponentRegister(tileComponent: TileComponent){
    this.user.theGame.gameService.tileComponentReady(tileComponent)
  }

  ngOnInit(){
    this.connectionService = new ConnectionService()
    this.user = new UserControlledPlayer( this.connectionService);
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }

  manageEventsFromServer(serverEvent){
    let eventsObject = {
      "game found": serverEvent => this.gameFound(serverEvent)
    }
    if(eventsObject[serverEvent.eventName]){
      eventsObject[serverEvent.eventName](serverEvent.data)
    }
  }
    
    gameFound(fromServerData){
        this.gameOn = true
    }


}
