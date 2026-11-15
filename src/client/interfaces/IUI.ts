import type { IUpdate } from '../../lib/IUpdate';

export interface IUI extends IUpdate  {
    paint(ctx : CanvasRenderingContext2D);
}
