import { Component, OnInit } from '@angular/core';
import { Packet, ServerGameObject} from './definitions/class-definitions';
import { User } from './the-game/player/user.component'
import { ConnectionService } from './connection-service/connection-service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  gameOn = false;
  user: User;
  serverGameObject: ServerGameObject;

  constructor( private connectionService: ConnectionService){
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }

  ngOnInit(){
  }

  registerUserInstance(userInstance: User){
    this.user = userInstance
  }
  startGame(serverGameObject: ServerGameObject){
    this.gameOn = true
  }

  manageEventsFromServer(serverEvent){
    const eventsObject = {
      'game found': serverEvent => this.gameFound(serverEvent)
    };
    if (eventsObject[serverEvent.eventName]){
      eventsObject[serverEvent.eventName](serverEvent.data);
    }
  }

  gameFound(fromServerData: ServerGameObject){
      this.serverGameObject = fromServerData;
      this.startGame(this.serverGameObject);
  }
}
