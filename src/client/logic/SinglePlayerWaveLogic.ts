import type { IWaveLogic } from './IWaveLogic';
import { HealthEvent } from '../../core/components/Health';
import { Entity } from '../../core/Entity';
import { spawnDeadZombie, spawnZombie } from '../../core/factories/EnemyFactory';
import { TopDownLevel } from '../../core/level/TopDownLevel';
import { MapGenerator } from '../../core/tilemap/MapGenerator';
import { EventCollection } from '../../lib/EventCollection';
import { Box } from '../../lib/geometry/Box';
import { randInt } from '../../lib/helpers';
import { Pool } from '../../lib/Pool';

export class SinglePlayerWaveLogic implements IWaveLogic {
    score = 0;
    wave = 0;

    #level : TopDownLevel;
    #player! : Entity; // set in start(), before any zombie is spawned
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
                zombie.active = false; //TODO: hack
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
        //var numberOfZombies = 1;
        for (let i = 0; i < numberOfZombies; i++) {
            const zombie = this.#zombiePool.acquire();
            zombie.getComponent('health').set(100); //TODO: hack
            this.placeInRoom(zombie.geometry, this.#level.getMap().getGenerator());
        }

        this.#zombieEventCollection.reset(numberOfZombies);

        console.log(`WAVE ${this.wave} HAS BEGUN! SPAWNED ${numberOfZombies} ZOMBIES`);
    }

    placeInRoom(box : Box, map : MapGenerator) {
        const t = map.getTileSize(), room = map.getRooms()[0];

        box.pos.set(
            randInt(room.pos.x + t.x + box.width / 2, room.pos.x + room.width - t.x - box.width / 2),
            randInt(room.pos.y + t.y + box.height / 2, room.pos.y + room.height - t.y - box.height / 2)
        );
    }
}
