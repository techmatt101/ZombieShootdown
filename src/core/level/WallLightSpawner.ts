import type { Entity } from '../Entity';
import { fitWallLight, spawnWallLight } from '../factories/WallLightFactory';
import type { TopDownLevel } from './TopDownLevel';
import { Pool } from '../../lib/Pool';
import { ChunkEvent, type Chunk } from '../../world/ChunkStreamer';
import { FLOATS_PER_WALL_LIGHT_SPAWN } from '../../world/generateChunk';

export class WallLightSpawner {
    #pool : Pool<Entity>;
    #lightsByChunk = new Map<string, Entity[]>();
    #keyOf = new Map<Entity, string>();
    #brokenKeys = new Set<string>();

    constructor(level : TopDownLevel) {
        this.#pool = new Pool<Entity>(() => {
            const wallLight = spawnWallLight();
            level.addEntity(wallLight);
            return wallLight;
        });

        const chunks = level.getChunks();
        chunks.on(ChunkEvent.LOADED, (chunk : Chunk) => this.#mountLights(chunk));
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#takeDownLights(chunk));
    }

    #mountLights(chunk : Chunk) {
        const spawns = chunk.wallLightSpawns;
        if (spawns.length === 0) return;

        const mounted : Entity[] = [];
        for (let i = 0; i < spawns.length; i += FLOATS_PER_WALL_LIGHT_SPAWN) {
            const lightKey = `${chunk.key}:${i / FLOATS_PER_WALL_LIGHT_SPAWN}`;
            const wallLight = this.#pool.acquire();
            fitWallLight(wallLight, spawns[i], spawns[i + 1], spawns[i + 2], spawns[i + 3], this.#brokenKeys.has(lightKey));
            this.#keyOf.set(wallLight, lightKey);
            mounted.push(wallLight);
        }
        this.#lightsByChunk.set(chunk.key, mounted);
    }

    #takeDownLights(chunk : Chunk) {
        const mounted = this.#lightsByChunk.get(chunk.key);
        if (mounted === undefined) return;
        for (let i = 0; i < mounted.length; i++) {
            const wallLight = mounted[i];
            const lightKey = this.#keyOf.get(wallLight);
            if (lightKey !== undefined && wallLight.getComponent('lamp').isBroken) {
                this.#brokenKeys.add(lightKey);
            }
            wallLight.active = false;
            wallLight.available = true;
            this.#keyOf.delete(wallLight);
        }
        this.#lightsByChunk.delete(chunk.key);
    }
}
