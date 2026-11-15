import { Box } from './geometry/Box';
import { Vector } from './geometry/Vector';

export type TextureSource = HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap;

export class Texture extends Box {
    img : TextureSource;
    sourcePos : Vector;
    sourceWidth : number;
    sourceHeight : number;
    normals : TextureSource | null = null;
    emissive : TextureSource | null = null;

    constructor(img : TextureSource,
                pos : Vector,
                width : number,
                height : number,
                sourcePos = new Vector(0, 0),
                sourceWidth? : number,
                sourceHeight? : number) {
        super(width, height, pos);
        this.img = img;
        this.sourcePos = sourcePos;
        this.sourceWidth = sourceWidth || img.width;
        this.sourceHeight = sourceHeight || img.height;
    }
}
