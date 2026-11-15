import { CHUNK_SIZE, CHUNK_TILES, TILE_SIZE, tileIndex } from './constants';
import type { ChunkData } from './generateChunk';
import { ATLAS_TILE_SIZE, QUARTER_TURN, type TileAtlas } from './tileAtlas';
import { TileType } from './TileType';

const FLOOR_ATLAS_COLUMN = 0;
const FLOOR_ATLAS_ROW = 1;
const WALL_ATLAS_ROW = 0;
const UNTURNED = 0;

export interface RenderedChunk {
    bitmap : ImageBitmap;
    normals : ImageBitmap;
}

export function renderChunk(chunk : ChunkData, atlas : TileAtlas) : RenderedChunk {
    const turnedNormals = atlas.turnedNormals;
    return {
        bitmap: paintTiles(chunk, () => atlas.colours),
        normals: paintTiles(chunk, (quarterTurns) => turnedNormals[quarterTurns]),
    };
}

function paintTiles(chunk : ChunkData, atlasTurnedBy : (quarterTurns : number) => CanvasImageSource) : ImageBitmap {
    const canvas = new OffscreenCanvas(CHUNK_SIZE, CHUNK_SIZE);
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error('OffscreenCanvas 2D context is not supported');
    }
    ctx.imageSmoothingEnabled = false;

    const drawAtlasTile = (atlas : CanvasImageSource, column : number, row : number) => {
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
                const quarterTurns = chunk.floorRotations[index];
                ctx.rotate(quarterTurns * QUARTER_TURN);
                drawAtlasTile(atlasTurnedBy(quarterTurns), FLOOR_ATLAS_COLUMN, FLOOR_ATLAS_ROW);
            } else {
                drawAtlasTile(atlasTurnedBy(UNTURNED), chunk.wallDirections[index], WALL_ATLAS_ROW);
            }
        }
    }

    return canvas.transferToImageBitmap();
}
