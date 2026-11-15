import { Entity } from '../Entity';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';
import type { IWeapon } from './IWeapon';
import type { Box } from '../../lib/geometry/Box';
import type { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import type { Pool } from '../../lib/Pool';

export enum WeaponEvent {
    FIRED,
}

export class Gun extends Entity implements IWeapon, IObserver<WeaponEvent> {
    placementOffset = new Vector(32, 0);
    #bulletPool : Pool<Entity>;
    #coolDown = 1.5;
    #activeCoolDown = 0;
    #events = new EventHandler<WeaponEvent>();


    constructor(id : string, point: Point, geometry : Box, bulletPool : Pool<Entity>) {
        super(id, point, geometry);
        this.#bulletPool = bulletPool;
    }

    update(dt : number) {
        super.update(dt);
        if (this.#activeCoolDown > 0) {
            this.#activeCoolDown -= dt;
        }
    }

    attack() {
        if (this.#activeCoolDown <= 0) {
            const bullet = this.#bulletPool.acquire();
            bullet.pos.copy(this.pos);
            bullet.components.movement?.clearPath();
            this.#activeCoolDown = this.#coolDown;
            this.#events.fire(WeaponEvent.FIRED);
        }
    }

    on(event : WeaponEvent, callback : Listener) {
        this.#events.add(event, callback);
    }

    off(event : WeaponEvent, callback : Listener) {
        this.#events.remove(event, callback);
    }
}
