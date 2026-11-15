import type { IAI } from './IAI';
import { Movement } from '../components/Movement';
import type { Entity } from '../Entity';
import type { Vector } from '../../lib/geometry/Vector';
import { TILE_SIZE } from '../../world/constants';
import { createRandom, type Random } from '../../world/random';
import type { TileMap } from '../../world/TileMap';

const SIGHT_RANGE = 900;
const WANDER_SPEED = 3;
const WANDER_RADIUS = TILE_SIZE * 5;
const ARRIVAL_DISTANCE = 20;
const MAX_WANDER_TIME = 60;

export class ZombieAI implements IAI {
    #zombie : Entity;
    #player : Entity;
    #random : Random;
    #chaseSpeed : number;

    #canSeePlayer = false;
    #wanderTarget : Vector | null = null;
    #wanderTime = 0;


    constructor(entity : Entity, player : Entity, chaseSpeed : number) {
        this.#zombie = entity;
        this.#player = player;
        this.#chaseSpeed = chaseSpeed;
        this.#random = createRandom(Math.floor(Math.random() * 2 ** 32));
    }

    think(tileMap : TileMap) {
        const zombie = this.#zombie.pos, player = this.#player.pos;
        const isInSightRange = Math.hypot(player.x - zombie.x, player.y - zombie.y) <= SIGHT_RANGE;
        this.#canSeePlayer = isInSightRange && tileMap.hasLineOfSight(zombie, player);

        if (!this.#canSeePlayer && this.#needsNewWanderTarget()) {
            this.#wanderTarget = tileMap.randomOpenFloorNear(zombie, WANDER_RADIUS, this.#random);
            this.#wanderTime = 0;
        }
    }

    update(dt : number) {
        const movement = this.#zombie.components.movement;
        if (!movement || !this.#zombie.hasActiveComponent(Movement)) return;

        this.#wanderTime += dt;
        const target = this.#canSeePlayer ? this.#player.pos : this.#wanderTarget;
        movement.speed = this.#canSeePlayer ? this.#chaseSpeed : WANDER_SPEED;
        if (target === null) {
            movement.direction.reset();
            return;
        }
        this.#zombie.pos.rotateDirection(target);
        movement.direction.copy(target).sub(this.#zombie.pos);
    }

    reset() {
        this.#canSeePlayer = false;
        this.#wanderTarget = null;
        this.#wanderTime = 0;
    }

    #needsNewWanderTarget() {
        const target = this.#wanderTarget;
        if (target === null || this.#wanderTime > MAX_WANDER_TIME) {
            return true;
        }
        return Math.hypot(target.x - this.#zombie.pos.x, target.y - this.#zombie.pos.y) < ARRIVAL_DISTANCE;
    }
}
