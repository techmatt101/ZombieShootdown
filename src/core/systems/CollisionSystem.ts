import { Collision } from '../components/Collision';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import { Box } from '../../lib/geometry/Box';
import { SpatialHash } from '../../lib/SpatialHash';
import { TILE_SIZE } from '../../world/constants';
import type { TileMap } from '../../world/TileMap';

const SPATIAL_CELL_SIZE = 96;

export class CollisionSystem implements ISystem<Entity> {
    pairsTested = 0;

    #entities : Entity[] = [];
    #active : Entity[] = [];
    #order = new Map<Entity, number>();
    #tileMap : TileMap | null;
    #hash = new SpatialHash<Entity>(SPATIAL_CELL_SIZE);
    #tileBox = new Box(TILE_SIZE, TILE_SIZE);

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
        this.#hash.clear();

        const entities = this.#entities;
        const active = this.#active;
        active.length = 0;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.hasActiveComponent(Collision)) {
                active.push(entity);
                const box = entity.geometry;
                this.#hash.insert(entity, box.pos.x - box.width / 2, box.pos.y - box.height / 2, box.pos.x + box.width / 2, box.pos.y + box.height / 2);
            }
        }

        for (let i = 0; i < active.length; i++) {
            this.#collideWithNearbyEntities(active[i]);
        }

        const tileMap = this.#tileMap;
        if (tileMap !== null) {
            for (let i = 0; i < active.length; i++) {
                if (active[i].hasActiveComponent(Movement)) {
                    this.#collideWithTiles(active[i], tileMap);
                }
            }
        }
    }

    #collideWithNearbyEntities(entity : Entity) {
        const collision = entity.getComponent('collision');
        const box = entity.geometry;
        const order = this.#order.get(entity)!;
        this.#hash.query(box.pos.x - box.width / 2, box.pos.y - box.height / 2, box.pos.x + box.width / 2, box.pos.y + box.height / 2, (other) => {
            if (this.#order.get(other)! <= order) return;
            this.pairsTested++;
            const otherCollision = other.getComponent('collision');
            if (!collision.test(otherCollision)) return;

            collision.setAsCollided();
            otherCollision.setAsCollided();
            collision.testBehaviours(otherCollision);

            const offset = collision.getBoundary().getOffset(otherCollision.getBoundary());
            const entityMoves = entity.hasActiveComponent(Movement);
            const otherMoves = other.hasActiveComponent(Movement);
            if (entityMoves && otherMoves) {
                offset.scale(0.5);
            }
            if (entityMoves) {
                entity.pos.add(offset);
            }
            if (otherMoves) {
                other.pos.sub(offset);
            }
        });
    }

    #collideWithTiles(entity : Entity, tileMap : TileMap) {
        const collision = entity.getComponent('collision');
        const box = collision.getBoundary();
        const firstTileX = Math.floor((box.pos.x - box.width / 2) / TILE_SIZE);
        const lastTileX = Math.floor((box.pos.x + box.width / 2) / TILE_SIZE);
        const firstTileY = Math.floor((box.pos.y - box.height / 2) / TILE_SIZE);
        const lastTileY = Math.floor((box.pos.y + box.height / 2) / TILE_SIZE);

        for (let tileY = firstTileY; tileY <= lastTileY; tileY++) {
            for (let tileX = firstTileX; tileX <= lastTileX; tileX++) {
                if (!tileMap.isSolidTile(tileX, tileY)) continue;
                this.#tileBox.pos.set((tileX + 0.5) * TILE_SIZE, (tileY + 0.5) * TILE_SIZE);
                if (box.isBoundingBoxWith(this.#tileBox)) {
                    entity.pos.add(box.getOffset(this.#tileBox));
                    collision.setAsCollided();
                }
            }
        }
    }
}
