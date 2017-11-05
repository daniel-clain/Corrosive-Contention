import { Injectable } from '@angular/core';
import { Packet, ServerGameObject } from '../definitions/class-definitions';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../environments/environment';

@Injectable()
export class ConnectionService{

  connection;
  serverEvents = new Subject;
  connected = new Subject;
  serverGameObject: ServerGameObject;
  gameId: number;

  constructor(){
    this.connection = new WebSocket(environment.gameHostAPI);
    this.connection.onopen = () => this.connected.next();
    this.connection.onmessage = messageEvent => this.serverEvents.next(JSON.parse(messageEvent.data))
    this.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent));
  }

  sendPacket(packet: Packet){
    if (this.serverGameObject){
        packet.data.gameId = this.serverGameObject.gameId;
    }
    this.connection.send(JSON.stringify(packet));
  }

  manageEventsFromServer(serverEvent: Packet){
    if (serverEvent.eventName === 'game found'){
        this.serverGameObject = serverEvent.data;
    }
  }
}
