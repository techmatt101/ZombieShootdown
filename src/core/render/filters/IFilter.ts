import { Camera } from '../../../lib/Camera';
import { Canvas } from '../../../lib/Canvas';

export interface IFilter {
    init(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) : void;
    close(ctx : CanvasRenderingContext2D, canvas : Canvas, camera : Camera) : void;
}
