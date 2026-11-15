import { DeadBodies } from './DeadBodies';
import type { IGameLogic } from './IGameLogic';
import { HealthEvent } from '../../core/components/Health';
import type { Entity } from '../../core/Entity';
import { spawnZombie } from '../../core/factories/EnemyFactory';
import type { TopDownLevel } from '../../core/level/TopDownLevel';
import { EventCollection } from '../../lib/EventCollection';
import type { Vector } from '../../lib/geometry/Vector';
import { shuffle } from '../../lib/helpers';
import { Pool } from '../../lib/Pool';
import { ChunkEvent, isInChunk, type Chunk } from '../../world/ChunkStreamer';

const OFFSCREEN_SPAWN_MARGIN = 64;
const SPAWN_SEARCH_RADIUS = 1400;

export class SinglePlayerWaveLogic implements IGameLogic {
    score = 0;
    wave = 0;

    #level : TopDownLevel;
    #player! : Entity;
    #zombies : Entity[] = [];
    #zombieEventCollection : EventCollection;
    #zombiePool : Pool<Entity>;
    #deadBodies : DeadBodies;


    constructor(level : TopDownLevel) {
        this.#level = level;
        this.#deadBodies = new DeadBodies(level);

        this.#zombieEventCollection = new EventCollection(() => {
            this.spawnWave();
            this.score += 100;
        }, () => {
            this.score += 10;
        });

        this.#zombiePool = new Pool<Entity>(() => {
            const zombie = spawnZombie(this.#player);
            zombie.getComponent('health').on(HealthEvent.DEATH, this.#zombieEventCollection.listen(() => {
                zombie.active = false;
                zombie.available = true;
                this.#deadBodies.place(zombie.pos);
            }));
            this.#level.addEntity(zombie);
            this.#zombies.push(zombie);
            return zombie;
        });

        level.getChunks().on(ChunkEvent.UNLOADED, (chunk : Chunk) => this.#recycleZombiesLeftIn(chunk));
    }

    start(player : Entity) {
        this.#player = player;

        this.#player.getComponent('health').on(HealthEvent.DEATH, () => {
            console.log("GAME OVER MAN!");
        });
        this.spawnWave();
    }

    spawnWave() {
        this.wave++;

        const numberOfZombies = Math.trunc(this.wave * 1.5 + 3);
        const spawnPoints = this.#findOffscreenSpawnPoints();
        for (let i = 0; i < numberOfZombies; i++) {
            const zombie = this.#zombiePool.acquire();
            zombie.getComponent('health').set(100);
            if (spawnPoints.length > 0) {
                const point = spawnPoints[i % spawnPoints.length];
                zombie.pos.set(point.x, point.y);
            }
        }

        this.#zombieEventCollection.reset(numberOfZombies);

        console.log(`WAVE ${this.wave} HAS BEGUN! SPAWNED ${numberOfZombies} ZOMBIES`);
    }

    #recycleZombiesLeftIn(chunk : Chunk) {
        const zombies = this.#zombies;
        let spawnPoints : Vector[] | null = null;
        let recycledCount = 0;
        for (let i = 0; i < zombies.length; i++) {
            const zombie = zombies[i];
            if (!zombie.active || !isInChunk(chunk, zombie.pos)) continue;
            spawnPoints ??= this.#findOffscreenSpawnPoints();
            if (spawnPoints.length > 0) {
                const point = spawnPoints[recycledCount % spawnPoints.length];
                zombie.pos.set(point.x, point.y);
                recycledCount++;
            }
        }
    }

    #findOffscreenSpawnPoints() : Vector[] {
        const camera = this.#level.getCamera();
        const player = this.#player.pos;
        const open = this.#level.getTileMap().openFloorNear(player, SPAWN_SEARCH_RADIUS);
        const offscreen : Vector[] = [];
        for (let i = 0; i < open.length; i++) {
            if (!camera.isInCurrentOrUpcomingView(open[i], OFFSCREEN_SPAWN_MARGIN)) {
                offscreen.push(open[i]);
            }
        }
        if (offscreen.length > 0) {
            return shuffle(offscreen);
        }

        const distanceFromPlayer = (point : Vector) => Math.hypot(point.x - player.x, point.y - player.y);
        const farthestFromPlayerFirst = (a : Vector, b : Vector) => distanceFromPlayer(b) - distanceFromPlayer(a);
        return open.sort(farthestFromPlayerFirst);
    }
}
