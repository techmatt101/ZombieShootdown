import { ChunkEvent, chunkIndexOf, type Chunk, type ChunkStreamer } from './ChunkStreamer';
import { CHUNK_SHIFT, CHUNK_SIZE, LAST_TILE } from './constants';
import type { Random } from './random';
import { castRay, hasClearLine } from './raycast';
import { TileType } from './TileType';
import type { IVector } from '../lib/geometry/IVector';
import { Vector } from '../lib/geometry/Vector';

export class TileMap {
    #chunks : ChunkStreamer;
    #cachedChunk : Chunk | null = null;
    #edits = 0;

    constructor(chunks : ChunkStreamer) {
        this.#chunks = chunks;
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => {
            if (this.#cachedChunk === chunk) {
                this.#cachedChunk = null;
            }
        });
    }

    get version() {
        return this.#chunks.version + this.#edits;
    }

    tileAt(tileX : number, tileY : number) : TileType {
        const chunk = this.#chunkAtTile(tileX, tileY);
        if (chunk === undefined) {
            return TileType.ROCK;
        }
        return chunk.tiles[(tileX & LAST_TILE) + ((tileY & LAST_TILE) << CHUNK_SHIFT)];
    }

    setTile(tileX : number, tileY : number, type : TileType) {
        const chunk = this.#chunkAtTile(tileX, tileY);
        if (chunk === undefined) return;
        chunk.tiles[(tileX & LAST_TILE) + ((tileY & LAST_TILE) << CHUNK_SHIFT)] = type;
        this.#edits++;
    }

    isSolidTile = (tileX : number, tileY : number) => this.tileAt(tileX, tileY) !== TileType.FLOOR;

    raycast(originX : number, originY : number, directionX : number, directionY : number, maxDistance : number) {
        return castRay(this.isSolidTile, originX, originY, directionX, directionY, maxDistance);
    }

    hasLineOfSight(from : IVector, to : IVector) {
        return hasClearLine(this.isSolidTile, from.x, from.y, to.x, to.y);
    }

    forEachCornerNear(x : number, y : number, radius : number, visit : (cornerX : number, cornerY : number) => void) {
        const radiusSquared = radius * radius;
        for (let cy = chunkIndexOf(y - radius); cy <= chunkIndexOf(y + radius); cy++) {
            for (let cx = chunkIndexOf(x - radius); cx <= chunkIndexOf(x + radius); cx++) {
                const chunk = this.#chunks.chunkAt(cx, cy);
                if (chunk === undefined) continue;
                const corners = chunk.corners;
                for (let i = 0; i < corners.length; i += 2) {
                    const dx = corners[i] - x, dy = corners[i + 1] - y;
                    if (dx * dx + dy * dy <= radiusSquared) {
                        visit(corners[i], corners[i + 1]);
                    }
                }
            }
        }
    }

    openFloorNear(point : IVector, radius : number) : Vector[] {
        const positions : Vector[] = [];
        this.#forEachOpenFloorNear(point, radius, (x, y) => positions.push(new Vector(x, y)));
        return positions;
    }

    randomOpenFloorNear(point : IVector, radius : number, random : Random) : Vector | null {
        let chosen : Vector | null = null;
        let seen = 0;
        this.#forEachOpenFloorNear(point, radius, (x, y) => {
            seen++;
            if (random() * seen < 1) {
                chosen = new Vector(x, y);
            }
        });
        return chosen;
    }

    spawnPoint() : Vector {
        const centre = { x: CHUNK_SIZE / 2, y: CHUNK_SIZE / 2 };
        const candidates = this.openFloorNear(centre, CHUNK_SIZE);
        const distanceToCentre = (point : Vector) => Math.hypot(point.x - centre.x, point.y - centre.y);
        candidates.sort((a, b) => distanceToCentre(a) - distanceToCentre(b));
        return candidates[0] ?? new Vector(centre.x, centre.y);
    }

    #chunkAtTile(tileX : number, tileY : number) : Chunk | undefined {
        const cx = tileX >> CHUNK_SHIFT, cy = tileY >> CHUNK_SHIFT;
        const cached = this.#cachedChunk;
        if (cached !== null && cached.cx === cx && cached.cy === cy) {
            return cached;
        }
        const chunk = this.#chunks.chunkAt(cx, cy);
        if (chunk !== undefined) {
            this.#cachedChunk = chunk;
        }
        return chunk;
    }

    #forEachOpenFloorNear(point : IVector, radius : number, visit : (x : number, y : number) => void) {
        const radiusSquared = radius * radius;
        for (let cy = chunkIndexOf(point.y - radius); cy <= chunkIndexOf(point.y + radius); cy++) {
            for (let cx = chunkIndexOf(point.x - radius); cx <= chunkIndexOf(point.x + radius); cx++) {
                const chunk = this.#chunks.chunkAt(cx, cy);
                if (chunk === undefined) continue;
                const openFloor = chunk.openFloor;
                for (let i = 0; i < openFloor.length; i += 2) {
                    const dx = openFloor[i] - point.x, dy = openFloor[i + 1] - point.y;
                    if (dx * dx + dy * dy <= radiusSquared) {
                        visit(openFloor[i], openFloor[i + 1]);
                    }
                }
            }
        }
    }
}
