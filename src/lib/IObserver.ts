module ZombieApp {
    export interface IObserver {
        on (event_type, callback)
        off ()
    }
}