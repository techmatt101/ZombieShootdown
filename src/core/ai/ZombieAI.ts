import type { IAI } from './IAI';
import { checkLineOfSight } from './lineOfSight';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Vector } from '../../lib/geometry/Vector';
import type { Segment } from '../../lib/geometry/Segment';

export class ZombieAI implements IAI {
    #zombie : Entity;
    #player : Entity;

    #canSeePlayer = false;
    #checkingSight = false;

    #headingLocation = new Vector(40, 40);


    constructor(entity : Entity, player : Entity) {
        this.#zombie = entity;
        this.#player = player;
    }

    updatePathFind(segments : Segment[]) {
        if (this.#checkingSight) {
            return;
        }
        this.#checkingSight = true;
        void checkLineOfSight(this.#zombie.pos, this.#player.pos, segments).then((visible) => {
            this.#canSeePlayer = visible;
            this.#checkingSight = false;
        });
    }

    update(dt : number) {
        const movement = this.#zombie.components.movement;
        if (movement && this.#zombie.hasActiveComponent(Movement)) {
            let pos : Vector;
            if (this.#canSeePlayer) {
                pos = this.#player.pos;
                movement.speed = 15;
            } else {
                movement.speed = 3;
                pos = this.#headingLocation;
            }

            this.#zombie.pos.rotateDirection(pos);
            movement.direction.copy(pos).sub(this.#zombie.pos);
        }
    }
}
