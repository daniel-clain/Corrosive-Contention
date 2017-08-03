import { Component, OnInit } from '@angular/core';
import { ServerGameObject } from './type-definitions/type-definitions'
import { GameController } from './the-game/game-controller';
import { TheGame } from './the-game/the-game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  game: TheGame;
  gameActive: Boolean;
  test

  constructor(private gameController: GameController){
    this.gameController.listenForServerEvents().subscribe(
      serverEvent => this.manageEventsFromServer(serverEvent)
    )
  }

  ngOnInit(){
    this.queForGame()
  }

  manageEventsFromServer(serverEvent){
    let eventsObject = {
      "game found": serverEvent => this.gameFound(serverEvent)
    }
    if(eventsObject[serverEvent.eventName]){
      eventsObject[serverEvent.eventName](serverEvent.data)
    }
  }


  queForGame(){
    this.gameController.sendPacket({eventName:'searching for game'})
  }

  gameFound(fromServerData){
    this.game = new TheGame(this.gameController)
    this.game.setServerGameData(<ServerGameObject>fromServerData)
    this.gameActive = true;
  }

}
