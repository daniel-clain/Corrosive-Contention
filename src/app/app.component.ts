import { Component, OnInit } from '@angular/core';
import { ConnectionService } from './connection-service/connection-service';
import { Packet, ServerGameObject} from './definitions/class-definitions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  gameOn = false;
  connectionService: ConnectionService;
  serverGameObject: ServerGameObject;

  name = 'name not set';

  constructor(){
    this.connectionService = new ConnectionService();
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }

  ngOnInit(){
        this.queForGame()
  }

  setName(name: string){
      this.name = name;
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
      this.gameOn = true
  }

  queForGame(){
      this.connectionService.sendPacket({eventName: 'searching for game'})
  }

  rejoinGame(){

  }

  joinExistingGame(){

  }
}
