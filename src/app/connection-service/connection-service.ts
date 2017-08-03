
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';

export class ConnectionService{

    connection;
    serverEvents = new Subject();

    constructor(){
        this.connection = io('localhost:3000');
        this.connection.on('sentFromServer', fromServer => this.serverEvents.next(fromServer));
    }

    sendPacket(packet){
        this.connection.emit('sentFromGame', packet)
    }
}