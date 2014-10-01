interface IUpdate {
    update (dt : number) : void
    draw(ctx : CanvasRenderingContext2D) : void
    drawDebug(ctx : CanvasRenderingContext2D) : void
}