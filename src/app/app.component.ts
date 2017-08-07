import { Component, OnInit } from '@angular/core';
import { Packet, Bomb, EssenceColour, BombItem, Loot, ServerGameObject } from './type-definitions/type-definitions';
import { ConnectionService } from './connection-service/connection-service'
import { TheGame } from './the-game/the-game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  serverGameObject: ServerGameObject;
  game: TheGame;

  constructor(private connectionService: ConnectionService){
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }

  ngOnInit(){
    this.queForGame()
  }

  manageEventsFromServer(serverEvent){
    let eventsObject = {
      "game found": serverEvent => this.gameFound(serverEvent)
    }
    if(eventsObject[serverEvent.eventName]){
      eventsObject[serverEvent.eventName](serverEvent.data)
    }
  }


  queForGame(){
    this.connectionService.sendPacket({eventName:'searching for game'})
  }

  gameFound(fromServerData){
    this.serverGameObject = <ServerGameObject>fromServerData
    this.game = new TheGame()
  }

}
