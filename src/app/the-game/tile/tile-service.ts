import {TheGame} from "../the-game";
import { GameController } from '../game-controller';
import { Tile } from './tile';


export class TileService{
  tiles: Tile[] = []
  gameCols = 30
  gameRows = 20


  getRandomTile(): Tile{
    return this.tiles[Math.round(Math.random()*(this.tiles.length - 1))]
  }

  getTileByPlayerStartLocation(playerNumber: number): Tile{
    let describedLocation
    switch(playerNumber){
      case 1: describedLocation = 'top left'; break;
      case 2: describedLocation = 'bottom right'; break;
      case 3: describedLocation = 'top right'; break;
      case 4: describedLocation = 'bottom left'; break;
    }
    return this.getTileByDescribedLocation(describedLocation)
  }

  getTileByDescribedLocation(location: string): Tile{
    let columnAndRow
    switch(location){
      case 'top left': columnAndRow = {row: 3, col: 3}; break;
      case 'bottom right': columnAndRow = {row: this.gameRows-3, col: this.gameCols-3}; break;
      case 'top right': columnAndRow = {row: 3, col: this.gameCols-3}; break;
      case 'bottom left': columnAndRow = {row: this.gameRows-3, col: 3}; break;
    }
    return this.getTileByColumnAndRow(columnAndRow.col, columnAndRow.row)
  }

  getTileByColumnAndRow(column, row): Tile{
    for(let i = 0; this.tiles.length; i++){
      if(this.tiles[i].column === column && this.tiles[i].row === row){
        return this.tiles[i];
      }
    }
  }

  getTileRelativeToAnotherTile(baseTileId: number, direction: string): Tile{
    let baseTile = this.getTileById(baseTileId)
    if(direction === 'up'){
      if(baseTile.row === 1){
        console.log('no above tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column, baseTile.row - 1)
      }
    }
    if(direction === 'down'){
      if(baseTile.row === this.gameRows){
        console.log('no below tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column, baseTile.row + 1)
      }
    }
    if(direction === 'left'){
      if(baseTile.column === 1){
        console.log('no left tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column - 1, baseTile.row)
      }
    }
    if(direction === 'right'){
      if(baseTile.column === this.gameCols){
        console.log('no right tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column + 1, baseTile.row)
      }
    }
  }

  getTileById(id): Tile{
    for(let i = 0; this.tiles.length; i++){
      if(this.tiles[i].id === id){
        return this.tiles[i];
      }
    }
  }

  getTilesWithXRadius(radius: number, centerTile: Tile): Tile[]{
    let matchingTiles: Tile[] = []
    for(let i = 0; i < this.tiles.length; i++){
      let ok = true;
      if(this.tiles[i].column >= (centerTile.column - radius)){
        if(this.tiles[i].column <= (centerTile.column + radius)){
          if(this.tiles[i].row >= (centerTile.row - radius)){
            if(this.tiles[i].row <= centerTile.row + radius){
              matchingTiles.push(this.tiles[i])
            }
          }
        }
      }
    }

    return matchingTiles
  }

}
