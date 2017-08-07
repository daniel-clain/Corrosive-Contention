
import { Packet, ServerGameObject } from '../type-definitions/type-definitions';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';

export class ConnectionService{

    connection;
    serverEvents = new Subject();
    serverGameObject: ServerGameObject;
    gameId: number;
    

    constructor(){
        this.connection = io('localhost:3000');
        this.connection.on('sentFromServer', fromServer => this.serverEvents.next(fromServer));
        this.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    }

    sendPacket(packet: Packet){
        if(this.serverGameObject) packet.data.gameId = this.serverGameObject.gameId;
        this.connection.emit('sentFromGame', packet)
    }


    manageEventsFromServer(serverEvent: Packet){
        if(serverEvent.eventName === 'game found'){
            this.serverGameObject = serverEvent.data;
        }

    }
}