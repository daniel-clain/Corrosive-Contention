import { ChangeDetectorRef } from '@angular/core';
import { Tile } from './tile/tile.component';
import { Player } from './player/player';
import { GameBoardEntity } from './../definitions/interface-definitions';
import { Loot, Explosion, GameSettings } from './../definitions/class-definitions';

export class TileService{
    constructor(private tiles: Tile[], private gameSettings: GameSettings) {}


    checkIfBombHitsAnything(tile: Tile){
        let whatsInTile: GameBoardEntity = tile.checkWhatsInTile()
        if(whatsInTile === null || whatsInTile !instanceof Loot){
            
            console.log('bomb hit')
            return true;
        }
        else false;
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
      case 'bottom right': columnAndRow = {row: this.gameSettings.gameRows-3, col: this.gameSettings.gameCols-3}; break;
      case 'top right': columnAndRow = {row: 3, col: this.gameSettings.gameCols-3}; break;
      case 'bottom left': columnAndRow = {row: this.gameSettings.gameRows-3, col: 3}; break;
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

  getTileRelativeToAnotherTile(baseTile: Tile, direction: string): Tile{
    if(direction === 'up'){
      if(baseTile.row === 1){
        console.log('no above tile')
      }else{
        return this.getTileByColumnAndRow(baseTile.column, baseTile.row - 1)
      }
    }
    if(direction === 'down'){
      if(baseTile.row === this.gameSettings.gameRows){
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
      if(baseTile.column === this.gameSettings.gameCols){
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

  getDestinationTile(tile: Tile, direction: string): Tile{
    let destinationTile
    if(direction === 'up'){
        if(tile.row === 1)return;
        destinationTile = this.getTileByColumnAndRow(tile.column, tile.row - 1);
    }
    if(direction === 'right'){
        if(tile.column === this.gameSettings.gameCols)return;
        destinationTile = this.getTileByColumnAndRow(tile.column + 1, tile.row);
    }
    if(direction === 'down'){
        if(tile.row === this.gameSettings.gameRows)return;
        destinationTile = this.getTileByColumnAndRow(tile.column, tile.row + 1);
    }
    if(direction === 'left'){
        if(tile.column === 1)return;
        destinationTile = this.getTileByColumnAndRow(tile.column - 1, tile.row);
    }
    if(!destinationTile){
        console.log('destination tile out of bounds')
    }else{
        return destinationTile
    }
  }
}