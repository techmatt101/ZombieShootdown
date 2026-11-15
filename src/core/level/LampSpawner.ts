import type { Entity } from '../Entity';
import { fitLamp, spawnLamp } from '../factories/LampFactory';
import type { TopDownLevel } from './TopDownLevel';
import { Pool } from '../../lib/Pool';
import { ChunkEvent, type Chunk } from '../../world/ChunkStreamer';
import { FLOATS_PER_LAMP_SPAWN } from '../../world/generateChunk';

interface RememberedLamp {
    x : number;
    y : number;
    isBroken : boolean;
}

export class LampSpawner {
    #pool : Pool<Entity>;
    #lampsByChunk = new Map<string, Entity[]>();
    #keyOf = new Map<Entity, string>();
    #remembered = new Map<string, RememberedLamp>();

    constructor(level : TopDownLevel) {
        this.#pool = new Pool<Entity>(() => {
            const lamp = spawnLamp();
            level.addEntity(lamp);
            return lamp;
        });

        const chunks = level.getChunks();
        chunks.on(ChunkEvent.LOADED, (chunk : Chunk) => this.#placeLamps(chunk));
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#removeLamps(chunk));
    }

    #placeLamps(chunk : Chunk) {
        const spawns = chunk.lampSpawns;
        if (spawns.length === 0) return;

        const placed : Entity[] = [];
        for (let i = 0; i < spawns.length; i += FLOATS_PER_LAMP_SPAWN) {
            const lampKey = `${chunk.key}:${i / FLOATS_PER_LAMP_SPAWN}`;
            const remembered = this.#remembered.get(lampKey);
            const lamp = this.#pool.acquire();
            fitLamp(lamp, remembered?.x ?? spawns[i], remembered?.y ?? spawns[i + 1], spawns[i + 2], remembered?.isBroken ?? false);
            this.#keyOf.set(lamp, lampKey);
            placed.push(lamp);
        }
        this.#lampsByChunk.set(chunk.key, placed);
    }

    #removeLamps(chunk : Chunk) {
        const lamps = this.#lampsByChunk.get(chunk.key);
        if (lamps === undefined) return;
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const lampKey = this.#keyOf.get(lamp);
            if (lampKey !== undefined) {
                this.#remembered.set(lampKey, { x: lamp.pos.x, y: lamp.pos.y, isBroken: lamp.getComponent('lamp').isBroken });
            }
            lamp.active = false;
            lamp.available = true;
            this.#keyOf.delete(lamp);
        }
        this.#lampsByChunk.delete(chunk.key);
    }
}
