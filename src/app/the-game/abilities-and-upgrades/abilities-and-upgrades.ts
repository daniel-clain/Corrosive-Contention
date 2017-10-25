import { EssenceColour, BombItem, AbilityName } from '../../definitions/enum-definitions';
import { Tree } from '../game-board-entities/tree';
import { Bomb } from '../game-board-entities/bomb';
import { VolatileDetector } from '../game-board-entities/volatile-detector';

import { CreateGameBoardEntityObject } from '../../definitions/class-definitions'

import { Player } from '../player/player.component';
import { TheGame } from '../the-game.component';
import { Tile } from '../tile/tile.component';
import {GameBoardEntity} from '../../definitions/interface-definitions';

export class Upgrade{
  upgradeLevel = 0;
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
    const playerThisEssence = this.theGame.mainPlayer.stats[EssenceColour[this.primaryEssenceColor] + 'Essence'];
    if (playerThisEssence < this.thisEssenceCost) {
      console.log('You do not have enough ' + EssenceColour[this.primaryEssenceColor] + ' essence. (' + playerThisEssence + '/' + this.thisEssenceCost + ')');
      return;
    }
    const playerPurpleEssence = this.theGame.mainPlayer.stats.purpleEssence;
    if (playerPurpleEssence < this.purpleEssenceCost) {
      console.log('You do not have enough purple essence. (' + playerPurpleEssence + '/' + this.purpleEssenceCost + ')');
      return;
    }

    this.theGame.mainPlayer.stats[EssenceColour[this.primaryEssenceColor] + 'Essence'] = playerThisEssence - this.thisEssenceCost;
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
  onCoolDown = false;
  triggerKey: string;
  constructor(protected theGame: TheGame){
    super(theGame)
  }
  useAbility(player: Player, x?: any): Boolean{
    if (this.upgradeLevel > 0){
      if (!this.onCoolDown ){
        this.startCooldown();
        return true;
      } else {
        console.log('can use ability - on cooldown')
        return false;
      }
    }else{
      console.log('you dont have any points in this ability yet')
      return false;
    }
  }

  startCooldown(){
    this.onCoolDown = true;
    this.theGame.gameHud.refreshHudComponent();
    setTimeout(() => {
      this.onCoolDown = false;
      this.theGame.gameHud.refreshHudComponent();
    }, this.coolDown)
  }

  doUpgrade(){
    super.doUpgrade()
  }

}


/*
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
}*/


export class EssenceAbilities{
    blue: EssenceAbility[];
    yellow: EssenceAbility[];
    green: EssenceAbility[];
    purple: EssenceAbility[];
}





export class UpgradeableAbility extends Ability{
  upgradeLevel: number;
  upgradeIcon: string;
  icon: string;
  primaryEssenceColor: EssenceColour
  maxUpgrades: number;
}


export class EssenceAbility extends UpgradeableAbility{
  primaryEssenceColor: EssenceColour;
  purpleEssenceCost: number;
  thisEssenceCost: number;
  maxUpgrades: number;
}

export interface ActivatedAbilityInterface{
  onCoolDown: boolean;
  coolDown: number;
  useAbility: Function;
  abilityEffect: Function;
  triggerKey: string;
}


export class Invisibility extends EssenceAbility implements EssenceAbility, UpgradeableAbility, ActivatedAbilityInterface{
  onCoolDown = false;
  icon = '';
  upgradeIcon = '';
  coolDown = 20;
  primaryEssenceColor: EssenceColour = EssenceColour.blue
  purpleEssenceCost = 0;
  thisEssenceCost = 1;
  maxUpgrades = 3
  private invisibleDuration: number;

  constructor(protected theGame: TheGame){
    super(theGame)
  }

  useAbility(player: Player,): Boolean{
    if (super.useAbility(player)){
      this.abilityEffect();
      return true;
    }
  }


  abilityEffect(){
    const player = this.theGame.mainPlayer;
    player.setStatus('invisible', true);
    setTimeout(() => {
      player.setStatus('invisible', false);
  }, this.invisibleDuration * 1000)

  }

  doUpgrade(){
    super.upgradeEffect = this.upgradeEffect;
    super.doUpgrade();
  }

  upgradeEffect() {
    this.invisibleDuration = this.upgradeLevel * 2;
  }
}


export class DragVolatileDetector extends Ability implements ActivatedAbilityInterface{
  constructor(protected theGame: TheGame){
    super(theGame);
    this.upgradeLevel = 1;
    this.triggerKey = 'leftShift';
  }

  useAbility(player: Player,): Boolean{
    if (super.useAbility(player)){
      this.abilityEffect();
      return true;
    }
  }

  abilityEffect(){
    console.log('drag volatile detector abilityEffect()')
  }

}


export class ActivateVolatileDetector extends Ability implements ActivatedAbilityInterface{
  constructor(protected theGame: TheGame){
    super(theGame);
    this.upgradeLevel = 1;
  }

  useAbility(player: Player, volatileDetector: VolatileDetector): Boolean{
    if (super.useAbility(player)){
      this.abilityEffect(volatileDetector);
      return true;
    }
  }

  abilityEffect(volatileDetector: VolatileDetector){
    volatileDetector.start()
  }

}


export class Interact extends Ability{

  siphonTreeAbility: SiphonTree;
  activateVolatileDetectorAbility: ActivateVolatileDetector;

  constructor(protected theGame: TheGame){
    super(theGame)
    this.triggerKey = 'r';
    this.upgradeLevel = 1;
  }

  useAbility(player: Player): Boolean{
    if (super.useAbility(player)){
      this.abilityEffect(player);
      return true;
    }
  }

  abilityEffect(player: Player){
    const interactionTarget: GameBoardEntity = this.getInteractionTarget()
    if (interactionTarget && interactionTarget instanceof Tree){
      (this.siphonTreeAbility || (this.siphonTreeAbility = new SiphonTree(this.theGame))).useAbility(player);
    }
    if (interactionTarget instanceof VolatileDetector){
      (this.activateVolatileDetectorAbility || (this.activateVolatileDetectorAbility = new ActivateVolatileDetector(this.theGame)))
      this.activateVolatileDetectorAbility.useAbility(player, interactionTarget);
    }
  }

  getInteractionTarget(): GameBoardEntity{
    const player: Player = this.theGame.mainPlayer;
    const targetTile: Tile = this.theGame.getDestinationTile(player.tile, player.status.facing)
    return targetTile && targetTile.checkWhatsInTile()

  }

}


export class SiphonTree extends Ability{
  upgradeLevel = 1;

  constructor(protected theGame: TheGame){
    super(theGame);
  }

  useAbility(player: Player,): Boolean{
    if (super.useAbility(player)){
      this.abilityEffect();
      return true;
    }
  }


  abilityEffect(){
    const targetTile: Tile = this.theGame.getTileRelativeToAnotherTile(this.theGame.mainPlayer.tile, this.theGame.mainPlayer.status.facing);
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
  upgradeLevel = 1;

  useAbility(player: Player): Boolean{
    if (super.useAbility(player)){
      player.stats.bombs > 0 ? this.abilityEffect(player) : console.log('player doesn\'t have any bombs');
      return true;
    }
  }


  abilityEffect(player: Player){
    player.stats.bombs--;
    const createBombObject: CreateGameBoardEntityObject = {
      template: this.theGame.bombTemplate,
      tile: player.tile,
      assets: [
        {name: 'player', value: player},
      ]
    };
    this.theGame.createGameBoardEntityComponent(createBombObject)
    this.theGame.broadcastEventToOtherPlayers('player throwBomb update', { playerNumber: this.theGame.mainPlayer.playerNumber });
  };
}
export class BombThrowRange extends Upgrade{
  doUpgrade(){
    super.doUpgrade();
  }
}
