export interface ISystem<T> {
    add(entity : T) : void;
    update(dt : number) : void;
}
