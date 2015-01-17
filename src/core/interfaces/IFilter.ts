module ZombieApp {
    export interface IFilter {
        init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera)
        close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera)
    }
}