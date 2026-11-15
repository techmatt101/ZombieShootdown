export interface IBehavior<TData = number> {
    dominant : boolean;
    passive : boolean;

    action(opposingBehavior : IBehavior<TData>) : void;
    reaction(data : TData) : void;
}
