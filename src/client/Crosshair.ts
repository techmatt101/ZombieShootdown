import type { Entity } from '../core/Entity';
import { loadImage } from '../lib/assets';
import type { Camera } from '../lib/Camera';
import { Vector } from '../lib/geometry/Vector';

const CROSSHAIR_SIZE = 32;
const HALF_CROSSHAIR = CROSSHAIR_SIZE / 2;

export class Crosshair {
    #camera : Camera;
    #image : CanvasImageSource | null = null;
    #onScreen = new Vector(0, 0);

    constructor(camera : Camera) {
        this.#camera = camera;
        void loadImage('crosshair').then((image) => {
            this.#image = image;
        });
    }

    paint(ctx : CanvasRenderingContext2D, pointer : Entity | undefined) {
        const image = this.#image;
        if (image === null || pointer === undefined || !pointer.getComponent('pointer').isShown) return;
        const onScreen = this.#camera.worldToScreen(pointer.pos, this.#onScreen);
        ctx.drawImage(image, Math.round(onScreen.x - HALF_CROSSHAIR), Math.round(onScreen.y - HALF_CROSSHAIR), CROSSHAIR_SIZE, CROSSHAIR_SIZE);
    }
}
