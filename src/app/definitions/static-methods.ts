export class StaticMethods{
  static percentageChance(percentage: number): Boolean{
    return Math.random() * 100 < percentage;
  }
  static copy(thing: Object): any{
    return typeof thing === 'object' && Object.assign(true, {}, thing);
  }
}
