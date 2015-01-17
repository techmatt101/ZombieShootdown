module ZombieApp {
    export interface ISystem {
        add(entity : Entity)
        update(dt : number)
    }
}