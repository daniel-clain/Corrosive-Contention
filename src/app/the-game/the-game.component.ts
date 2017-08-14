import { Component, HostListener, ChangeDetectorRef } from '@angular/core';
import { WindowDimensions, TileData, Hud, HudItem } from '../type-definitions/type-definitions';
import { Subject } from 'rxjs/Subject';
import { Tile } from './tile/tile';
import { RegisterComponentsService } from './register-components-service';


@Component({
  selector: 'the-game',
  templateUrl: 'the-game.component.html'
})
export class GameComponent {
  showBoard: Boolean;
  tiles: TileData[];
  boardWidth;
  topVal = 0;
  leftVal = 0;
  hud;

  windowResizeSubject = new Subject();

  constructor(private registerComponentsService: RegisterComponentsService, private cdRef: ChangeDetectorRef) {
    registerComponentsService.registerGameComponent(this);
    this.hud = new Hud();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const windowDimensions: WindowDimensions = {
      height: event.target.innerHeight,
      width: event.target.innerWidth
    };
    this.windowResizeSubject.next(windowDimensions);
  }


  watchForWindowResizeEvent(): Subject<WindowDimensions>{
    return this.windowResizeSubject;
  }

  renderGameBoard(columns, rows, tileSize){
    this.tiles = [];
    let columnCount = 1, rowCount = 1;
    for (let i = 0; i < columns * rows; i++){
      const random_x: number = this.getRandomBg('x', tileSize);
      const random_y = this.getRandomBg('y', tileSize);
      this.tiles.push({id: i, column: columnCount, row: rowCount, bgx: random_x, bgy: random_y, size: tileSize });
      columnCount ++;
      if (columnCount > columns){
        rowCount ++;
        columnCount = 1;
      }
    }
    this.boardWidth = tileSize * columns;
    this.showBoard = true;
  }

  getRandomBg(dimension, tileSize: number){
    if (dimension === 'x'){
     const num = 512 - tileSize;
      return Math.floor(Math.random() * num) * -1;
    }else {
     const num = 512 - tileSize;
      return Math.floor(Math.random() * num) * -1;
    }
  }
  gameBoardMove(top: number, left: number){
    this.cdRef.detach();
    this.topVal = top;
    this.leftVal = left;
    this.cdRef.detectChanges();
  }

  updateHud(hudItem: HudItem, value: number){
    console.log('hud update');
    this.cdRef.detach();
    this.hud[HudItem[hudItem]] = value;
    this.cdRef.detectChanges();
  }

  setHudObject(hudObject: Hud){
    this.cdRef.detach();
    this.hud = hudObject;
    this.cdRef.detectChanges();
  }
}




