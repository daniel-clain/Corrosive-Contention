import { Injectable } from '@angular/core';
import { Packet, ServerGameObject } from '../type-definitions/type-definitions';
import * as io from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ConnectionService{

    connection;
    serverEvents = new Subject;
    serverGameObject: ServerGameObject;
    gameId: number;
    

    constructor(){
        this.connection = io('localhost:3000');
        this.connection.on('sentFromServer', fromServer => this.serverEvents.next(fromServer));
        this.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    }

    sendPacket(packet: Packet){

        if(this.serverGameObject){
            packet.data.gameId = this.serverGameObject.gameId;
        }
        console.log('send packet - '+packet.eventName+': ',packet.data)
        this.connection.emit('sentFromGame', packet)
    }


    manageEventsFromServer(serverEvent: Packet){
        if(serverEvent.eventName === 'game found'){
            console.log('game found, game data stored')
            this.serverGameObject = serverEvent.data;
        }

    }
}