'use strict';
module.exports = class GameSettings {
  constructor() {
    this.treeInitialPercentageCoverage = 80;
    this.gameCols = 8;
    this.gameRows = 8;
    this.initialTreeLocations = [];
    this.volatileDetectorLocations = [];
    this.treeRegrowthRate = {
      'whenUnder5%': {
        treesSpawnedPerPeriod: 3,
        period: 5
      },
      'whenUnder25%': {
        treesSpawnedPerPeriod: 2,
        period: 10
      },
      'whenUnder50%': {
        treesSpawnedPerPeriod: 2,
        period: 20
      },
      'whenUnder75%': {
        treesSpawnedPerPeriod: 1,
        period: 20
      },
      'whenUnder95%': {
        treesSpawnedPerPeriod: 0,
        period: 20
      }
    };
  }
}
