import type { TextureSource } from './Texture';

const RGBA = 4;
const OPAQUE_ALPHA = 128;
const BEVEL_PIXELS = 2;
const DETAIL_HEIGHT = 0.5;
const SLOPE_STRENGTH = 1.5;
const RED_LUMINANCE = 0.299;
const GREEN_LUMINANCE = 0.587;
const BLUE_LUMINANCE = 0.114;
const CHANNEL_MAX = 255;

const normalMaps = new WeakMap<TextureSource, OffscreenCanvas>();

export function normalMapOf(image : TextureSource) : OffscreenCanvas {
    const cached = normalMaps.get(image);
    if (cached !== undefined) return cached;
    const { width, height } = image;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, width, height);
    pixels.data.set(normalsFromPixels(pixels.data, width, height));
    ctx.putImageData(pixels, 0, 0);
    normalMaps.set(image, canvas);
    return canvas;
}

export function normalsFromPixels(pixels : Uint8ClampedArray, width : number, height : number) : Uint8ClampedArray {
    const heights = heightsFromPixels(pixels, width, height);
    const normals = new Uint8ClampedArray(width * height * RGBA);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const left = heights[Math.max(x - 1, 0) + y * width];
            const right = heights[Math.min(x + 1, width - 1) + y * width];
            const up = heights[x + Math.max(y - 1, 0) * width];
            const down = heights[x + Math.min(y + 1, height - 1) * width];
            const normalX = -(right - left) * SLOPE_STRENGTH;
            const normalY = -(down - up) * SLOPE_STRENGTH;
            const length = Math.hypot(normalX, normalY, 1);
            const offset = (x + y * width) * RGBA;
            normals[offset] = encodeAxis(normalX / length);
            normals[offset + 1] = encodeAxis(-normalY / length);
            normals[offset + 2] = encodeAxis(1 / length);
            normals[offset + 3] = CHANNEL_MAX;
        }
    }
    return normals;
}

function heightsFromPixels(pixels : Uint8ClampedArray, width : number, height : number) {
    const heights = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (!isOpaque(pixels, width, height, x, y)) continue;
            const offset = (x + y * width) * RGBA;
            const luminance = (pixels[offset] * RED_LUMINANCE + pixels[offset + 1] * GREEN_LUMINANCE + pixels[offset + 2] * BLUE_LUMINANCE) / CHANNEL_MAX;
            const bevel = distanceToEdge(pixels, width, height, x, y) / BEVEL_PIXELS;
            heights[x + y * width] = bevel * (1 + luminance * DETAIL_HEIGHT);
        }
    }
    return heights;
}

function distanceToEdge(pixels : Uint8ClampedArray, width : number, height : number, x : number, y : number) {
    for (let ring = 1; ring <= BEVEL_PIXELS; ring++) {
        for (let dy = -ring; dy <= ring; dy++) {
            for (let dx = -ring; dx <= ring; dx++) {
                const isOnRing = Math.abs(dx) === ring || Math.abs(dy) === ring;
                if (isOnRing && !isOpaque(pixels, width, height, x + dx, y + dy)) {
                    return ring - 1;
                }
            }
        }
    }
    return BEVEL_PIXELS;
}

function isOpaque(pixels : Uint8ClampedArray, width : number, height : number, x : number, y : number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    return pixels[(x + y * width) * RGBA + 3] >= OPAQUE_ALPHA;
}

function encodeAxis(value : number) {
    return Math.round((value * 0.5 + 0.5) * CHANNEL_MAX);
}
