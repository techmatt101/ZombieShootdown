module ZombieApp {
    export interface IUpdate {
        update (dt : number)
        drawDebug(ctx : CanvasRenderingContext2D)
    }
}