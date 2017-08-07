import { PlayerDefinition } from '../../class-definitions/class-definitions'
import { Direction, Explosion, FailOrSucceed, Ability, TreeAcid, PlayerStats, Bomb, EssenceColour, BombItem, Loot } from '../../type-definitions/type-definitions'
import { Tile } from '../../the-game/tile/tile'
import { GameService } from '../../the-game/game-service';
import { ConnectionService } from '../../connection-service/connection-service'
import { Observable, Subject } from 'rxjs/Rx';


export class Player implements PlayerDefinition{
    playerNumber: number;
    facing: Direction;
    playerTile: Tile;
    stats: PlayerStats = new PlayerStats();
    startLocation: Tile;
    playerIsOut: Boolean;
    ableToMove: Boolean = true;
    moveCycleContinue: Boolean;
    moveCycle: any;
    startTimer
    counter

    constructor(playerNumber: number, private gameService: GameService, private connectionService: ConnectionService){
        this.playerNumber = playerNumber;
        
        Observable.fromEvent(document,'keydown').map(event => event['key']).subscribe(key => this.keyboardEvents(key, 'down'))
        Observable.fromEvent(document,'keyup').map(event => event['key']).subscribe(key => this.keyboardEvents(key, 'up'))
    }
    EssenceColour

    useAbility(ability: Ability): FailOrSucceed{
        if(ability === Ability['Siphon Tree']){
            this.siphonTree()
        }
        if(ability === Ability['Throw Bomb']){
            if(this.stats.bombs >= 1){
                this.throwBomb()
                this.stats.bombs--
                this.gameService.gameComponent.updateBombs(this.stats.bombs)
            }
        }

        return <FailOrSucceed>{ FailOrSucceed: true }
    };
    throwBomb(): FailOrSucceed{
        console.log('throwing bomb')
        let bomb: Bomb = new Bomb(this.facing, this.stats.bombExplosionSize, this.stats.bombThrowRange)
        this.playerTile.bombEnterTile(bomb, bomb.direction)
        this.gameService.bombTravel(bomb, this.playerTile)

        return <FailOrSucceed>{ FailOrSucceed: true }
    };
    siphonTree(){
        console.log('siphon tree')
        let targetTile = this.gameService.getTileRelativeToAnotherTile(this.playerTile, this.facing)
        if(targetTile && targetTile.treeInTile){
            if(targetTile.volatileTree){
                console.log('bang!')
                targetTile.treeExplode()
                this.playerHealthChange(-1)

            } else {
                let fiftyPercentChanceForBombToDrop: Boolean = this.gameService.percentageChance(50)
                if(fiftyPercentChanceForBombToDrop){
                    let bombs = BombItem.oneBomb
                    let fivePercentChanceForThreeBombs: Boolean = this.gameService.percentageChance(5)
                    if(fivePercentChanceForThreeBombs){
                        bombs = BombItem.threeBombs
                    }
                    targetTile.bombItemEnterTile(bombs);
                }
                let seventyPercentChanceForEssenceToDrop: Boolean = this.gameService.percentageChance(70)
                if(seventyPercentChanceForEssenceToDrop){
                    let numberOfColours = Object.keys(EssenceColour).length/2
                    let randomColour: EssenceColour = Math.floor(Math.random()*numberOfColours)
                    let randomPositionX: number = Math.floor(Math.random()*50)
                    let randomPositionY: number = Math.floor(Math.random()*50)
                    targetTile.essenceEnterTile(randomColour, randomPositionX, randomPositionY);
                }
                targetTile.treeLeaveTile();
            }
        }

        return <FailOrSucceed>{ FailOrSucceed: true }
    }

    pickUpLoot(loot: Loot){
        if(loot.bombs){
            this.stats.bombs += loot.bombs
            this.gameService.gameComponent.updateBombs(this.stats.bombs)
        }
        if(loot.essenceColour === EssenceColour.blue){
            this.stats.blueEssence++
            this.gameService.gameComponent.updateBlue(this.stats.blueEssence)
        }
        if(loot.essenceColour === EssenceColour.green){
            this.stats.greenEssence++
            this.gameService.gameComponent.updateGreen(this.stats.greenEssence)
        }
        if(loot.essenceColour === EssenceColour.yellow){
            this.stats.yellowEssence++
            this.gameService.gameComponent.updateYellow(this.stats.yellowEssence)
        }
        if(loot.essenceColour === EssenceColour.purple){
            this.stats.purpleEssence++
            this.gameService.gameComponent.updatePurple(this.stats.purpleEssence)
        }
    }

  moveToStartLocation(){
    this.startLocation = this.gameService.getTileByPlayerStartLocation(this.playerNumber);
    this.facing = Direction.down;
    this.moveIntoTile(this.startLocation);
    let surroundingTiles = this.gameService.getTilesWithXRadius(1, this.startLocation)
    surroundingTiles.forEach(tile => tile.treeLeaveTile());
  }

    
  playerHealthChange(health: number){
    this.stats.health += health
    this.gameService.gameComponent.updateHealth(this.stats.health)
    console.log('players health: ' + this.stats.health)
    if(this.stats.health <= 0) this.playerDies()
  }

  playerDies(){
    let deathTile = this.gameService.getTileById(this.playerTile.id)
    this.stats.lives--
    this.gameService.gameComponent.updateLives(this.stats.lives)
    console.log('player has died, lives left: ' + this.stats.lives)
    if(this.stats.lives <= 0 ){
        console.log('Game Over!');
        this.playerIsOut = true;
    }else {
      this.stats.health = this.stats.maxHealth
      this.stats.bombs = this.stats.maximumBombs
      this.gameService.gameComponent.updateHealth(this.stats.health)
      this.playerTile.playerLeaveTile(this);
      this.moveToStartLocation()
      this.gameService.sendPacket({
        eventName: 'player move update',
        data: {
          enteringTileId: this.playerTile.id,
          leavingTileId: deathTile.id,
          playerNumber: this.playerNumber
        }
      })

    }
  }
    hitByExplosion(explosion: Explosion){};
    hitByTreeAcid(explosion: TreeAcid){};
    setFacingDirection(){}



    keyboardEvents(key, action){

        let direction: Direction
        if(!this.playerIsOut){
            if(action==='down'){
                switch (key) {
                    case 'ArrowUp': { direction = Direction.up }; break;
                    case 'ArrowRight': { direction = Direction.right } ; break;
                    case 'ArrowDown': { direction = Direction.down } ; break;
                    case 'ArrowLeft': { direction = Direction.left } ; break;
                    case 'r': this.useAbility(Ability['Siphon Tree']); break;
                    case ' ': this.useAbility(Ability['Throw Bomb']); break;
                }
                if(direction in Direction && this.ableToMove){
                    let pass
                    if(this.facing !== direction){
                        this.moveCycleContinue = false
                        this.ableToMove
                        this.facing = direction
                        pass=true
                    }

                    if(this.ableToMove){
                        this.move()
                    }
                }
            }

            if(action==='up'){
                switch (key) {
                case 'ArrowUp': {
                    console.log('up released')
                    this.moveCycleContinue = false;
                }; break;
                case 'ArrowRight': {
                    console.log('right released')
                    this.moveCycleContinue = false;
                } ; break;
                case 'ArrowDown': {
                    console.log('down released')
                    this.moveCycleContinue = false;
                } ; break;
                case 'ArrowLeft': {
                    console.log('left released')
                    this.moveCycleContinue = false;
                } ; break;
                }
            }
        }
    }

    
    moveIntoTile(tile: Tile){
        tile.playerEnterTile(this);
        this.gameService.moveBoard(this.playerTile)
    }

    move(): FailOrSucceed{
        let playerTile = this.gameService.getTileById(this.playerTile.id);
        let destinationTile: Tile;
        if(this.facing === Direction.up){
            if(playerTile.row === 1)return;
            destinationTile = this.gameService.getTileByColumnAndRow(playerTile.column, playerTile.row - 1);
        }
        if(this.facing === Direction.right){
            if(playerTile.column === this.gameService.gameCols)return;
            destinationTile = this.gameService.getTileByColumnAndRow(playerTile.column + 1, playerTile.row);
        }
        if(this.facing === Direction.down){
            if(playerTile.row === this.gameService.gameRows)return;
            destinationTile = this.gameService.getTileByColumnAndRow(playerTile.column, playerTile.row + 1);
        }
        if(this.facing === Direction.left){
            if(playerTile.column === 1)return;
            destinationTile = this.gameService.getTileByColumnAndRow(playerTile.column - 1, playerTile.row);
        }
        let movingOut = playerTile.playerMovingOutOfTile(this.facing)
        let movingIn = destinationTile.playerMovingInToTile(this.facing)

        if(movingIn){
            destinationTile.tileComponent.setPlayerFacingDirection(this.facing);
        }else {
            playerTile.tileComponent.setPlayerFacingDirection(this.facing);
        }


        if(movingOut && movingIn){
            clearTimeout(this.moveCycle)

            this.moveCycleContinue = true;
            this.ableToMove = false;
            playerTile.playerLeaveTile(this);

            console.log('counterx: ', this.counter)
            this.counter = 0
            
            this.startTimer = setInterval(() => this.counter++ ,1)


            let movingIntoTile = setTimeout(() => {
                clearInterval(this.startTimer)
                console.log('counter: ', this.counter)
                console.log('player move')
                this.moveIntoTile(destinationTile)
                this.ableToMove = true;
            }, 400)
            
            this.moveCycle = setTimeout(() => {
                if(this.moveCycleContinue){
                    this.move()
                }
            }, 400);

            this.gameService.moveBoard(destinationTile)
            this.gameService.sendPacket({
                eventName: 'player move update',
                data: {
                    enteringTileId: destinationTile.id,
                    leavingTileId: playerTile.id,
                    facing: this.facing,
                    playerNumber: this.playerNumber
                }
            })
        }else if(!movingIn){
            this.ableToMove=true
        }


        return <FailOrSucceed>{ FailOrSucceed: true }
    };


}