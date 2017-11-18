import { Component, OnInit, HostListener } from '@angular/core';
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
  
  @HostListener('window:beforeunload', ['$event'])disconnect(e){
    // e.returnValue = 'Doing this will disconnect you from the game.'
    // this.connectionService.closeConnection();
  }
  constructor( private connectionService: ConnectionService){
    this.connectionService.startGameSubject.subscribe(serverGameObject => this.startGame(serverGameObject))
  }

  ngOnInit(){
  }
  

  registerUserInstance(userInstance: User){
    this.user = userInstance
  }
  
  startGame(serverGameObject: ServerGameObject){
    this.serverGameObject = serverGameObject;
    this.gameOn = true
  }
}
