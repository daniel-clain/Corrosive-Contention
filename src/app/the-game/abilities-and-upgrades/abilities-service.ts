
import { EssenceColour } from '../../definitions/enum-definitions';
import { Tile } from '../tile/tile.component';
import { Bomb } from '../game-board-entities/bomb.component';
import { TheGame } from '../the-game.component';
import { Ability, EssenceAbilities, EssenceAbility, Interact, ThrowBomb, Invisibility, SpawnTentacle, Upgrade, BombThrowRange, DragVolatileDetector } from './abilities-and-upgrades';


export class AbilitiesService{

  activatedAbilities: Ability[];
  defaultAbilitiesList = {
    'Go Invisible': new Invisibility(this.theGame),
    'Spawn Tentacle': new SpawnTentacle(this.theGame),/*
    new PlayerDetector(this.theGame),
    new AcidTrap(this.theGame),
    new ForceField(this.theGame),
    new BuldTowerDefence(this.theGame), */
    'Interact': new Interact(this.theGame),
    'Drag Volatile Detector': new DragVolatileDetector(this.theGame),
    'Throw Bomb': new ThrowBomb(this.theGame), /*
    new MoveDetector(this.theGame) */
  };
  upgrades: Upgrade[] = [
    new BombThrowRange(this.theGame), /*
    new SpeedIncrease(this.theGame),
    new HealthRegenration(this.theGame),
    new BombExplosionSize(this.theGame) */
  ];
  constructor(private theGame: TheGame){}

  throwBombLevelUp(){
      this.theGame.mainPlayer.stats.bombThrowRange++;
  };

  bombExplosionSizeLevelUp(){
      this.theGame.mainPlayer.stats.bombExplosionSize++;
  };

  invisibilityLevelUp(){
    console.log('invisibilityLevelUp()')
  }

  goInvisible(){
    console.log('goInvisible()')
  }
  getActivatedAbilitiesList(){

  }
  getActivatedAbilities(): Ability[]{
    if (this.activatedAbilities){
      return this.activatedAbilities;
    } else {
      this.activatedAbilities = [];
      /*this.abilitiesList.forEach((ability: Ability) => {
        if (ability instanceof ActivatedAbility){
          this.activatedAbilities.push(ability)
        }
      })*/
    }
  }
  getEssenceAbilitiesList(): EssenceAbilities{
    const list: EssenceAbilities = {
      blue: [],
      green: [],
      yellow: [],
      purple: [],
    }
    const abilities: Ability[] = this.getEssenceAbilities()
    abilities.forEach((ability: Ability) => {
      if (ability.primaryEssenceColor === EssenceColour.blue){
        list.blue.push(ability)
      }
      if (ability.primaryEssenceColor === EssenceColour.green){
        list.green.push(ability)
      }
      if (ability.primaryEssenceColor === EssenceColour.yellow){
        list.yellow.push(ability)
      }
      if (ability.primaryEssenceColor === EssenceColour.purple){
        list.purple.push(ability)
      }
    })


    return list;
  }
  getEssenceAbilities(): EssenceAbility[]{
    const essenceAbilities: EssenceAbility[] = []
    for (const ability in this.defaultAbilitiesList){
      if (this.defaultAbilitiesList.hasOwnProperty(ability) && this.defaultAbilitiesList[ability] instanceof EssenceAbility) {
        essenceAbilities.push(this.defaultAbilitiesList[ability])
      }
    }

    return essenceAbilities;
  }
}


