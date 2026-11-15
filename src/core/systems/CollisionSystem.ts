import { Collision, CollisionShape } from '../components/Collision';
import { Movement } from '../components/Movement';
import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import { Box } from '../../lib/geometry/Box';
import { NO_HIT } from '../../lib/geometry/overlap';
import { Vector } from '../../lib/geometry/Vector';
import { SpatialHash } from '../../lib/SpatialHash';
import { TILE_SIZE } from '../../world/constants';
import type { TileMap } from '../../world/TileMap';

const SPATIAL_CELL_SIZE = 96;

export class CollisionSystem implements ISystem<Entity> {
    pairsTested = 0;

    #entities : Entity[] = [];
    #bodies : Entity[] = [];
    #projectiles : Entity[] = [];
    #order = new Map<Entity, number>();
    #tileMap : TileMap | null;
    #hash = new SpatialHash<Entity>(SPATIAL_CELL_SIZE);
    #tileBox = new Box(TILE_SIZE, TILE_SIZE);
    #push = new Vector(0, 0);

    #pairEntity : Entity | null = null;
    #pairOrder = 0;

    #sweepCollision : Collision | null = null;
    #sweepFrom = new Vector(0, 0);
    #sweepTo = new Vector(0, 0);
    #sweepFraction = NO_HIT;
    #sweepTarget : Entity | null = null;

    constructor(tileMap : TileMap | null = null) {
        this.#tileMap = tileMap;
    }

    add(entity : Entity) {
        if (entity.hasComponent(Collision)) {
            this.#order.set(entity, this.#entities.length);
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        this.pairsTested = 0;
        this.#sortActiveEntities();

        const bodies = this.#bodies;
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].hasActiveComponent(Collision)) {
                this.#collideWithNearbyBodies(bodies[i]);
            }
        }

        const tileMap = this.#tileMap;
        if (tileMap !== null) {
            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i].hasActiveComponent(Movement)) {
                    this.#collideWithTiles(bodies[i], tileMap);
                }
            }
        }

        const projectiles = this.#projectiles;
        for (let i = 0; i < projectiles.length; i++) {
            if (projectiles[i].hasActiveComponent(Collision)) {
                this.#sweepProjectile(projectiles[i], tileMap);
            }
        }
    }

    #sortActiveEntities() {
        this.#hash.clear();
        const entities = this.#entities;
        const bodies = this.#bodies;
        const projectiles = this.#projectiles;
        bodies.length = 0;
        projectiles.length = 0;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (!entity.hasActiveComponent(Collision)) continue;
            const collision = entity.getComponent('collision');
            if (collision.shape === CollisionShape.POINT) {
                projectiles.push(entity);
                continue;
            }
            bodies.push(entity);
            const { x, y } = collision.pos;
            this.#hash.insert(entity, x - collision.halfWidth, y - collision.halfHeight, x + collision.halfWidth, y + collision.halfHeight);
        }
    }

    #collideWithNearbyBodies(entity : Entity) {
        const collision = entity.getComponent('collision');
        const { x, y } = collision.pos;
        this.#pairEntity = entity;
        this.#pairOrder = this.#order.get(entity)!;
        this.#hash.query(x - collision.halfWidth, y - collision.halfHeight, x + collision.halfWidth, y + collision.halfHeight, this.#visitPairCandidate);
        this.#pairEntity = null;
    }

    #visitPairCandidate = (other : Entity) => {
        const entity = this.#pairEntity;
        if (entity === null || this.#order.get(other)! <= this.#pairOrder) return;
        if (!entity.hasActiveComponent(Collision) || !other.hasActiveComponent(Collision)) return;
        const collision = entity.getComponent('collision');
        const otherCollision = other.getComponent('collision');
        if (!collision.canCollideWith(otherCollision)) return;
        this.pairsTested++;
        const push = this.#push;
        if (!collision.separationFrom(otherCollision, push)) return;

        collision.setAsCollided();
        otherCollision.setAsCollided();
        collision.testBehaviours(otherCollision);

        const entityMoves = entity.hasActiveComponent(Movement);
        const otherMoves = other.hasActiveComponent(Movement);
        if (entityMoves && otherMoves) {
            push.scale(0.5);
        }
        if (entityMoves) {
            entity.pos.add(push);
        }
        if (otherMoves) {
            other.pos.sub(push);
        }
    };

    #collideWithTiles(entity : Entity, tileMap : TileMap) {
        const collision = entity.getComponent('collision');
        const pos = collision.pos;
        const firstTileX = Math.floor((pos.x - collision.halfWidth) / TILE_SIZE);
        const lastTileX = Math.floor((pos.x + collision.halfWidth) / TILE_SIZE);
        const firstTileY = Math.floor((pos.y - collision.halfHeight) / TILE_SIZE);
        const lastTileY = Math.floor((pos.y + collision.halfHeight) / TILE_SIZE);

        for (let tileY = firstTileY; tileY <= lastTileY; tileY++) {
            for (let tileX = firstTileX; tileX <= lastTileX; tileX++) {
                if (!tileMap.isSolidTile(tileX, tileY)) continue;
                this.#tileBox.pos.set((tileX + 0.5) * TILE_SIZE, (tileY + 0.5) * TILE_SIZE);
                if (collision.separationFromBox(this.#tileBox, this.#push)) {
                    entity.pos.add(this.#push);
                    collision.setAsCollided();
                }
            }
        }
    }

    #sweepProjectile(projectile : Entity, tileMap : TileMap | null) {
        const collision = projectile.getComponent('collision');
        const from = this.#sweepFrom.copy(projectile.components.movement?.stepStart ?? projectile.pos);
        const to = this.#sweepTo.copy(projectile.pos);

        this.#sweepCollision = collision;
        this.#sweepFraction = NO_HIT;
        this.#sweepTarget = null;
        this.#hash.query(Math.min(from.x, to.x), Math.min(from.y, to.y), Math.max(from.x, to.x), Math.max(from.y, to.y), this.#visitSweepCandidate);
        this.#sweepCollision = null;

        const wallFraction = tileMap === null ? NO_HIT : wallEntryAlong(tileMap, from, to);
        const target = this.#sweepTarget as Entity | null;
        if (target !== null && this.#sweepFraction <= wallFraction) {
            this.#placeAlongSweep(projectile, this.#sweepFraction);
            const targetCollision = target.getComponent('collision');
            collision.setAsCollided();
            targetCollision.setAsCollided();
            collision.testBehaviours(targetCollision);
        } else if (wallFraction !== NO_HIT) {
            this.#placeAlongSweep(projectile, wallFraction);
            collision.setAsCollided();
        }
    }

    #visitSweepCandidate = (other : Entity) => {
        const collision = this.#sweepCollision;
        if (collision === null || !other.hasActiveComponent(Collision)) return;
        const otherCollision = other.getComponent('collision');
        if (!collision.canCollideWith(otherCollision)) return;
        this.pairsTested++;
        const fraction = otherCollision.entryAlong(this.#sweepFrom, this.#sweepTo);
        if (fraction < this.#sweepFraction) {
            this.#sweepFraction = fraction;
            this.#sweepTarget = other;
        }
    };

    #placeAlongSweep(projectile : Entity, fraction : number) {
        const from = this.#sweepFrom, to = this.#sweepTo;
        projectile.pos.x = from.x + (to.x - from.x) * fraction;
        projectile.pos.y = from.y + (to.y - from.y) * fraction;
    }
}

function wallEntryAlong(tileMap : TileMap, from : Vector, to : Vector) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) {
        return tileMap.isSolidTile(Math.floor(from.x / TILE_SIZE), Math.floor(from.y / TILE_SIZE)) ? 0 : NO_HIT;
    }
    const distance = tileMap.raycast(from.x, from.y, dx / length, dy / length, length);
    return distance < length ? distance / length : NO_HIT;
}
