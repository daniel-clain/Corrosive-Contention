import { ServerGameObject, Packet, KeyboardInput } from '../../definitions/class-definitions';
import { ConnectionService } from '../../connection-service/connection-service';
import { Subject } from 'rxjs/Subject';

export class User{
  name: string;
  inGame: Boolean;
  playerNumber: number;
  gameFoundEvent: Subject<ServerGameObject> = new Subject();

  constructor(keyboardEvents, private connectionService: ConnectionService){
    keyboardEvents.subscribe((input: KeyboardInput) => this.broadcastUserAction(input))
    this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
  }
  
  manageEventsFromServer(serverEvent){
    console.log('serverEvent.eventName: ', serverEvent.eventName)
  
    switch(serverEvent.eventName){
      case 'connected':
        console.log('connected')
        this.queForGame();
        break;
      case 'game found':
        console.log('game found')
        this.gameFound(serverEvent.data.gameObject);
        break;
    }
  }
  queForGame(){
    console.log('searching')
    this.connectionService.sendPacket({eventName: 'searching for game'})
  }
  gameFound(serverGameObject: ServerGameObject){
    this.inGame = true;
    this.playerNumber = serverGameObject.yourPlayerNumber;
    this.gameFoundEvent.next(serverGameObject);
    
  }
  
  broadcastUserAction(input){
    if (!this.inGame){
      return;
    }
    this.connectionService.sendPacket(<Packet>{eventName:'user action update', data: {playerNumber: this.playerNumber, input: input}})
  }

  rejoinGame(){

  }

  joinExistingGame(){

  }
  
  setName(name: string){
    this.name = name;
  }

}
