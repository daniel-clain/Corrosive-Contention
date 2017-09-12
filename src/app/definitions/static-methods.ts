export class StaticMethods{
    static percentageChance(percentage: number): Boolean{
        return Math.random()*100<percentage?true:false
    }
}