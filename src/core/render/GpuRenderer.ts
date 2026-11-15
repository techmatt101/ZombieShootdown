import { queueEntitySprites } from './EntitySprites';
import type { GpuContext } from './gpu/GpuContext';
import { GpuPainter, type LightingSource } from './gpu/GpuPainter';
import { SpriteBatch, type SpriteLayer, type TextureOwner } from './SpriteBatch';
import type { Entity } from '../Entity';
import type { EntityRenderer } from '../systems/RenderSystem';
import { loadImage } from '../../lib/assets';
import type { Camera } from '../../lib/Camera';
import type { TextureSource } from '../../lib/Texture';
import { CHUNK_SIZE } from '../../world/constants';

const REMEMBERED_BRIGHTNESS = 0.3;
const NEAR_SHADOW_SOFTNESS = 0.1;
const FAR_SHADOW_SOFTNESS = 10;
const SOFTEST_SHADOW_DISTANCE = 500;
const NORMAL_MAP_STRENGTH = 0.7;
const LIGHT_HEIGHT = 60;

export class GpuRenderer implements EntityRenderer, TextureOwner {
    #camera : Camera;
    #entities : readonly Entity[] = [];
    #background : SpriteLayer | null = null;
    #lighting : LightingSource | null = null;
    #batch = new SpriteBatch();
    #painter : GpuPainter | null = null;
    #isDisposed = false;
    #drawCalls = 0;

    constructor(camera : Camera) {
        this.#camera = camera;
    }

    get drawCalls() {
        return this.#drawCalls;
    }

    get isReady() {
        return this.#painter !== null;
    }

    async init(gpu : GpuContext) {
        const vision = await loadImage('vision');
        if (this.#isDisposed) return;
        this.#painter = new GpuPainter(gpu, {
            chunkSize: CHUNK_SIZE,
            rememberedBrightness: REMEMBERED_BRIGHTNESS,
            nearShadowSoftness: NEAR_SHADOW_SOFTNESS,
            farShadowSoftness: FAR_SHADOW_SOFTNESS,
            softestShadowDistance: SOFTEST_SHADOW_DISTANCE,
            normalMapStrength: NORMAL_MAP_STRENGTH,
            lightHeight: LIGHT_HEIGHT,
        }, vision);
    }

    setBackground(layer : SpriteLayer) {
        this.#background = layer;
    }

    setLighting(lighting : LightingSource) {
        this.#lighting = lighting;
    }

    render(entities : readonly Entity[]) {
        this.#entities = entities;
    }

    paint() {
        const painter = this.#painter;
        if (painter === null) return;
        const batch = this.#batch;
        batch.reset();
        this.#background?.queue(batch);
        queueEntitySprites(this.#entities, this.#camera, batch);
        this.#drawCalls = painter.paint(batch, this.#lighting, this.#camera);
    }

    release(source : TextureSource) {
        this.#painter?.release(source);
    }

    dispose() {
        this.#isDisposed = true;
        this.#painter?.dispose();
        this.#painter = null;
    }
}
