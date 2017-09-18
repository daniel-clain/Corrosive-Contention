import { EssenceColour } from '../../definitions/enum-definitions';
import { Player } from '../player/player';
import {TheGame} from '../the-game.component';


export class AbilitiesList{


  abilities: Ability[] = [
    new Invisibility(this.theGame), /*
    new PlayerDetector(this.theGame),
    new Tentacle(this.theGame),
    new AcidTrap(this.theGame),
    new ForceField(this.theGame),
    new BuldTowerDefence(this.theGame), */
    new SiphonTree(this.theGame),
    new ThrowBomb(this.theGame), /*
    new MoveDetector(this.theGame) */
  ];
  upgrades: Upgrade[] = [
    new BombThrowRange(this.theGame), /*
    new SpeedIncrease(this.theGame),
    new HealthRegenration(this.theGame),
    new BombExplosionSize(this.theGame) */
  ];

  constructor(private theGame: TheGame){}
}


class Upgrade{
  upgradeLevel: number;
  maxUpgrades: number;
  purpleEssenceCost: number;
  thisEssenceCost: number;
  upgradeIcon: string;
  primaryEssenceColor: EssenceColour;
  protected theGame: TheGame

  constructor(theGame: TheGame){
    this.theGame = theGame;
  }

  doUpgrade(){
    if (this.upgradeLevel + 1 > this.maxUpgrades){
      console.log('Spell has already been ugraded to its maximum level (' + this.maxUpgrades + ')');
      return;
    }
    const playerThisEssence = this.theGame.mainPlayer.stats[this.primaryEssenceColor + 'Essence'];
    if (playerThisEssence < this.thisEssenceCost) {
      console.log('You do not have enough ' + this.primaryEssenceColor + ' essence. (' + playerThisEssence + '/' + this.thisEssenceCost + ')');
      return;
    }
    const playerPurpleEssence = this.theGame.mainPlayer.stats.purpleEssence;
    if (playerPurpleEssence < this.thisEssenceCost) {
      console.log('You do not have enough purple essence. (' + playerPurpleEssence + '/' + this.purpleEssenceCost + ')');
      return;
    }

    this.theGame.mainPlayer.stats[this.primaryEssenceColor + 'Essence'] = playerThisEssence - this.thisEssenceCost;
    this.theGame.mainPlayer.stats.purpleEssence = playerPurpleEssence - this.purpleEssenceCost;

    this.upgradeLevel++;
    this.upgradeEffect()
  }
  upgradeEffect(){};

  setTierStats(tier: UpgradeTiers){

    switch (tier){
      case 1: {
        this.purpleEssenceCost = 0;
        this.thisEssenceCost = 1;
        this.maxUpgrades = 3;
      }; break;
      case 2: {
        this.purpleEssenceCost = 1;
        this.thisEssenceCost = 3;
        this.maxUpgrades = 2;
      }; break;
      case 3: {
        this.purpleEssenceCost = 2;
        this.thisEssenceCost = 5;
        this.maxUpgrades = 1;
      }; break;
    }
  }

}

enum UpgradeTiers{
  'One' = 1,
  'Two',
  'Three'
}

class Ability{
  icon: string;
  useAbility(): Boolean{
    this.abilityEffect()
    return true;
  }
  abilityEffect(){}
}

class ActivatedAbility extends Ability{
  cooldown: number;
  onCooldown = false;

  constructor(protected theGame: TheGame){
    super()
  }

  useAbility(): Boolean{
    if (!this.onCooldown){
      this.startCooldown()
      return super.useAbility()
    } else {
      console.log('can use ability - on cooldown')
      return false;
    }
  }

  private startCooldown(){
    this.onCooldown = true;
    this.theGame.gameHud.refreshHudComponent();
    setTimeout(() => {
      this.onCooldown = false;
    }, this.cooldown)
  }
}

interface EssenceAbility extends Ability{
  primaryEssenceColor: EssenceColour;
}

class Invisibility implements ActivatedAbility, Upgrade{
  upgradeLevel;
  onCooldown;
  icon = '';
  upgradeIcon = '';
  cooldown = 5;
  primaryEssenceColor: EssenceColour = EssenceColour.blue

  private invisibleDuration = 1

  constructor(private theGame: TheGame){
    this.maxUpgrades = super.maxUpgrades
    this.upgradeLevel = 0;
    this.setTierStats('One')
  }
  setTierStats(tier: tier){
    super.setTierStats(tier)
  }

  useAbility(): Boolean{
  }

  doUpgrade(){
    super.upgradeEffect = this.upgradeEffect;
    super.doUpgrade();
  }

  upgradeEffect() {
    this.invisibleDuration = this.upgradeLevel * 2;
  }
  abilityEffect(){
    const player = this.theGame.mainPlayer;
    player.status.push('invisible')
    player.refreshPlayerComponent();
    setTimeout(() => {
      player.status.splice(player.status.indexOf('invisible'), 1)
      player.refreshPlayerComponent();
    }, this.invisibleDuration)

  }
}


