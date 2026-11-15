export interface IBehavior {
    dominant : boolean;
    passive : boolean;

    action(opposingBehavior : IBehavior) : void;
    reaction(data : number) : void;
}
