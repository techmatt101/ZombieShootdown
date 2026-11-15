import { Entity } from '../Entity';
import type { IWeapon } from './IWeapon';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Pool } from '../../lib/Pool';

export class Gun extends Entity implements IWeapon {
    placementOffset = new Vector(32, 0);
    #bulletPool : Pool<Entity>;
    #coolDown = 1.5;
    #activeCoolDown = 0;


    constructor(id : string, point: Point, geometry : Box, bulletPool : Pool<Entity>) {
        super(id, point, geometry);
        this.#bulletPool = bulletPool;
    }

    update(dt : number) {
        super.update(dt);
        if (this.#activeCoolDown > 0) {
            this.#activeCoolDown -= dt;
        } else {
            this.#activeCoolDown = 0;
        }
    }

    attack() {
        if (this.#activeCoolDown === 0) {
            this.#bulletPool.acquire().pos.copy(this.pos);
            this.#activeCoolDown = this.#coolDown;
        }
    }
}
