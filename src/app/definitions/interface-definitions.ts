import { ViewRef } from '@angular/core';
import { Explosion, TreeAcid, PlayerStats } from './class-definitions';
import { Tile } from '../the-game/tile/tile.component';
import { Player } from '../the-game/player/player.component';
import { Ability } from '../the-game/abilities-and-upgrades/abilities-and-upgrades';
import { Bomb } from '../the-game/game-board-entities/bomb';
import { Tree } from '../the-game/game-board-entities/tree';
import { Loot } from '../the-game/game-board-entities/loot';
import { AbilityName } from './enum-definitions';
import {TheGame} from '../the-game/the-game.component';

export interface PlayerDefinition{
    playerNumber: number;
    facing: string;
    tile: Tile;
    stats: PlayerStats
    abilities: Ability[]
    startLocation: Tile;
    playerIsOut: Boolean;
    move(direction: string);
    useAbility(ability: AbilityName);
    hitByExplosion(explosion: Explosion);
    hitByTreeAcid(explosion: TreeAcid);
    playerHealthChange(health: number)
    playerDies();
    pickUpLoot(loot: Loot);
}


export interface TileInterface{
  column: number;
  row: number;
  id: number;
  treeInTile: Tree;
  playerInTile: Player;
  bombInTile: Bomb;
  lootInTile: Loot;
}

export interface GameBoardEntity{
  theGame: TheGame;
  tile: Tile;
  setLocation: Function;
  elementRef: ViewRef;
  remove: Function;
  ngOnInit: Function;
  topVal: number;
  leftVal: number;
}

