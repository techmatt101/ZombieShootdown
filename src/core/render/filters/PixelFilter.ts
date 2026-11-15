import type { IFilter } from './IFilter';
import type { Camera } from '../../../lib/Camera';
import type { Canvas } from '../../../lib/Canvas';

export class PixelFilter implements IFilter {
    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.imageSmoothingEnabled = false;
    }

    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.imageSmoothingEnabled = true;
    }
}
