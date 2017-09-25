Feature: Start Game

Scenario: Start application and automatically start game 
    Given The landing page has loaded
    When The connection to the game host is made
    And The game has enough people in que for a full game
    Then The game should load the boad
    And should load the hud
    And should place all the trees
    And should place all the players in their start location