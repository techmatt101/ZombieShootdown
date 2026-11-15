import { CHUNK_SIZE, CHUNK_TILES, TILE_SIZE, tileIndex } from './constants';
import type { ChunkData } from './generateChunk';
import { TileType } from './TileType';

const ATLAS_TILE_SIZE = 8;
const FLOOR_ATLAS_COLUMN = 0;
const FLOOR_ATLAS_ROW = 1;
const WALL_ATLAS_ROW = 0;
const QUARTER_TURN = Math.PI / 2;

export function renderChunk(chunk : ChunkData, atlas : CanvasImageSource) : ImageBitmap {
    const canvas = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.imageSmoothingEnabled = false;

    const drawAtlasTile = (column : number, row : number) => {
        ctx.drawImage(atlas, column * ATLAS_TILE_SIZE, row * ATLAS_TILE_SIZE, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE,
            -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
    };

    for (let y = 0; y < CHUNK_TILES; y++) {
        for (let x = 0; x < CHUNK_TILES; x++) {
            const index = tileIndex(x, y);
            const tile = chunk.tiles[index];
            if (tile === TileType.ROCK) continue;

            ctx.setTransform(1, 0, 0, 1, (x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
            if (tile === TileType.FLOOR || tile === TileType.DOOR) {
                ctx.rotate(chunk.floorRotations[index] * QUARTER_TURN);
                drawAtlasTile(FLOOR_ATLAS_COLUMN, FLOOR_ATLAS_ROW);
            } else {
                drawAtlasTile(chunk.wallDirections[index], WALL_ATLAS_ROW);
            }
        }
    }

    return canvas.transferToImageBitmap();
}
