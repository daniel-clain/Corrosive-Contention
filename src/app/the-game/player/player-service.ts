import { GameService } from '../game-service';
import { ConnectionService } from '../../connection-service/connection-service';
import { Player } from './player';
import { PlayerServiceDefinition } from '../../class-definitions/class-definitions';
import { Tile } from '../tile/tile';
import { Packet, Bomb, EssenceColour, BombItem, Loot, Direction, FailOrSucceed, Ability, Explosion, TreeAcid, HudItem } from '../../type-definitions/type-definitions';



export class PlayerService implements PlayerServiceDefinition {
    constructor(private connectionService: ConnectionService, private gameService: GameService){
        this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent));
    }

    useAbility(ability: Ability, player: Player): FailOrSucceed{
        if (ability === Ability['Siphon Tree']){
            player.siphonTree();
        }
        if (ability === Ability['Throw Bomb']){
            if (player.stats.bombs >= 1){
                player.throwBomb();
                player.stats.bombs--;
            this.gameService.updateHud(player, HudItem.bombs, player.stats.bombs);
            }
        }


        return <FailOrSucceed>{ FailOrSucceed: true };
    };
    throwBomb(player: Player): FailOrSucceed{
        console.log('throwing bomb');
        const bomb: Bomb = new Bomb(player.facing, player.stats.bombExplosionSize, player.stats.bombThrowRange, player);
        player.playerTile.bombEnterTile(bomb);
        this.gameService.bombTravel(bomb, player.playerTile);

        if (player.playerNumber === this.gameService.user.player.playerNumber){
            this.connectionService.sendPacket({
                eventName: 'player throwBomb update',
                data: { playerNumber: player.playerNumber }
            });
        }
        return <FailOrSucceed>{ FailOrSucceed: true };
    };

    siphonTree(player: Player): FailOrSucceed{
        console.log('siphon tree');
        const targetTile = this.gameService.getTileRelativeToAnotherTile(player.playerTile, player.facing);
        if (targetTile && targetTile.treeInTile){
            if (targetTile.volatileTree){
                targetTile.treeExplode();
                return <FailOrSucceed>{ FailOrSucceed: false, reason: 'tree was volatile and exploded', returnObj: {tile: targetTile}};

            } else {
                let bombsItem: BombItem;
                let essenceItemObj;
                const fiftyPercentChanceForBombToDrop: Boolean = this.gameService.percentageChance(50);
                if (fiftyPercentChanceForBombToDrop){
                    bombsItem = BombItem.oneBomb;
                    const fivePercentChanceForThreeBombs: Boolean = this.gameService.percentageChance(5);
                    if (fivePercentChanceForThreeBombs){
                        bombsItem = BombItem.threeBombs;
                    }
                }
                const seventyPercentChanceForEssenceToDrop: Boolean = this.gameService.percentageChance(70);
                if (seventyPercentChanceForEssenceToDrop){
                    const numberOfColours = Object.keys(EssenceColour).length / 2;
                    const randomColour: EssenceColour = Math.floor(Math.random() * numberOfColours);
                    const randomPositionX: number = Math.floor(Math.random() * 50);
                    const randomPositionY: number = Math.floor(Math.random() * 50);
                    essenceItemObj = {randomColour: randomColour, randomPositionX: randomPositionX, randomPositionY: randomPositionY};
                }
                console.log('siphon tree successful, item drops: ' + bombsItem + ', ', essenceItemObj);
                targetTile.treeLeaveTile();
                targetTile.itemDrop(bombsItem, essenceItemObj);

                return <FailOrSucceed>{ FailOrSucceed: true, returnObj: {bombsItem, essenceItemObj, targetTile} };
            }
        }

        return <FailOrSucceed>{ FailOrSucceed: true };
    }

    pickUpLoot(loot: Loot, player: Player){
        if (loot.bombs){
            player.stats.bombs += loot.bombs;
            this.gameService.updateHud(player, HudItem.bombs, player.stats.bombs);
        }
        if (loot.essenceColour === EssenceColour.blue){
            player.stats.blueEssence++;
            this.gameService.updateHud(player, HudItem.blueEssence, player.stats.blueEssence);
        }
        if (loot.essenceColour === EssenceColour.green){
            player.stats.greenEssence++;
            this.gameService.updateHud(player, HudItem.greenEssence, player.stats.greenEssence);
        }
        if (loot.essenceColour === EssenceColour.yellow){
            player.stats.yellowEssence++;
            this.gameService.updateHud(player, HudItem.yellowEssence, player.stats.yellowEssence);
        }
        if (loot.essenceColour === EssenceColour.purple){
            player.stats.purpleEssence++;
            this.gameService.updateHud(player, HudItem.purpleEssence, player.stats.purpleEssence);
        }
    }

    moveToStartLocation(player: Player){
        player.facing = Direction.down;
        player.playerTile = player.startLocation;
        this.moveIntoTile(player);
        const surroundingTiles = this.gameService.getTilesWithXRadius(1, player.startLocation);
        surroundingTiles.forEach(tile => tile.treeLeaveTile());
    }


    playerHealthChange(health: number, player: Player){
        player.stats.health += health;
        this.gameService.updateHud(player, HudItem.health, player.stats.health);
        if (player.stats.health <= 0){
          player.playerDies();
        }
    }

    playerDies(player: Player){
        player.playerTile.playerRemovedFromTile();
        player.stats.lives--;
        this.gameService.updateHud(player, HudItem.lives, player.stats.lives);
        if (player.stats.lives <= 0 ){
            console.log('Game Over!');
            player.playerIsOut = true;
        }else {
            player.stats.health = player.stats.maxHealth;
            player.stats.bombs = player.stats.maximumBombs;
            this.gameService.updateHud(player, HudItem.health, player.stats.health);
            player.moveToStartLocation();
        }
    }

    hitByExplosion(explosion: Explosion, player: Player){
        player.playerHealthChange(-explosion.damage);
    };
    hitByTreeAcid(explosion: TreeAcid, player: Player){
        player.playerHealthChange(-explosion.damage);
    };
    setFacingDirection(direction: Direction, player: Player){
        player.facing = direction;
        player.playerTile.tileComponent.setPlayerFacingDirection(direction);
    }


    moveIntoTile(player: Player){
        player.playerTile.playerEnterTile(player);
        if (player.playerNumber === this.gameService.user.player.playerNumber){
            this.gameService.moveBoard(player.playerTile);
        }
    }

    move(direction: Direction, player: Player): FailOrSucceed{

        const playerTile = player.playerTile;
        const destinationTile: Tile = this.gameService.getDestinationTile(playerTile, direction);

        const movingIn = destinationTile.playerMovingInToTile();

        if (movingIn){

            playerTile.playerLeaveTile(player);

            setTimeout(() => {
                console.log('player move');
                player.playerTile = destinationTile;
                this.moveIntoTile(player);
                player.ableToMove = true;
            }, 400);

            return <FailOrSucceed>{ FailOrSucceed: true };
        }
        return <FailOrSucceed>{ FailOrSucceed: false, reason: 'invalid move' };
    };


    broadcastEventToOtherPlayers(eventName, data){
        this.connectionService.sendPacket({ eventName: eventName, data: data });
    }



    /************************** Server Events *************************************************************/


    manageEventsFromServer(serverEvent: Packet){
        const eventsObject = {
            'player move update': serverEvent => this.playerMoveEvent(serverEvent),
            'player location change': serverEvent => this.updatePlayersLocation(serverEvent),
            'player throwBomb update': serverEvent => this.throwBombEvent(serverEvent),
            'player facingDirection update': serverEvent => this.setFacingDirectionUpdate(serverEvent),
            'itemDrop update': serverEvent => this.itemDropUpdate(serverEvent),
            'treeExplode update': serverEvent => this.treeExplodeUpdate(serverEvent),
            'player moveToStartLocation update': serverEvent => this.moveToStartLocationUpdate(serverEvent),
        };
        if (eventsObject[serverEvent.eventName]){
            eventsObject[serverEvent.eventName](serverEvent.data);
        }
    }

    moveToStartLocationUpdate(data){
        console.log('server moveToStartLocation update');
        const player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.moveToStartLocation(player);
    }

    treeExplodeUpdate(data){
        console.log('server tree explode update');
        const tile = this.gameService.getTileById(data.tileId);
        tile.treeExplode();
    }

    itemDropUpdate(data){
        console.log('server item drop update');
        const tile = this.gameService.getTileById(data.tileId);
        tile.treeLeaveTile();
        tile.itemDrop(data.bombs, data.essenceObj);
    }


    throwBombEvent(data){
        const player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.throwBomb(player);
    }

    setFacingDirectionUpdate(data){
        const player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.setFacingDirection(data.direction, player);
    }

    playerMoveEvent(data){
        const player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        const direction: Direction = data.direction;
        this.move(direction, player);
    }

    updatePlayersLocation(data){
        const leavingTile: Tile = this.gameService.getTileById(data.leavingTileId);
        const enteringTile: Tile = this.gameService.getTileById(data.enteringTileId);
        const player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        leavingTile.tileComponent.setPlayerFacingDirection(data.facing);
        enteringTile.tileComponent.setPlayerFacingDirection(data.facing);
        player.facing = data.facing;


        if (player.playerNumber !== this.gameService.user.player.playerNumber){

            leavingTile.playerLeaveTile(player);
            setTimeout(() => {
                enteringTile.playerEnterTile(player);

            }, 400);

        }
    }


}
