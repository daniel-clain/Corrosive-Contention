
import { Packet } from '../definitions/class-definitions';
import { AbilityName } from '../definitions/enum-definitions';

import { TheGame } from './the-game.component';
import { Player } from './player/player.component';
import { Subject } from 'rxjs/Subject';

export class ManageServerUpdates{

    otherPlayersReadySubject: Subject<any> = new Subject();

    constructor(private theGame: TheGame){
      this.theGame.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    }


    manageEventsFromServer(serverEvent: Packet){
        const eventsObject = {
            'player move update': serverEvent => this.playerMoveEvent(serverEvent),
            'player throwBomb update': serverEvent => this.throwBombEvent(serverEvent),
            'player dies update': serverEvent => this.playerDiesEvent(serverEvent),
            'loot drop update': serverEvent => this.lootDropUpdate(serverEvent),
            'treeExplode update': serverEvent => this.treeExplodeUpdate(serverEvent),
            'player moveToStartLocation update': serverEvent => this.moveToStartLocationUpdate(serverEvent),
            'player ready': serverEvent => this.playerReadyUpdate(serverEvent),
            'player use ability update': serverEvent => this.playerUseAbilityEvent(serverEvent),

        };
        if (eventsObject[serverEvent.eventName]){
            eventsObject[serverEvent.eventName](serverEvent.data)
        }
    }

    waitForOtherPlayersReady(): Subject<any>{
        return this.otherPlayersReadySubject
    }

    playerReadyUpdate(data){
        let allReady = true;
        this.theGame.players.forEach(player => {
            if (player.playerNumber === data.playerNumber){
                player.ready = true
            }
            if (!player.ready){
                allReady = false;
            }
        });
        if (allReady){
            this.otherPlayersReadySubject.next();
        }
    }

    moveToStartLocationUpdate(data){
        console.log('server moveToStartLocation update');
        const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        // player.moveToStartLocation();
    }

    treeExplodeUpdate(data){
        console.log('server tree explode update');
        const tile = this.theGame.getTileById(data.tileId);
        tile.treeInTile.treeAcidAnimate();
    }

    lootDropUpdate(data){
        console.log('loot drop update');
        const tile = this.theGame.getTileById(data.tileId);
        tile.lootDropped(data.loot);
    }

    throwBombEvent(data){
        const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.abilities.throwBomb()
    }

    playerMoveEvent(data){
        const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.move(data.direction)
    }

    playerUseAbilityEvent(data){
        const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        const ability: AbilityName = data.ability;
        player.useAbility(ability)
    }

    playerDiesEvent(data){
        const player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.playerDies();
    }
}
