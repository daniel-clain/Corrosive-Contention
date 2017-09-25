import { EssenceColour } from '../../definitions/enum-definitions';
import { Bomb } from '../game-board-entities/bomb';
import { Player } from '../player/player.component';
import { TheGame } from '../the-game.component';
import { Tile } from '../tile/tile.component';


export class Upgrade{
  upgradeLevel: number = 0;
  maxUpgrades: number;
  purpleEssenceCost: number;
  thisEssenceCost: number;
  upgradeIcon: string;
  primaryEssenceColor: EssenceColour;

  constructor(protected theGame: TheGame){}

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

export class Ability extends Upgrade{
  icon: string;
  coolDown: number;
  onCoolDown: Boolean;
  constructor(protected theGame: TheGame){
    super(theGame)
  }
  
  abilityEffect(){}

  
  useAbility(): Boolean{
    if (!this.onCoolDown){
      this.startCooldown();
      this.abilityEffect();
    } else {
      console.log('can use ability - on cooldown')
      return false;
    }
  }

  startCooldown(){
    this.onCoolDown = true;
    this.theGame.gameHud.refreshHudComponent();
    setTimeout(() => {
      this.onCoolDown = false;
    }, this.coolDown)
  }

  doUpgrade(){
    super.doUpgrade()
  }

}



interface EssenceAbility /*extends Ability*/{
  primaryEssenceColor: EssenceColour;
}

interface Tier{
  purpleEssenceCost: number;
  thisEssenceCost: number;
  maxUpgrades: number;
}

class Tier1 extends Upgrade implements Tier{
  purpleEssenceCost = 0;
  thisEssenceCost = 1;
  maxUpgrades = 3
}
class Tier2 extends Upgrade implements Tier{
  purpleEssenceCost = 1;
  thisEssenceCost = 2;
  maxUpgrades = 2;
}
class Tier3 extends Upgrade implements Tier{
  purpleEssenceCost = 2;
  thisEssenceCost = 3;
  maxUpgrades = 1;
}

interface UpgradableAbility{
  upgradeLevel;
  upgradeIcon: string;
  icon: string;
  primaryEssenceColor: EssenceColour
  maxUpgrades: number;

}

export class Invisibility extends Ability/*, ActivatedAbility*/{
  onCoolDown;
  icon = '';
  upgradeIcon = '';
  coolDown = 5;
  primaryEssenceColor: EssenceColour = EssenceColour.blue
  private invisibleDuration = 1

  constructor(protected theGame: TheGame){
    super(theGame)
  }

  useAbility(): Boolean{
    this.abilityEffect();
    return true;
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

  doUpgrade(){
    super.upgradeEffect = this.upgradeEffect;
    super.doUpgrade();
  }

  upgradeEffect() {
    this.invisibleDuration = this.upgradeLevel * 2;
  }
}

export class SiphonTree extends Ability{

  
  constructor(protected theGame: TheGame){
    super(theGame);
  }

  useAbility(): Boolean{
    this.abilityEffect();
    return true;
  }
  
  abilityEffect(){
    const targetTile: Tile = this.theGame.tileService.getTileRelativeToAnotherTile(this.theGame.mainPlayer.tile, this.theGame.mainPlayer.facing);
    if (targetTile && targetTile.treeInTile){
      if (targetTile.treeInTile.isVolatile){
        targetTile.treeInTile.treeExplode();
        console.log('tree is volatile and exploded');
        this.theGame.broadcastEventToOtherPlayers('treeExplode update', { tileId: targetTile.id });
      } else {
          targetTile.treeInTile.treeIsSiphoned();
      }
    }
  }

}


export class ThrowBomb extends Ability{
  abilityEffect(){
    const bomb: Bomb = new Bomb(this.theGame.mainPlayer, this.theGame.tileService);
    bomb.tile.entityEnterTile(bomb);
    bomb.bombTravel();
    this.theGame.broadcastEventToOtherPlayers('player throwBomb update', { playerNumber: this.theGame.mainPlayer.playerNumber });
  };
}
export class BombThrowRange extends Upgrade{

}