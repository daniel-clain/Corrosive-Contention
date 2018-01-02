import {Component, OnInit, HostListener, ViewContainerRef, ViewChild, TemplateRef} from '@angular/core';
import {KeyboardInput, Packet, ServerGameObject} from './definitions/class-definitions';
import { User } from './the-game/player/user'
import { ConnectionService } from './connection-service/connection-service'
import {TheGame} from './the-game/the-game.component';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  keyboardEvents: Subject<KeyboardInput> = new Subject();
  user = new User(this.keyboardEvents, this.connectionService);
  gameOn = false;
  serverGameObject: ServerGameObject;
  @ViewChild('gameTemplate') gameTemplate: TemplateRef<TheGame>;
  @ViewChild('gameContainer', {read: ViewContainerRef}) gameContainer: ViewContainerRef;
  
  @HostListener('window:keydown', ['$event'])
  keyDown(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents.next({key: e.key, action: 'down'})
  }
  
  @HostListener('window:keyup', ['$event'])
  keyUp(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents.next({key: e.key, action: 'up'})
  }
  constructor( private connectionService: ConnectionService){
  }

  ngOnInit(){
    this.user.gameFoundEvent.subscribe(serverGameObject => this.startGame(serverGameObject));
  }
  

  registerUserInstance(userInstance: User){
    this.user = userInstance
  }
  
  startGame(serverGameObject: ServerGameObject){
    this.serverGameObject = serverGameObject;
    const theGame = this.gameTemplate.createEmbeddedView(null);
    this.gameContainer.insert(theGame);
    this.gameOn = true
  
  }
}
