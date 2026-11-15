import type { IFilter } from './IFilter';
import { Camera } from '../../../lib/Camera';
import { Canvas } from '../../../lib/Canvas';

export class PixelFilter implements IFilter {
    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.imageSmoothingEnabled = false;
    }

    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) {
        ctx.imageSmoothingEnabled = true;
    }
}
