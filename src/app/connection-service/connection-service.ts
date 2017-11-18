import { Injectable, HostListener } from '@angular/core';
import { Packet, ServerGameObject } from '../definitions/class-definitions';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../environments/environment';

@Injectable()
export class ConnectionService{

  connection;
  serverEvents = new Subject;
  startGameSubject: Subject<ServerGameObject> = new Subject;
  serverGameObject: ServerGameObject;
  gameId: number;
  connected: boolean;
  connectionId: number;
  

    constructor(){
      this.connection = io(environment.gameHostAPI);
      this.connection.on('sentFromServer', fromServer => this.serverEvents.next(fromServer));
      this.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    }

  sendPacket(packet: Packet){
    console.log('send packet - ' + packet.eventName + ': ', packet.data);
    if(this.connectionId) {
      packet.data ? packet.data.connectionId = this.connectionId : packet.data = {connectionId: this.connectionId};
    }
    if(this.connectionId) {
      packet.data ? packet.data.gameId = this.gameId : packet.data = {gameId: this.gameId};
    }
    this.connection.emit('sentFromGame', packet);
  }
  
  manageEventsFromServer(serverEvent){
    
    switch(serverEvent.eventName){
      case 'connected':
        this.connectionId = serverEvent.data.connectionId;
        break;
      case 'game found':
        this.startGameSubject.next(serverEvent.data.gameObject);
        this.gameId = serverEvent.data.gameObject.id;
        break;
    }
  }
  
  closeConnection(){
    this.connection.close();
    this.connected = false;
  }

}
