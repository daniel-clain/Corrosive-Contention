import { Component, HostListener } from '@angular/core';
import { GameController } from './game-controller';
import { WindowDimensions, TileData } from '../type-definitions/type-definitions'
import { Subject } from 'rxjs/Subject'
import { Tile } from './tile/tile';
import { TheGame } from './the-game';


@Component({
  selector: 'the-game',
  templateUrl: 'the-game.component.html'
})
export class GameComponent {
  gameActive: Boolean;
  showBoard: Boolean;
  tiles: TileData[];
  boardWidth
  topVal = 0
  leftVal = 0
  hud
  
  windowResizeSubject = new Subject()
  
  constructor(gameController: GameController) {
    gameController.registerGameComponent(this)
    this.hud = new Hud()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let windowDimensions: WindowDimensions = {
      height: event.target.innerHeight, 
      width: event.target.innerWidth
    }
    this.windowResizeSubject.next(windowDimensions);
  }
  
  watchForWindowResizeEvent(): Subject<WindowDimensions>{
    return this.windowResizeSubject
  }

  renderGameBoard(columns, rows, tileSize){
    this.tiles = []
    let columnCount = 1, rowCount = 1;
    for(let i = 0; i < columns*rows; i++){
      let random_x: number = this.getRandomBg('x', tileSize)
      let random_y = this.getRandomBg('y', tileSize)
      this.tiles.push({id: i, column: columnCount, row: rowCount, bgx: random_x, bgy: random_y, size: tileSize })
      columnCount ++
      if(columnCount > columns){
        rowCount ++
        columnCount = 1
      }
    }
    this.boardWidth = tileSize*columns
    this.showBoard = true;
  }

  getRandomBg(dimension, tileSize:number){
    if(dimension === 'x'){
     let num = 512 - tileSize
      return Math.floor(Math.random()*num)*-1;
    }else {
     let num = 512 - tileSize
      return Math.floor(Math.random()*num)*-1;
    }
  }

  updateHealth(health){
    this.hud.health = health
  }
  updateLives(lives){
    this.hud.lives = lives
  }
  updateBombs(bombs){
    this.hud.bombs = bombs
  }
  updateBlue(blue){
    this.hud.blue = blue
  }
  updateGreen(green){
    this.hud.green = green
  }
  updateYellow(yellow){
    this.hud.yellow = yellow
  }
  updatePurple(purple){
    this.hud.purple = purple
  }
}


class Hud{
  lives: number;
  health: number;
  bombs: number;
  blue: number = 0;
  yellow: number = 0;
  green: number = 0;
  purple: number = 0;
}

