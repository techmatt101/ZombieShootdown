module ZombieApp {
    export interface IBehavior {
        dominant : boolean
        passive : boolean

        action(opposingBehavior : IBehavior)
        reaction(data)
    }
}