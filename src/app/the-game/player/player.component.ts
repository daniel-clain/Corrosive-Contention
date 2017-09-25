import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PlayerDefinition, GameBoardEntity } from '../../definitions/interface-definitions';
import { BombItem, AbilityName } from '../../definitions/enum-definitions';
import { Explosion, TreeAcid, PlayerStats, Loot } from '../../definitions/class-definitions';
import { Tile } from '../tile/tile.component';
import { TheGame } from '../the-game.component';
import { Ability } from '../abilities-and-upgrades/abilities-and-upgrades'

@Component({
  selector: 'game-player',
  template: `
    <div 
        class="playerModel" 
        [class]="facing" 
        [ngClass]="{'takingDamage': takingDamage}">
    </div>
  `
})


export class Player implements PlayerDefinition, GameBoardEntity, OnInit{
    @Input() theGame: TheGame;
    @Input() playerNumber: number;
    facing = 'down';
    tile: Tile;
    stats: PlayerStats = new PlayerStats();
    startLocation: Tile;
    playerIsOut: Boolean;
    status: any[] = [];
    ready: Boolean;
    counter = 0;
    moveLoopActive;
    moveKeyActive: Boolean;
    abilities: any;



    constructor(private cdRef: ChangeDetectorRef){
        
    }

    ngOnInit(){
      this.tile = this.startLocation = this.theGame.tileService.getTileByPlayerStartLocation(this.playerNumber)
      this.theGame.gameStartup.playerCreated(this)
      this.abilities = this.theGame.abilitiesService.defaultAbilitiesList;
    }
    refreshPlayerComponent(){
      this.cdRef.detach();
      this.cdRef.detectChanges();
    }

    keyReleased(key: string){
        if (key === this.facing){
            this.moveKeyActive = false;
        }
    }

    keydown(direction: string){
        this.facing = direction;
        if (!this.moveLoopActive){
            this.move(this.facing)
        }
        this.moveKeyActive = true;
    }

    move(direction: string){
        this.moveLoopActive = true;

        const destinationTile: Tile = this.theGame.tileService.getDestinationTile(this.tile, direction);
        if (destinationTile && destinationTile.playerMovingInToTile()){
            this.theGame.moveBoard(destinationTile);
            setTimeout(() => {
                  
                this.cdRef.detach();
                this.tile = destinationTile;
                this.cdRef.detectChanges();
                setTimeout(() => {
                    if (this.moveKeyActive){
                        this.move(this.facing)
                    } else {
                        this.moveLoopActive = false;
                    }
                }, 1)
            }, 4000)
            this.theGame.broadcastEventToOtherPlayers('player move update', { playerNumber: this.playerNumber, direction: direction })
        } else {
            this.tile.setFacingDirection();
            setTimeout(() => {
                this.moveLoopActive = false;
            }, 20)
        }
    }

    useAbility(abilityName: AbilityName){
        this.abilities[abilityName].useAbility();
        this.theGame.broadcastEventToOtherPlayers('player use ability update', { playerNumber: this.playerNumber, ability: abilityName });
    };


    pickUpLoot(loot: Loot){
        if (loot.bombs){
            this.stats.bombs += BombItem[loot.bombs];
            this.theGame.gameHud.updateStats( 'bombs', this.stats.bombs)
        }
        if (loot.essenceColour === 'blue'){
            this.stats.blueEssence++;
            this.theGame.gameHud.updateStats( 'blueEssence', this.stats.blueEssence)
        }
        if (loot.essenceColour === 'green'){
            this.stats.greenEssence++;
            this.theGame.gameHud.updateStats( 'greenEssence', this.stats.greenEssence)
        }
        if (loot.essenceColour === 'yellow'){
            this.stats.yellowEssence++;
            this.theGame.gameHud.updateStats( 'yellowEssence', this.stats.yellowEssence)
        }
        if (loot.essenceColour === 'purple'){
            this.stats.purpleEssence++;
            this.theGame.gameHud.updateStats( 'purpleEssence', this.stats.purpleEssence)
        }
    }

    moveToStartLocation(){
        if (!this.startLocation){
          this.startLocation = this.theGame.tileService.getTileByPlayerStartLocation(this.playerNumber);
        }
        this.tile = this.startLocation;
        this.facing = 'down';
        this.theGame.moveBoard(this.startLocation);
        this.startLocation.entityEnterTile(this);
        const surroundingTiles = this.theGame.tileService.getTilesWithXRadius(1, this.startLocation);
        surroundingTiles.forEach(tile => {
          if (tile.treeInTile){
            tile.treeInTile.remove();
          }
        });
    }


    playerHealthChange(health: number){
        this.stats.health += health;
        this.theGame.gameHud.updateStats('health', this.stats.health);
        if (this.stats.health <= 0){
            this.playerDies();
            this.theGame.broadcastEventToOtherPlayers('player dies update', { playerNumber: this.playerNumber })
        }
    }

    playerDies(){
        this.remove();
        this.stats.lives--;
        this.theGame.gameHud.updateStats('lives', this.stats.lives);
        if (this.stats.lives <= 0 ){
            console.log('Game Over!');
            this.playerIsOut = true;
        }else {
            this.stats.health = this.stats.maxHealth;
            this.stats.bombs = this.stats.maximumBombs;
            this.theGame.gameHud.updateStats('health', this.stats.health);
            this.moveToStartLocation();
        }
    }

    remove(){
        this.tile.entityRemovedFromTile(this);
    }

    hitByExplosion(explosion: Explosion){
        this.playerHealthChange(-explosion.damage);
        this.tile.playerTakesDamage()
    };
    hitByTreeAcid(explosion: TreeAcid){
        this.playerHealthChange(-explosion.damage);
        this.tile.playerTakesDamage()
    };
}
