import { Component, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { AbilitiesHud, PlayerStats, PlayerStatsItem, EssenceColour } from '../../definitions/class-definitions';
import { TheGame } from '../the-game.component';



@Component({
  selector: 'game-hud',
  templateUrl: 'game-hud.component.html'
})


export class GameHud implements OnInit {

  @Input() theGame: TheGame;


    abilitiesHud: AbilitiesHud 
    playerStats: PlayerStats
    gameOptions

    


  private essenceShimmerActive = {
    purple: {
      active: false,
      upAndDown: 'up'
    },
    yellow: {
      active: false,
      upAndDown: 'up'
    },
    blue: {
      active: false,
      upAndDown: 'up'
    },
    green: {
      active: false,
      upAndDown: 'up'
    }
  }

  constructor(private cdRef:ChangeDetectorRef){}

  
  ngOnInit(){
    this.theGame.gameStartup.gameHudCreated(this)
  }


  updateStats(hudItem: PlayerStatsItem, value: number){
      this.cdRef.detach();
      this.playerStats[PlayerStatsItem[hudItem]] = value;
      this.cdRef.detectChanges();
  }

  setupStats(stats: PlayerStats){
    this.playerStats = stats
  }


  setEssenceIsActive(bool:Boolean, essenceColour:EssenceColour){
    this.essenceShimmerActive[EssenceColour[essenceColour]]=bool;
    if(bool){
      this.upAndDownLoop(bool, essenceColour)
      
    }

  }

  upAndDownLoop(bool:Boolean, essenceColour:EssenceColour){
    this.cdRef.detach();
      this.essenceShimmerActive[EssenceColour[essenceColour]]=bool;
      setTimeout(() => {
        this.cdRef.detach();
        this.upAndDownLoop(bool, essenceColour)
        this.cdRef.detectChanges();
      },100)
      this.cdRef.detectChanges();
  }
}