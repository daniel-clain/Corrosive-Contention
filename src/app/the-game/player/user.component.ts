import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, HostListener } from '@angular/core';
import { ServerGameObject, Packet } from '../../definitions/class-definitions';
import { ConnectionService } from '../../connection-service/connection-service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'game-user',
  template: ``
})


export class User implements OnInit{
  @Output() sendUserInstanceToApp = new EventEmitter();
  @Output() startGame = new EventEmitter();
  serverGameObject: ServerGameObject;
  name: string;
  inGame: Boolean;
  moveSubject: Subject<any> = new Subject();
  abilitySubject: Subject<any> = new Subject();

  constructor(private cdRef: ChangeDetectorRef, private connectionService: ConnectionService){

  }

  @HostListener('window:keydown', ['$event'])
  keyDown(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents(e.key, 'down')
  }

  @HostListener('window:keyup', ['$event'])
  keyUp(e){
    if (e.repeat){
      return false;
    }
    this.keyboardEvents(e.key, 'up')
  }

  ngOnInit(){
    this.sendUserInstanceToApp.emit(this)
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    this.connectionService.connected.subscribe(() => this.queForGame());

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
    this.inGame = true;
  }

  queForGame(){
      this.connectionService.sendPacket({eventName: 'searching for game'})
  }

  rejoinGame(){

  }

  joinExistingGame(){

  }

  keyboardEvents(key, action){
    let direction: string;
    let abilityName: string;
    switch (key) {
      case 'ArrowUp': direction = 'up'; break;
      case 'ArrowRight': direction = 'right'; break;
      case 'ArrowDown': direction = 'down'; break;
      case 'ArrowLeft': direction = 'left'; break;

      case 'r': abilityName = 'Interact'; break;
      case ' ': abilityName = 'Throw Bomb'; break;
      case 'q': abilityName = 'yellow'; break;
      case 'w': abilityName = 'Go Invisible'; break;
      case 'e': abilityName = 'Spawn Tentacle'; break;
      case 'Shift': abilityName = 'Drag Volatile Detector'; break;

    }
    if (direction){
      this.moveSubject.next({action: action, direction: direction})
    }
    if (abilityName && action !== 'up'){
      this.abilitySubject.next(abilityName)
    }
  }

}
