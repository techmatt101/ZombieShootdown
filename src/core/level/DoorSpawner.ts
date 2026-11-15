import { DoorEvent } from '../components/Door';
import type { Entity } from '../Entity';
import { fitDoor, spawnDoor } from '../factories/DoorFactory';
import type { TopDownLevel } from './TopDownLevel';
import { Pool } from '../../lib/Pool';
import { ChunkEvent, type Chunk } from '../../world/ChunkStreamer';

export class DoorSpawner {
    #pool : Pool<Entity>;
    #atlas : CanvasImageSource | null = null;
    #doorsByChunk = new Map<string, Entity[]>();
    #doorKeyOf = new Map<Entity, string>();
    #openDoorKeys = new Set<string>();

    constructor(level : TopDownLevel) {
        this.#pool = new Pool<Entity>(() => {
            const door = spawnDoor(level.getTileMap());
            door.getComponent('door').on(DoorEvent.TOGGLED, () => this.#rememberState(door));
            level.addEntity(door);
            return door;
        });

        const chunks = level.getChunks();
        chunks.on(ChunkEvent.LOADED, (chunk : Chunk) => this.#placeDoors(chunk));
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#removeDoors(chunk));
    }

    useAtlas(atlas : CanvasImageSource) {
        this.#atlas = atlas;
    }

    #placeDoors(chunk : Chunk) {
        const atlas = this.#atlas;
        if (atlas === null || chunk.doors.length === 0) return;

        const placed : Entity[] = [];
        for (let i = 0; i < chunk.doors.length; i++) {
            const chunkDoor = chunk.doors[i];
            const doorKey = `${chunk.key}:${chunkDoor.side}`;
            const door = this.#pool.acquire();
            fitDoor(door, chunk, chunkDoor, this.#openDoorKeys.has(doorKey), atlas);
            this.#doorKeyOf.set(door, doorKey);
            placed.push(door);
        }
        this.#doorsByChunk.set(chunk.key, placed);
    }

    #removeDoors(chunk : Chunk) {
        const doors = this.#doorsByChunk.get(chunk.key);
        if (doors === undefined) return;
        for (let i = 0; i < doors.length; i++) {
            doors[i].active = false;
            doors[i].available = true;
            this.#doorKeyOf.delete(doors[i]);
        }
        this.#doorsByChunk.delete(chunk.key);
    }

    #rememberState(door : Entity) {
        const doorKey = this.#doorKeyOf.get(door);
        if (doorKey === undefined) return;
        if (door.getComponent('door').isOpen) {
            this.#openDoorKeys.add(doorKey);
        } else {
            this.#openDoorKeys.delete(doorKey);
        }
    }
}
