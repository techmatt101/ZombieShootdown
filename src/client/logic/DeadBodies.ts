import type { Entity } from '../../core/Entity';
import { loadDeathSheet, spawnDeadZombie } from '../../core/factories/EnemyFactory';
import type { Level } from '../../core/level/Level';
import type { IPoint } from '../../lib/geometry/IPoint';
import type { TextureSource } from '../../lib/Texture';

const MAX_DEAD_BODIES = 64;

export class DeadBodies {
    #level : Level;
    #bodies : Entity[] = [];
    #oldestIndex = 0;
    #deathSheet : TextureSource | null = null;

    constructor(level : Level) {
        this.#level = level;
        void loadDeathSheet().then((sheet) => {
            this.#deathSheet = sheet;
        });
    }

    place(fallenAt : IPoint) {
        const deathSheet = this.#deathSheet;
        if (deathSheet === null) return;
        const body = this.#bodies.length < MAX_DEAD_BODIES ? this.#spawnNewBody(deathSheet) : this.#reuseOldestBody();
        body.pos.copy(fallenAt);
        body.getComponent('spriteAnimator').play();
    }

    #spawnNewBody(deathSheet : TextureSource) {
        const body = spawnDeadZombie(deathSheet);
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
