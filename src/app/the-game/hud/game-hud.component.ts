import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { PlayerStats, EssenceAbility, EssenceAbilities } from '../../definitions/class-definitions';
import { TheGame } from '../the-game.component';
import { EssenceColour } from '../../definitions/enum-definitions';

@Component({
  selector: 'game-hud',
  templateUrl: 'game-hud.component.html'
})


export class GameHud implements OnInit {

  @Input() theGame: TheGame;

    playerStats: PlayerStats;
    essenceAbilitiesList: EssenceAbilities;

  private essenceShimmerActive = {
    purple: {
      active: false,
      upAndDown: 'down',
      displayUpgrades: false
    },
    yellow: {
      active: false,
      upAndDown: 'down',
      displayUpgrades: false
    },
    blue: {
      active: false,
      upAndDown: 'down',
      displayUpgrades: false
    },
    green: {
      active: false,
      upAndDown: 'down',
      displayUpgrades: false
    }
  };

  constructor(private cdRef: ChangeDetectorRef){}


  ngOnInit(){
    this.theGame.gameStartup.gameHudCreated(this);
    this.essenceAbilitiesList = this.theGame.mainPlayer.abilities.essenceAbilities;
  }


  updateStats(hudItem: string, value: number){
      this.cdRef.detach();
      this.playerStats[hudItem] = value;
      const essenceColour: string = EssenceColour[this.isEssence(hudItem)];
      if (essenceColour){
        const upgradeOption: EssenceAbility = this.checkIfUpgradeAvailable(essenceColour, value);
        if (upgradeOption){
          this.setEssenceIsActive(true, essenceColour, upgradeOption)
        }
      }
      this.cdRef.detectChanges();
  }


  checkIfUpgradeAvailable(essenceColour, value): EssenceAbility{
    let essenceColourAbilities: EssenceAbility[];
    let returnAbility: EssenceAbility = null;
    switch (essenceColour){
      case 'blue' : essenceColourAbilities = this.essenceAbilitiesList.blue; break;
      case 'green' : essenceColourAbilities = this.essenceAbilitiesList.green; break;
      case 'yellow' : essenceColourAbilities = this.essenceAbilitiesList.yellow; break;
      case 'purple' : essenceColourAbilities = this.essenceAbilitiesList.purple; break;
    }


    essenceColourAbilities.forEach((ability: EssenceAbility) => {
      if (ability.thisRequired <= value && ability.purpleRequired <= this.playerStats.purpleEssence){
        if (!returnAbility || returnAbility.thisRequired <= ability.thisRequired){
          returnAbility = ability;
        }
      }
    });
    return returnAbility;
  }

  setupStats(stats: PlayerStats){
    this.playerStats = stats
  }

  upgradeAbility(colour, ability: EssenceAbility){
    console.log(ability.name + ' leveled up!');
    this.essenceShimmerActive[colour].active = false;
    let hudRef: string;
    switch (colour){
      case 'yellow': hudRef = 'yellowEssence'; break;
      case 'purple': hudRef = 'purpleEssence'; break;
      case 'blue': hudRef = 'blueEssence'; break;
      case 'green': hudRef = 'greenEssence'; break;
    }
    if (this.playerStats[hudRef] = -ability.thisRequired){
      this.playerStats[hudRef] = -ability.thisRequired;
      this.playerStats.purpleEssence = -ability.purpleRequired;
      ability.doLevelUp();
    }
  }

  private isEssence(hudItem): EssenceColour{
    switch (hudItem){
      case 'yellowEssence': return EssenceColour.yellow;
      case 'purpleEssence': return EssenceColour.purple;
      case 'blueEssence': return EssenceColour.blue;
      case 'greenEssence': return EssenceColour.green;
    }
  }

  glowingEssenceClickedOn(colour: string){
    const essence = this.essenceShimmerActive[colour];
    this.cdRef.detach();
    essence.displayUpgrades = true;
    essence.upAndDown = 'stop';
    this.cdRef.detectChanges();
  }

  setEssenceIsActive(bool: Boolean, essenceColour: string, essenceAbility: EssenceAbility){
    const essence = this.essenceShimmerActive[essenceColour];
    essence.active = bool;
    if (bool){
      essence.upAndDown = 'down';
      this.upAndDownLoop(essence);
    }
  }

  upAndDownLoop(essence){
    this.cdRef.detach();
    essence.upAndDown = (essence.upAndDown === 'down') ? 'up' : 'down';
    this.cdRef.detectChanges();

    setTimeout(() => {
      if (essence.upAndDown !== 'stop')this.upAndDownLoop(essence);
    }, 1000)
  }
}
