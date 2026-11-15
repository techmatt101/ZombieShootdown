import type { IWaveLogic } from './IWaveLogic';
import { HealthEvent } from '../../core/components/Health';
import { Entity } from '../../core/Entity';
import { spawnDeadZombie, spawnZombie } from '../../core/factories/EnemyFactory';
import { TopDownLevel } from '../../core/level/TopDownLevel';
import { EventCollection } from '../../lib/EventCollection';
import { Vector } from '../../lib/geometry/Vector';
import { shuffle } from '../../lib/helpers';
import { Pool } from '../../lib/Pool';

const OFFSCREEN_SPAWN_MARGIN = 64;

export class SinglePlayerWaveLogic implements IWaveLogic {
    score = 0;
    wave = 0;

    #level : TopDownLevel;
    #player! : Entity;
    #zombieEventCollection : EventCollection;
    #zombiePool : Pool<Entity>;


    constructor(level : TopDownLevel) {
        this.#level = level;

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
                const deadZombie = spawnDeadZombie();
                deadZombie.pos.copy(zombie.pos);
                level.addEntity(deadZombie);
            }));
            this.#level.addEntity(zombie);

            return zombie;
        });
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

    #findOffscreenSpawnPoints() : Vector[] {
        const camera = this.#level.getCamera();
        const open = this.#level.getMap().getGenerator().getOpenFloorPositions();
        const offscreen = open.filter((point) => !camera.canSee(point, OFFSCREEN_SPAWN_MARGIN));
        if (offscreen.length > 0) {
            return shuffle(offscreen);
        }

        const player = this.#player.pos;
        const distanceFromPlayer = (point : Vector) => Math.hypot(point.x - player.x, point.y - player.y);
        const farthestFromPlayerFirst = (a : Vector, b : Vector) => distanceFromPlayer(b) - distanceFromPlayer(a);
        return open.sort(farthestFromPlayerFirst);
    }
}
