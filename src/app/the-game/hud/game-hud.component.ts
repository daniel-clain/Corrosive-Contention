import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { PlayerStats } from '../../definitions/class-definitions';
import { TheGame } from '../the-game.component';
import { EssenceColour } from '../../definitions/enum-definitions';
import { Ability, EssenceAbility, EssenceAbilities } from '../abilities-and-upgrades/abilities-and-upgrades';

@Component({
  selector: 'game-hud',
  templateUrl: 'game-hud.component.html'
})


export class GameHud implements OnInit {

  @Input() theGame: TheGame;

    playerStats: PlayerStats;
    essenceAbilitiesList: EssenceAbilities;
    activatedAbilities: Ability[];

  essenceShimmerActive = {
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
    this.activatedAbilities = this.theGame.abilitiesService.getActivatedAbilities();
    this.essenceAbilitiesList = this.theGame.abilitiesService.getEssenceAbilitiesList();
  }

  refreshHudComponent(){
    this.cdRef.detach();
    this.cdRef.detectChanges();
  }


  updateStats(hudItem: string, value: number){
      this.cdRef.detach();
      this.playerStats[hudItem] = value;
      const essenceColour: string = EssenceColour[this.isEssence(hudItem)];
      if (essenceColour){
        const upgradeOption: EssenceAbility = this.checkIfUpgradeAvailable(essenceColour, hudItem);
        if (upgradeOption){
          this.setEssenceIsActive(true, essenceColour, upgradeOption)
        }
      }
      this.cdRef.detectChanges();
  }


  checkIfUpgradeAvailable(essenceColour: string, essenceColourRef: string): EssenceAbility{
    let returnAbility: EssenceAbility = null;
    const abilities = this.essenceAbilitiesList[essenceColour];
    for(const index in abilities){
      const ability = abilities[index];
      if(ability.thisEssenceCost <= this.playerStats[essenceColourRef] &&
        ability.purpleEssenceCost <= this.playerStats.purpleEssence){
        if (!returnAbility || returnAbility.thisEssenceCost <= ability.thisEssenceCost){
          returnAbility = ability;
        }
      }
    }
    return returnAbility;
  }

  setupStats(stats: PlayerStats){
    this.playerStats = stats
  }

  upgradeAbility(colour, ability: EssenceAbility){

    let essenceColourRef: string;
    switch (colour){
      case 'yellow':
        essenceColourRef = 'yellowEssence';
        break;
      case 'purple':
        essenceColourRef = 'purpleEssence';
        break;
      case 'blue':
        essenceColourRef = 'blueEssence';
        break;
      case 'green':
        essenceColourRef = 'greenEssence';
        break;
    }

    if (ability.thisEssenceCost <= this.playerStats[essenceColourRef] && ability.purpleEssenceCost <= this.playerStats.purpleEssence){
      ability.doUpgrade();
      this.cdRef.detach();
      this.essenceShimmerActive[colour].displayUpgrades = false;
      this.essenceShimmerActive[colour].active = false;
      this.cdRef.detectChanges();
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
      if (essence.upAndDown !== 'stop'){
        this.upAndDownLoop(essence);
      }
    }, 1000)
  }
}
