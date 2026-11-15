import type { Entity } from '../../core/Entity';
import { spawnDeadZombie } from '../../core/factories/EnemyFactory';
import type { Level } from '../../core/level/Level';
import type { IVector } from '../../lib/geometry/IVector';

const MAX_DEAD_BODIES = 64;

export class DeadBodies {
    #level : Level;
    #bodies : Entity[] = [];
    #oldestIndex = 0;

    constructor(level : Level) {
        this.#level = level;
    }

    place(position : IVector) {
        const body = this.#bodies.length < MAX_DEAD_BODIES ? this.#spawnNewBody() : this.#reuseOldestBody();
        body.pos.set(position.x, position.y);
    }

    #spawnNewBody() {
        const body = spawnDeadZombie();
        this.#level.addEntity(body);
        this.#bodies.push(body);
        return body;
    }

    #reuseOldestBody() {
        const body = this.#bodies[this.#oldestIndex];
        this.#oldestIndex = (this.#oldestIndex + 1) % MAX_DEAD_BODIES;
        return body;
    }
}
