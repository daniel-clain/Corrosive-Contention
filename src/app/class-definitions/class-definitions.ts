import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, Loot, Packet } from '../type-definitions/type-definitions'
import { Tile } from '../the-game/tile/tile';
import { Player } from'../the-game/player/player';

export interface PlayerDefinition{
    playerNumber: number;
    facing: Direction;
    playerTile: Tile;
    stats: PlayerStats
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean;
    move(direction: Direction): FailOrSucceed;
    useAbility(ability: Ability): FailOrSucceed;
    throwBomb(): FailOrSucceed;
    siphonTree(): FailOrSucceed;
    hitByExplosion(explosion: Explosion);
    hitByTreeAcid(explosion: TreeAcid);
    setFacingDirection(direction: Direction)
    playerHealthChange(health: number)
    playerDies()
    pickUpLoot(loot: Loot)
}

export interface PlayerServiceDefinition{
    move(direction: Direction, player: Player): FailOrSucceed;
    useAbility(ability: Ability, player: Player): FailOrSucceed;
    throwBomb(player: Player): FailOrSucceed;
    siphonTree(player: Player): FailOrSucceed;
    hitByExplosion(explosion: Explosion, player: Player);
    hitByTreeAcid(explosion: TreeAcid, player: Player);
    setFacingDirection(direction: Direction, player: Player)
    playerHealthChange(health: number, player: Player)
    playerDies(player: Player)
    pickUpLoot(loot: Loot, player: Player)
    manageEventsFromServer(serverEvent: Packet)
    playerMoveEvent(data: any)

}


export interface UserControlledPlayerDefinition{
    player: Player;
    name: string;
    connectedToHost: Boolean;
    queForGame()
    setName(name: string)
    keyboardEvents(key: string, action: string);
}