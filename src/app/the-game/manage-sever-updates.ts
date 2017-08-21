
import { Direction, Explosion, Packet, Ability, TreeAcid, PlayerStats, PlayerStatsItem, EssenceColour, BombItem, Loot } from '../definitions/class-definitions';
import { TheGame } from './the-game.component';
import { Player } from './player/player';
import { Tile } from './tile/tile.component';
import { Abilities } from './player/abilities';
import { Subject } from 'rxjs';

export class ManageServerUpdates{

    otherPlayersReadySubject: Subject<any> = new Subject()

    constructor(private theGame: TheGame){}

    
    manageEventsFromServer(serverEvent: Packet){
        let eventsObject = {
            "player move update": serverEvent => this.playerMoveEvent(serverEvent),
            "player throwBomb update": serverEvent => this.throwBombEvent(serverEvent),
            "player dies update": serverEvent => this.playerDiesEvent(serverEvent),
            "loot drop update": serverEvent => this.lootDropUpdate(serverEvent),
            "treeExplode update": serverEvent => this.treeExplodeUpdate(serverEvent),
            "player moveToStartLocation update": serverEvent => this.moveToStartLocationUpdate(serverEvent),
            "player ready": serverEvent => this.playerReadyUpdate(serverEvent),
        }
        if(eventsObject[serverEvent.eventName]){
            eventsObject[serverEvent.eventName](serverEvent.data)
        }
    }

    waitForOtherPlayersReady(): Subject<any>{
        return this.otherPlayersReadySubject
    }

    playerReadyUpdate(data){
        let allReady = true;
        this.theGame.otherPlayers.forEach(player => {
            if(player.playerNumber === data.playerNumber){
                player.ready = true
            }
            if(!player.ready){
                allReady = false;
            }
        });
        if(allReady){
            this.otherPlayersReadySubject.next();
        }
    }

    moveToStartLocationUpdate(data){
        console.log('server moveToStartLocation update')
        let player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.moveToStartLocation();
    }

    treeExplodeUpdate(data){
        console.log('server tree explode update')
        let tile = this.theGame.tileService.getTileById(data.tileId)
        tile.doTreeExplode();
    }

    lootDropUpdate(data){
        console.log('loot drop update')
        let tile = this.theGame.tileService.getTileById(data.tileId)
        tile.lootDropped(<Loot>data.loot);
    }
    
    throwBombEvent(data){
        let player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.abilities.throwBomb()
    }

    playerMoveEvent(data){
        let player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.move(<Direction>data.direction)
    }

    playerUseAbilityEvent(data){
        let player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        let ability: Ability = data.ability
        player.useAbility(ability)
    }

    playerDiesEvent(data){
        let player: Player = this.theGame.getPlayerByPlayerNumber(data.playerNumber);
        player.playerDies();
    }
}