module ZombieApp {
    export interface IWeapon extends Entity {
        placementOffset : Vector
        attack() : void
    }
}