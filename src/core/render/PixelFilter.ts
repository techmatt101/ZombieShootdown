module ZombieApp {
    export class PixelFilter implements IFilter {
        init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
            canvas.context.imageSmoothingEnabled = false;
            canvas.context.msImageSmoothingEnabled = false;
            canvas.context.mozImageSmoothingEnabled = false;
            canvas.context.oImageSmoothingEnabled = false;
            canvas.context.webkitImageSmoothingEnabled = false;
        }

        close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
            canvas.context.imageSmoothingEnabled = true;
            canvas.context.msImageSmoothingEnabled = true;
            canvas.context.mozImageSmoothingEnabled = true;
            canvas.context.oImageSmoothingEnabled = true;
            canvas.context.webkitImageSmoothingEnabled = true;
        }

    }
}