import { Injectable } from '@angular/core';
import { GameService } from '../game-service';
import { ConnectionService } from '../../connection-service/connection-service';
import { Player } from './player';
import { PlayerServiceDefinition } from '../../class-definitions/class-definitions';
import { Tile } from '../../the-game/tile/tile';
import { Subject } from 'rxjs/Subject'
import { Packet, Bomb, EssenceColour, BombItem, Loot, WindowDimensions, Direction, ServerGameObject, FailOrSucceed, Ability, Explosion, TreeAcid, HudItem } from '../../type-definitions/type-definitions';



export class PlayerService implements PlayerServiceDefinition {
    constructor(private connectionService: ConnectionService, private gameService: GameService){
        this.connectionService.serverEvents.subscribe((serverEvent: Packet) => this.manageEventsFromServer(serverEvent))
    }

    useAbility(ability: Ability, player: Player): FailOrSucceed{
        if(ability === Ability['Siphon Tree']){
            player.siphonTree()
        }
        if(ability === Ability['Throw Bomb']){
            if(player.stats.bombs >= 1){
                player.throwBomb()
                player.stats.bombs--
            this.gameService.updateHud(player, HudItem.bombs, player.stats.bombs)
            }
        }
        

        return <FailOrSucceed>{ FailOrSucceed: true }
    };
    throwBomb(player: Player): FailOrSucceed{
        console.log('throwing bomb')
        let bomb: Bomb = new Bomb(player.facing, player.stats.bombExplosionSize, player.stats.bombThrowRange, player)
        player.playerTile.bombEnterTile(bomb)
        this.gameService.bombTravel(bomb, player.playerTile)

        if(player.playerNumber === this.gameService.user.player.playerNumber){
            this.connectionService.sendPacket({
                eventName: 'player throwBomb update',
                data: { playerNumber: player.playerNumber }
            })
        }

        return <FailOrSucceed>{ FailOrSucceed: true }
    };
    
    siphonTree(player: Player): FailOrSucceed{
        console.log('siphon tree')
        let targetTile = this.gameService.getTileRelativeToAnotherTile(player.playerTile, player.facing)
        if(targetTile && targetTile.treeInTile){
            if(targetTile.volatileTree){
                targetTile.treeExplode()
                return <FailOrSucceed>{ FailOrSucceed: false, reason: 'tree was volatile and exploded', returnObj: {tile: targetTile}}

            } else {
                let bombsItem: BombItem
                let essenceItemObj
                let fiftyPercentChanceForBombToDrop: Boolean = this.gameService.percentageChance(50)
                if(fiftyPercentChanceForBombToDrop){
                    bombsItem = BombItem.oneBomb
                    let fivePercentChanceForThreeBombs: Boolean = this.gameService.percentageChance(5)
                    if(fivePercentChanceForThreeBombs){
                        bombsItem = BombItem.threeBombs
                    }
                }
                let seventyPercentChanceForEssenceToDrop: Boolean = this.gameService.percentageChance(70)
                if(seventyPercentChanceForEssenceToDrop){
                    let numberOfColours = Object.keys(EssenceColour).length/2
                    let randomColour: EssenceColour = Math.floor(Math.random()*numberOfColours)
                    let randomPositionX: number = Math.floor(Math.random()*50)
                    let randomPositionY: number = Math.floor(Math.random()*50)
                    essenceItemObj = {randomColour: randomColour, randomPositionX: randomPositionX, randomPositionY: randomPositionY}
                }
                console.log('siphon tree successful, item drops: '+bombsItem+', ', essenceItemObj)
                targetTile.treeLeaveTile();
                targetTile.itemDrop(bombsItem, essenceItemObj)
                
                return <FailOrSucceed>{ FailOrSucceed: true, returnObj: {bombsItem, essenceItemObj, targetTile} }
            }
        }

        return <FailOrSucceed>{ FailOrSucceed: true }
    }

    pickUpLoot(loot: Loot, player: Player){
        if(loot.bombs){
            player.stats.bombs += loot.bombs
            this.gameService.updateHud(player, HudItem.bombs, player.stats.bombs)
        }
        if(loot.essenceColour === EssenceColour.blue){
            player.stats.blueEssence++
            this.gameService.updateHud(player, HudItem.blueEssence, player.stats.blueEssence)
        }
        if(loot.essenceColour === EssenceColour.green){
            player.stats.greenEssence++
            this.gameService.updateHud(player, HudItem.greenEssence, player.stats.greenEssence)
        }
        if(loot.essenceColour === EssenceColour.yellow){
            player.stats.yellowEssence++
            this.gameService.updateHud(player, HudItem.yellowEssence, player.stats.yellowEssence)
        }
        if(loot.essenceColour === EssenceColour.purple){
            player.stats.purpleEssence++
            this.gameService.updateHud(player, HudItem.purpleEssence, player.stats.purpleEssence)
        }
    }

    moveToStartLocation(player: Player){
        player.facing = Direction.down;
        player.playerTile = player.startLocation
        this.moveIntoTile(player);
        let surroundingTiles = this.gameService.getTilesWithXRadius(1, player.startLocation)
        surroundingTiles.forEach(tile => tile.treeLeaveTile());
    }

        
    playerHealthChange(health: number, player: Player){
        player.stats.health += health
        this.gameService.updateHud(player, HudItem.health, player.stats.health)
        if(player.stats.health <= 0) player.playerDies()
    }

    playerDies(player: Player){
        player.playerTile.playerRemovedFromTile(player)
        player.stats.lives--
        this.gameService.updateHud(player, HudItem.lives, player.stats.lives)
        if(player.stats.lives <= 0 ){
            console.log('Game Over!');
            player.playerIsOut = true;
        }else {
            player.stats.health = player.stats.maxHealth
            player.stats.bombs = player.stats.maximumBombs
            this.gameService.updateHud(player, HudItem.health, player.stats.health)
            player.moveToStartLocation();
        }
    }
    
    hitByExplosion(explosion: Explosion, player: Player){
        player.playerHealthChange(-explosion.damage)
    };
    hitByTreeAcid(explosion: TreeAcid, player: Player){
        player.playerHealthChange(-explosion.damage)
    };
    setFacingDirection(direction: Direction, player: Player){
        player.facing = direction;
        player.playerTile.tileComponent.setPlayerFacingDirection(direction);
    }
    

    moveIntoTile(player: Player){
        player.playerTile.playerEnterTile(player);
        if(player.playerNumber === this.gameService.user.player.playerNumber){
            this.gameService.moveBoard(player.playerTile);
        }
    }

    move(direction:Direction, player: Player): FailOrSucceed{

        let playerTile = player.playerTile
        let destinationTile: Tile = this.gameService.getDestinationTile(playerTile, direction)

        let movingOut = playerTile.playerMovingOutOfTile(direction)
        let movingIn = destinationTile.playerMovingInToTile(direction)

        if(movingOut && movingIn){
            
            playerTile.playerLeaveTile(player);

            let movingIntoTile = setTimeout(() => {
                console.log('player move')
                player.playerTile = destinationTile;
                this.moveIntoTile(player)
                player.ableToMove = true;
            }, 400)

            return <FailOrSucceed>{ FailOrSucceed: true }
        }

        return <FailOrSucceed>{ FailOrSucceed: false, reason: 'invalid move' }
        
    };


    broadcastEventToOtherPlayers(eventName, data){
        this.connectionService.sendPacket({ eventName: eventName, data: data })
    }




    /************************** Server Events *************************************************************/

  
    manageEventsFromServer(serverEvent: Packet){
        let eventsObject = {
            "bomb and essence tile update": serverEvent => this.updateEssenceAndBombsInTile(serverEvent),
            "player move update": serverEvent => this.playerMoveEvent(serverEvent),
            "player location change": serverEvent => this.updatePlayersLocation(serverEvent),
            "player throwBomb update": serverEvent => this.throwBombEvent(serverEvent),
            "player facingDirection update": serverEvent => this.setFacingDirectionUpdate(serverEvent),
            "itemDrop update": serverEvent => this.itemDropUpdate(serverEvent),
            "treeExplode update": serverEvent => this.treeExplodeUpdate(serverEvent),
            "player moveToStartLocation update": serverEvent => this.moveToStartLocationUpdate(serverEvent),
        }
        if(eventsObject[serverEvent.eventName]){
            eventsObject[serverEvent.eventName](serverEvent.data)
        }
    }

    moveToStartLocationUpdate(data){
        console.log('server moveToStartLocation update')
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.moveToStartLocation(player);
    }

    treeExplodeUpdate(data){
        console.log('server tree explode update')
        let tile = this.gameService.getTileById(data.tileId)
        tile.treeExplode();
    }

    itemDropUpdate(data){
        console.log('server item drop update')
        let tile = this.gameService.getTileById(data.tileId)
        tile.treeLeaveTile();
        tile.itemDrop(data.bombs, data.essenceObj)
    }

    
    throwBombEvent(data){
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.throwBomb(player)
    }

    setFacingDirectionUpdate(data){
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        this.setFacingDirection(data.direction, player)
    }

    playerMoveEvent(data){
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        let direction: Direction = data.direction
        this.move(direction, player)
    }

    playerUseAbilityEvent(data){
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber);
        let ability: Ability = data.ability
        this.useAbility(ability, player)
    }

    updateEssenceAndBombsInTile(data){
        let leavingTile = this.gameService.getTileById(data.leavingTileId)
        let enteringTile = this.gameService.getTileById(data.enteringTileId)
        let player = this.gameService.getPlayerByPlayerNumber(data.playerNumber)
        if(leavingTile){
            leavingTile.playerLeaveTile(player)
        }
        data.targetTile.essenceEnterTile(...data.essenceEnterTileData);
        data.targetTile.bombEnterTile(data.bombs);
    }

    

    updatePlayersLocation(data){
        let leavingTile: Tile = this.gameService.getTileById(data.leavingTileId)
        let enteringTile: Tile = this.gameService.getTileById(data.enteringTileId)
        let player: Player = this.gameService.getPlayerByPlayerNumber(data.playerNumber)
        leavingTile.tileComponent.setPlayerFacingDirection(data.facing);
        enteringTile.tileComponent.setPlayerFacingDirection(data.facing);
        player.facing = data.facing;


        if(player.playerNumber !== this.gameService.user.player.playerNumber){
            
            leavingTile.playerLeaveTile(player)
            setTimeout(() => {
                enteringTile.playerEnterTile(player)
                
            }, 400)

        }
    }


}