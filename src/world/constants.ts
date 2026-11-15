export const TILE_SIZE = 42;
export const CHUNK_SHIFT = 4;
export const CHUNK_TILES = 1 << CHUNK_SHIFT;
export const CHUNK_SIZE = TILE_SIZE * CHUNK_TILES;
export const LAST_TILE = CHUNK_TILES - 1;

export function chunkKey(cx : number, cy : number) {
    return `${cx},${cy}`;
}

export function tileIndex(x : number, y : number) {
    return x + y * CHUNK_TILES;
}
