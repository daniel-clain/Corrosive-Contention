Feature: Ability Upgrade

Scenario: Player selects and Upgrade

    Given one of the glowing essence has been selected
    And the the upgrade options are being displayed
    When the player selects the upgrade
    And the player has enough of the right coloured points to afford it
    Then the upgrade effect will make it relative change to the game
    And the points spent for the upgrade will be deducted from the relative essence points
    And the upgrade options ill not be displayed
    And expect the relative glowing essence to change their display based on the updated essence color points