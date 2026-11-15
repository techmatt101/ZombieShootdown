import type { TextureSource } from '../lib/Texture';

export const ATLAS_TILE_SIZE = 8;
export const QUARTER_TURN = Math.PI / 2;
export const QUARTER_TURNS = 4;

const RGBA = 4;
const CHANNEL_MAX = 255;

export interface TileAtlas {
    colours : CanvasImageSource;
    turnedNormals : readonly CanvasImageSource[];
}

export function tileAtlasOf(colours : CanvasImageSource, normals : TextureSource) : TileAtlas {
    const turnedNormals : OffscreenCanvas[] = [];
    for (let quarterTurns = 0; quarterTurns < QUARTER_TURNS; quarterTurns++) {
        turnedNormals.push(normalsTurnedBy(normals, quarterTurns));
    }
    return { colours, turnedNormals };
}

export function turnNormals(pixels : Uint8ClampedArray, quarterTurns : number) {
    const turns = ((quarterTurns % QUARTER_TURNS) + QUARTER_TURNS) % QUARTER_TURNS;
    for (let offset = 0; offset < pixels.length; offset += RGBA) {
        for (let turn = 0; turn < turns; turn++) {
            const right = pixels[offset];
            pixels[offset] = pixels[offset + 1];
            pixels[offset + 1] = CHANNEL_MAX - right;
        }
    }
}

function normalsTurnedBy(normals : TextureSource, quarterTurns : number) {
    const { width, height } = normals;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.drawImage(normals, 0, 0);
    const pixels = ctx.getImageData(0, 0, width, height);
    turnNormals(pixels.data, quarterTurns);
    ctx.putImageData(pixels, 0, 0);
    return canvas;
}
