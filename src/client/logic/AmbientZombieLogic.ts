import { DeadBodies } from './DeadBodies';
import { GameLogicEvent, type IGameLogic } from './IGameLogic';
import { HealthEvent } from '../../core/components/Health';
import type { Entity } from '../../core/Entity';
import { spawnZombie } from '../../core/factories/EnemyFactory';
import type { TopDownLevel } from '../../core/level/TopDownLevel';
import { EventHandler, type Listener } from '../../lib/EventHandler';
import { Pool } from '../../lib/Pool';
import { ChunkEvent, isInChunk, type Chunk } from '../../world/ChunkStreamer';

const ZOMBIE_HEALTH = 100;
const KILL_SCORE = 10;

export class AmbientZombieLogic implements IGameLogic {
    score = 0;
    #events = new EventHandler<GameLogicEvent>();

    #level : TopDownLevel;
    #player : Entity | null = null;
    #zombiePool : Pool<Entity>;
    #deadBodies : DeadBodies;
    #aliveBySpawn = new Map<string, Entity>();
    #spawnOf = new Map<Entity, string>();
    #killedSpawns = new Set<string>();


    constructor(level : TopDownLevel) {
        this.#level = level;
        this.#deadBodies = new DeadBodies(level);
        this.#zombiePool = new Pool<Entity>(() => this.#createZombie());

        const chunks = level.getChunks();
        chunks.on(ChunkEvent.LOADED, (chunk : Chunk) => this.#populate(chunk));
        chunks.on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#depopulate(chunk));
    }

    on(event : GameLogicEvent, callback : Listener) {
        this.#events.add(event, callback);
    }

    off(event : GameLogicEvent, callback : Listener) {
        this.#events.remove(event, callback);
    }

    start(player : Entity) {
        this.#player = player;
        player.getComponent('health').on(HealthEvent.DEATH, () => this.#events.fire(GameLogicEvent.OVER));
        const chunks = this.#level.getChunks().chunks();
        for (let i = 0; i < chunks.length; i++) {
            this.#populate(chunks[i]);
        }
    }

    #createZombie() {
        const zombie = spawnZombie(this.#player!);
        zombie.getComponent('health').on(HealthEvent.DEATH, () => this.#onZombieKilled(zombie));
        this.#level.addEntity(zombie);
        return zombie;
    }

    #populate(chunk : Chunk) {
        if (this.#player === null) return;
        const spawns = chunk.zombieSpawns;
        for (let i = 0; i < spawns.length; i += 2) {
            const spawnKey = `${chunk.key}:${i / 2}`;
            if (this.#killedSpawns.has(spawnKey) || this.#aliveBySpawn.has(spawnKey)) continue;

            const zombie = this.#zombiePool.acquire();
            zombie.getComponent('health').set(ZOMBIE_HEALTH);
            zombie.pos.set(spawns[i], spawns[i + 1]);
            this.#aliveBySpawn.set(spawnKey, zombie);
            this.#spawnOf.set(zombie, spawnKey);
        }
    }

    #depopulate(chunk : Chunk) {
        for (const zombie of this.#aliveBySpawn.values()) {
            if (isInChunk(chunk, zombie.pos)) {
                this.#release(zombie);
            }
        }
    }

    #onZombieKilled(zombie : Entity) {
        const spawnKey = this.#spawnOf.get(zombie);
        if (spawnKey !== undefined) {
            this.#killedSpawns.add(spawnKey);
        }
        this.score += KILL_SCORE;
        this.#deadBodies.place(zombie.pos);
        this.#release(zombie);
    }

    #release(zombie : Entity) {
        zombie.active = false;
        zombie.available = true;
        const spawnKey = this.#spawnOf.get(zombie);
        if (spawnKey !== undefined) {
            this.#aliveBySpawn.delete(spawnKey);
            this.#spawnOf.delete(zombie);
        }
    }
}
