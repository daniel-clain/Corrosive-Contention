import { EssenceAbilities, EssenceAbility, ActivatedAbility } from '../../definitions/class-definitions'
import { Tile } from '../tile/tile.component'
import { Bomb } from '../game-board-entities/bomb';
import { TheGame } from '../the-game.component';
import { Ability, SiphonTree, ThrowBomb, Invisibility, Upgrade, BombThrowRange } from './abilities-and-upgrades';

export class AbilitiesService{

  activatedAbilities: ActivatedAbility[];
  defaultAbilitiesList = {
    'Go Invisible': new Invisibility(this.theGame), /*
    new PlayerDetector(this.theGame),
    new Tentacle(this.theGame),
    new AcidTrap(this.theGame),
    new ForceField(this.theGame),
    new BuldTowerDefence(this.theGame), */
    'Siphon Tree': new SiphonTree(this.theGame),
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
    getActivatedAbilities(): ActivatedAbility[]{
      if(this.activatedAbilities){
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
  }
    

