
import { ConnectionService } from '../../connection-service/connection-service';
import { TheGame } from '../../the-game/the-game';
import { Packet, Direction, Ability } from '../../type-definitions/type-definitions';
import { UserControlledPlayerDefinition }  from '../../class-definitions/class-definitions';
import { Player } from './player';

export class UserControlledPlayer implements UserControlledPlayerDefinition{

    moveCycle: any;
    player: Player;
    name: string = 'name not set';
    connectedToHost: Boolean = false;
    ableToMove: Boolean = true;
    theGame: TheGame;

    constructor(private connectionService: ConnectionService){
        this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
        this.queForGame()
    }


    queForGame(){
        this.connectionService.sendPacket({eventName:'searching for game'})
    }

    setName(name: string){
        this.name = name;
    }


    manageEventsFromServer(serverEvent){
        let eventsObject = {
            "game found": serverEvent => this.gameFound(serverEvent)
        }
        if(eventsObject[serverEvent.eventName]){
            eventsObject[serverEvent.eventName](serverEvent.data)
        }
    }



    gameFound(fromServerData){
        this.theGame = new TheGame(this, this.connectionService)
    }

    gameAssignPlayerToUser(player: Player){
        this.player = player;
    }
    
    keyboardEvents(key, action){
        let direction: Direction
        if(action==='down'){
            switch (key) {
                case 'ArrowUp': { direction = Direction.up }; break;
                case 'ArrowRight': { direction = Direction.right } ; break;
                case 'ArrowDown': { direction = Direction.down } ; break;
                case 'ArrowLeft': { direction = Direction.left } ; break;
                case 'r': this.player.useAbility(Ability['Siphon Tree']); break;
                case ' ': this.player.useAbility(Ability['Throw Bomb']); break;
            }
            if(direction in Direction && this.player.ableToMove){
                console.log('direction '+Direction[direction]+' ableToMove '+this.player.ableToMove)
                if(this.player.facing !== direction){
                    clearTimeout(this.moveCycle)
                }

                if(!this.moveCycle){
                    let moveSuccess = this.player.move(direction)
                    this.ableToMove = false;
                    
                    this.moveCycle = setTimeout(() => {
                        console.log('moveCycle')
                        this.moveCycle = undefined
                    }, 400);

                    if(!moveSuccess){
                        this.ableToMove = true;
                    }
                }
            }
        }
        if(action==='up'){
            switch (key) {
                case 'ArrowUp': {
                    console.log('up released');
                    clearTimeout(this.moveCycle);
                    this.moveCycle = undefined;
                }; break;
                case 'ArrowRight': {
                    console.log('right released')
                    clearTimeout(this.moveCycle);
                    this.moveCycle = undefined;
                } ; break;
                case 'ArrowDown': {
                    console.log('down released');
                    clearTimeout(this.moveCycle);
                    this.moveCycle = undefined;
                } ; break;
                case 'ArrowLeft': {
                    console.log('left released');
                    clearTimeout(this.moveCycle);
                    this.moveCycle = undefined;
                } ; break;
            }
        }
    }
}