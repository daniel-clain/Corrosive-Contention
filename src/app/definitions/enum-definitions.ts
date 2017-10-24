
export enum Direction {
    up = 'up',
    right = 'right',
    left = 'left',
    down = 'down'
}

export enum BombItem {
    'noBombs' = null,
    'oneBomb' = 1 ,
    'threeBombs' = 3,
}

export enum EssenceColour {
    'yellow',
    'blue',
    'green',
    'purple'
}

export enum NumberNames{
  'one' = 1,
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight'
}

export enum PlayerStatsItem{
    'health',
    'lives',
    'bombs',
    'blueEssence',
    'yellowEssence',
    'greenEssence',
    'purpleEssence',
    'maxHealth',
    'maxLives',
    'maximumBombs'
}

/*export enum AbilityName{
    'Siphon Tree',
    'Throw Bomb',
    'Go Invisible',
    'Plant Vine Trap',
    'Use ForceField',
    'Place Fake Tree',
    'Place Tree Mine',
    'Speed Burst',
    'Use Player Detector',
    'Pickup / Drop Volatile Detector'
}*/

export type AbilityName =
  'Siphon Tree' | 'Throw Bomb' | 'Go Invisible' | 'Plant Vine Trap' | 'Use ForceField' | 'Place Fake Tree' | 'Place Tree Mine' | 'Speed Burst' | 'Use Player Detector' | 'Pickup / Drop Volatile Detector'

