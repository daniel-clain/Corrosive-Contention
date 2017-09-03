import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { PlayerStats } from '../../definitions/class-definitions';
import { TheGame } from '../the-game.component';
import { EssenceColour } from '../../definitions/enum-definitions';



@Component({
  selector: 'game-hud',
  templateUrl: 'game-hud.component.html'
})


export class GameHud implements OnInit {

  @Input() theGame: TheGame;

    playerStats: PlayerStats
    gameOptions


  private essenceShimmerActive = {
    purple: {
      active: false,
      upAndDown: 'down',
      displayUpgrades:false
    },
    yellow: {
      active: false,
      upAndDown: 'down',
      displayUpgrades:false
    },
    blue: {
      active: false,
      upAndDown: 'down',
      displayUpgrades:false
    },
    green: {
      active: false,
      upAndDown: 'down',
      displayUpgrades:false
    }
  }
  blueEssenceAbilities = [
    {name: 'Invisibility'},
    {name: 'Speed Increase'}
  ]
  greenEssenceAbilities = [
    {name: 'Bomb Throw Range'},
    {name: 'Tentacle'},

  ]
  yellowEssenceAbilities = [
    {name: 'Force Field'},
    {name: 'Health Regeneration'}
  ]
  purpleEssenceAbilities = [
    {name: 'Explosion Size'},
    {name: 'Acid Trap'},
    {name: 'Build Tower Defence'},
    {name: 'Player Detector'}
  ]

  constructor(private cdRef:ChangeDetectorRef){}

  
  ngOnInit(){
    this.theGame.gameStartup.gameHudCreated(this)
  }


  updateStats(hudItem: string, value: number){
      this.cdRef.detach();
      this.playerStats[hudItem] = value;
      let essenceColour: string = EssenceColour[this.isEssence(hudItem)];
      if(essenceColour && value === 2){
        this.setEssenceIsActive(true,essenceColour)
      }
      this.cdRef.detectChanges();
  }

  setupStats(stats: PlayerStats){
    this.playerStats = stats
  }

  levelUp(colour, ability){
    console.log(ability.name+' leveled up!')
    let essence = this.essenceShimmerActive[colour].active = false;
    let hudRef: string;
    switch(colour){
      case "yellow": hudRef = 'yellowEssence';
      case "purple": hudRef = 'purpleEssence';
      case "blue": hudRef = 'blueEssence';
      case "green": hudRef = 'greenEssence';
    }

    this.playerStats[hudRef] = 0;

  }

  isEssence(hudItem): EssenceColour{
    switch(hudItem){
      case "yellowEssence": return EssenceColour.yellow;
      case "purpleEssence": return EssenceColour.purple;
      case "blueEssence": return EssenceColour.blue;
      case "greenEssence": return EssenceColour.green;
    }
  }
  glowingEssenceClickedOn(colour: string){
    let essence = this.essenceShimmerActive[colour]
    this.cdRef.detach();
    essence.displayUpgrades = true;
    essence.upAndDown = 'stop'
    this.cdRef.detectChanges();
    
  }



  setEssenceIsActive(bool:Boolean, essenceColour: string){
    let essence = this.essenceShimmerActive[essenceColour]
    essence.active=bool;
    if(bool){
      essence.upAndDown="down";
      this.upAndDownLoop(essence)
      
    }

  }

  upAndDownLoop(essence){
    this.cdRef.detach();
    essence.upAndDown=(essence.upAndDown==="down")?"up":"down"
    this.cdRef.detectChanges();

    setTimeout(() => {
      if(essence.upAndDown!=="stop")this.upAndDownLoop(essence)
    },1000)
  }
}