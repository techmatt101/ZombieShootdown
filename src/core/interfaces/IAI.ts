module ZombieApp {
    export interface IAI {
        updatePathFind(segments)
        update(dt : number)
    }
}