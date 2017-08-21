import { HostListener } from '@angular/core';
import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';
import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, PlayerStatsItem, EssenceColour, BombItem, Loot } from '../../definitions/class-definitions';
import { Tile } from '../../the-game/tile/tile.component';
import { ConnectionService } from '../../connection-service/connection-service';
import { TheGame } from '../the-game.component';
import { Abilities } from './abilities';
import { Bomb } from '../game-board-entities/bomb';
import { Tree } from '../game-board-entities/tree';




export class Player implements PlayerDefinition, GameBoardEntity{
    playerNumber: number;
    abilities: Abilities
    facing: Direction = Direction.down;
    playerTile: Tile;
    stats: PlayerStats = new PlayerStats();
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean = true;
    ready: Boolean;


    private moveCycle;
    private moveLoopActive


    constructor(private theGame: TheGame){
        this.playerNumber = this.theGame.serverGameObject.yourPlayerNumber;
        this.abilities = new Abilities(this, this.theGame, this.theGame.tileService);
        this.startLocation = this.theGame.tileService.getTileByPlayerStartLocation(this.playerNumber);        
        this.playerTile = this.startLocation
        this.moveToStartLocation()
    }

    private moveUntilKeyup(){
        setTimeout(()=>{
            if(this.moveLoopActive){
                this.move(this.facing)
                this.moveUntilKeyup()
            }
        }, 10)
    }

    keyReleased(){
        this.moveLoopActive = false;
    }
    
    
    move(direction: Direction): FailOrSucceed{

        if(!this.moveCycle){

            if(!this.moveLoopActive){
                this.moveLoopActive = true
                this.moveUntilKeyup()
            }

            if(this.facing !== direction){
                this.setFacingDirection(direction)
            }
            let destinationTile: Tile = this.theGame.tileService.getDestinationTile(this.playerTile, direction)
            let movingIn
            if(destinationTile){
                movingIn = destinationTile.playerMovingInToTile()
            }

            if(movingIn){
                this.moveCycle = setTimeout(() => {
                    this.moveCycle = undefined
                }, 400);

                this.playerTile.entityLeaveTile(this)

                setTimeout(() => {
                    destinationTile.entityEnterTile(this);
                    this.playerTile = destinationTile;
                }, 400)

                this.theGame.broadcastEventToOtherPlayers('player move update', { playerNumber: this.playerNumber, direction: direction })
                return <FailOrSucceed>{ FailOrSucceed: true }
            }

            return <FailOrSucceed>{ FailOrSucceed: false, reason: 'invalid move' }
        }
    }

    useAbility(ability: Ability): FailOrSucceed{
        if(ability === Ability['Siphon Tree']){
            this.abilities.siphonTree()
        }
        if(ability === Ability['Throw Bomb']){
            if(this.stats.bombs >= 1){
                this.abilities.throwBomb()
                this.stats.bombs--
                this.theGame.gameHud.updateStats(PlayerStatsItem.bombs, this.stats.bombs)
            }
        }
        

        return <FailOrSucceed>{ FailOrSucceed: true }
    };
    

    pickUpLoot(loot: Loot){
        if(loot.bombs){
            this.stats.bombs += loot.bombs
            this.theGame.gameHud.updateStats( PlayerStatsItem.bombs, this.stats.bombs)
        }
        if(loot.essenceColour === EssenceColour.blue){
            this.stats.blueEssence++
            this.theGame.gameHud.updateStats( PlayerStatsItem.blueEssence, this.stats.blueEssence)
        }
        if(loot.essenceColour === EssenceColour.green){
            this.stats.greenEssence++
            this.theGame.gameHud.updateStats( PlayerStatsItem.greenEssence, this.stats.greenEssence)
        }
        if(loot.essenceColour === EssenceColour.yellow){
            this.stats.yellowEssence++
            this.theGame.gameHud.updateStats( PlayerStatsItem.yellowEssence, this.stats.yellowEssence)
        }
        if(loot.essenceColour === EssenceColour.purple){
            this.stats.purpleEssence++
            this.theGame.gameHud.updateStats( PlayerStatsItem.purpleEssence, this.stats.purpleEssence)
        }
    }

    moveToStartLocation(){
        let tree;
        this.facing = Direction.down;
        this.playerTile = this.startLocation
        this.moveIntoTile();
        let surroundingTiles = this.theGame.tileService.getTilesWithXRadius(1, this.startLocation)
        surroundingTiles.forEach(tile => tile.entityLeaveTile(<Tree>tree));
    }

        
    playerHealthChange(health: number){
        this.stats.health += health
        this.theGame.gameHud.updateStats(PlayerStatsItem.health, this.stats.health)
        if(this.stats.health <= 0){
            this.playerDies()
            this.theGame.broadcastEventToOtherPlayers('player dies update', { playerNumber: this.playerNumber })
        } 
    }

    playerDies(){
        this.playerTile.entityLeaveTile(this)
        this.stats.lives--
        this.theGame.gameHud.updateStats(PlayerStatsItem.lives, this.stats.lives)
        if(this.stats.lives <= 0 ){
            console.log('Game Over!');
            this.playerIsOut = true;
        }else {
            this.stats.health = this.stats.maxHealth
            this.stats.bombs = this.stats.maximumBombs
            this.theGame.gameHud.updateStats(PlayerStatsItem.health, this.stats.health)
            this.moveToStartLocation();
        }
    }

    hitByExplosion(explosion: Explosion){
        this.playerHealthChange(-explosion.damage)
    };
    hitByTreeAcid(explosion: TreeAcid){
        this.playerHealthChange(-explosion.damage)
    };
    setFacingDirection(direction: Direction){
        this.facing = direction;
        this.playerTile.setFacingDirection(this.facing);
        this.theGame.broadcastEventToOtherPlayers('player facingDirection update', { playerNumber: this.playerNumber, direction: direction })
    }

    moveIntoTile(){
        this.playerTile.entityEnterTile(this)
        if(this.playerNumber === this.theGame.serverGameObject.yourPlayerNumber){
            this.theGame.moveBoard(this.playerTile);
        }
    }
}
