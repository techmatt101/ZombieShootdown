import type { IAI } from './IAI';
import { Movement } from '../components/Movement';
import type { Entity } from '../Entity';
import type { IVector } from '../../lib/geometry/IVector';
import { Vector } from '../../lib/geometry/Vector';
import { TILE_SIZE } from '../../world/constants';
import { createRandom, type Random } from '../../world/random';
import type { TileMap } from '../../world/TileMap';

export const FIELD_OF_VIEW_HALF_ANGLE = Math.PI / 3;
const COS_FIELD_OF_VIEW_HALF_ANGLE = Math.cos(FIELD_OF_VIEW_HALF_ANGLE);
const FULL_TURN = Math.PI * 2;
export const WANDER_SPEED = 3;
const WANDER_RADIUS = TILE_SIZE * 5;
const ARRIVAL_DISTANCE = 20;
const MAX_WANDER_TIME = 60;
export const MAX_SEARCH_TIME = 50;
const DEBUG_VIEW_LENGTH = TILE_SIZE * 3;
const DEBUG_MARKER_SIZE = 8;
const SEEING_COLOUR = '#ff3030';
const SEARCHING_COLOUR = '#ffa020';
const WANDERING_COLOUR = '#80ff80';

export class ZombieAI implements IAI {
    #zombie : Entity;
    #player : Entity;
    #random : Random;
    #chaseSpeed : number;
    #sightDistance : number;

    #canSeePlayer = false;
    #isSearching = false;
    #lastSeen = new Vector(0, 0);
    #wanderTarget : Vector | null = null;
    #goalTime = 0;


    constructor(entity : Entity, player : Entity, chaseSpeed : number, sightDistance : number) {
        this.#zombie = entity;
        this.#player = player;
        this.#chaseSpeed = chaseSpeed;
        this.#sightDistance = sightDistance;
        this.#random = createRandom(Math.floor(Math.random() * 2 ** 32));
    }

    get canSeePlayer() {
        return this.#canSeePlayer;
    }

    get isSearching() {
        return this.#isSearching;
    }

    get lastSeen() : IVector {
        return this.#lastSeen;
    }

    think(tileMap : TileMap) {
        this.#canSeePlayer = this.#seesPlayer(tileMap);
        if (this.#canSeePlayer) {
            this.#lastSeen.copy(this.#player.pos);
            this.#isSearching = true;
            this.#goalTime = 0;
            return;
        }

        if (this.#isSearching) {
            if (!this.#hasReached(this.#lastSeen) && this.#goalTime <= MAX_SEARCH_TIME) return;
            this.#isSearching = false;
            this.#wanderTarget = null;
        }

        if (this.#needsNewWanderTarget()) {
            this.#wanderTarget = tileMap.randomOpenFloorNear(this.#zombie.pos, WANDER_RADIUS, this.#random);
            this.#goalTime = 0;
        }
    }

    update(dt : number) {
        const movement = this.#zombie.components.movement;
        if (!movement || !this.#zombie.hasActiveComponent(Movement)) return;

        this.#goalTime += dt;
        const target = this.#currentTarget();
        movement.speed = this.#canSeePlayer || this.#isSearching ? this.#chaseSpeed : WANDER_SPEED;
        if (target === null) {
            movement.direction.reset();
            return;
        }
        this.#zombie.pos.rotateDirection(target);
        movement.direction.copy(target).sub(this.#zombie.pos);
    }

    reset() {
        this.#canSeePlayer = false;
        this.#isSearching = false;
        this.#wanderTarget = null;
        this.#goalTime = 0;
        this.#zombie.pos.direction = this.#random() * FULL_TURN;
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        const pos = this.#zombie.pos;
        ctx.strokeStyle = this.#canSeePlayer ? SEEING_COLOUR : this.#isSearching ? SEARCHING_COLOUR : WANDERING_COLOUR;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.arc(pos.x, pos.y, DEBUG_VIEW_LENGTH, pos.direction - FIELD_OF_VIEW_HALF_ANGLE, pos.direction + FIELD_OF_VIEW_HALF_ANGLE);
        ctx.closePath();
        ctx.stroke();

        if (this.#isSearching && !this.#canSeePlayer) {
            const lastSeen = this.#lastSeen;
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(lastSeen.x, lastSeen.y);
            ctx.moveTo(lastSeen.x - DEBUG_MARKER_SIZE, lastSeen.y - DEBUG_MARKER_SIZE);
            ctx.lineTo(lastSeen.x + DEBUG_MARKER_SIZE, lastSeen.y + DEBUG_MARKER_SIZE);
            ctx.moveTo(lastSeen.x + DEBUG_MARKER_SIZE, lastSeen.y - DEBUG_MARKER_SIZE);
            ctx.lineTo(lastSeen.x - DEBUG_MARKER_SIZE, lastSeen.y + DEBUG_MARKER_SIZE);
            ctx.stroke();
        }
    }

    #seesPlayer(tileMap : TileMap) {
        const zombie = this.#zombie.pos, player = this.#player.pos;
        const toPlayerX = player.x - zombie.x, toPlayerY = player.y - zombie.y;
        const distance = Math.hypot(toPlayerX, toPlayerY);
        if (distance > this.#sightDistance) return false;

        const distanceAlongFacing = toPlayerX * Math.cos(zombie.direction) + toPlayerY * Math.sin(zombie.direction);
        if (distanceAlongFacing < distance * COS_FIELD_OF_VIEW_HALF_ANGLE) return false;

        return tileMap.hasLineOfSight(zombie, player);
    }

    #currentTarget() : IVector | null {
        if (this.#canSeePlayer) return this.#player.pos;
        if (this.#isSearching) return this.#lastSeen;
        return this.#wanderTarget;
    }

    #hasReached(target : IVector) {
        return Math.hypot(target.x - this.#zombie.pos.x, target.y - this.#zombie.pos.y) < ARRIVAL_DISTANCE;
    }

    #needsNewWanderTarget() {
        const target = this.#wanderTarget;
        if (target === null || this.#goalTime > MAX_WANDER_TIME) {
            return true;
        }
        return this.#hasReached(target);
    }
}
