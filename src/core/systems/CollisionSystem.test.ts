import { describe, expect, it } from 'vitest';
import { CollisionSystem } from './CollisionSystem';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionEvent, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Health } from '../components/Health';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { TileMap } from '../../world/TileMap';

interface BodyOptions {
    moves? : boolean;
    layer? : CollisionLayer;
    mask? : number;
}

function body(x : number, y : number, { moves = true, layer, mask } : BodyOptions = {}) {
    const entity = new Entity('Body', new Point(x, y, 0), new Box(48, 48));
    if (moves) {
        entity.addComponent(new Movement(entity.pos));
    }
    entity.addComponent(new Collision(entity.geometry, layer, mask));
    entity.build();
    return entity;
}

describe('CollisionSystem', () => {
    it('splits the push between two moving bodies', () => {
        const system = new CollisionSystem();
        const left = body(0, 0), right = body(40, 0);
        system.add(left);
        system.add(right);
        system.update(1);
        expect(left.pos.x).toBeCloseTo(-4);
        expect(right.pos.x).toBeCloseTo(44);
    });

    it('pushes only the moving body away from a static one', () => {
        const system = new CollisionSystem();
        const mover = body(0, 0), wall = body(40, 0, { moves: false });
        system.add(mover);
        system.add(wall);
        system.update(1);
        expect(mover.pos.x).toBeCloseTo(-8);
        expect(wall.pos.x).toBe(40);
    });

    it('ignores pairs whose layers do not interact', () => {
        const system = new CollisionSystem();
        const bullet = body(0, 0, { layer: CollisionLayer.PROJECTILE, mask: CollisionLayer.ENEMY });
        const player = body(10, 0, { layer: CollisionLayer.PLAYER, mask: CollisionLayer.ENEMY });
        system.add(bullet);
        system.add(player);
        system.update(1);
        expect(bullet.pos.x).toBe(0);
        expect(player.pos.x).toBe(10);
        expect(system.pairsTested).toBe(0);
    });

    it('stops a body that was used up earlier in the pass from hitting anything else', () => {
        const system = new CollisionSystem();
        const bullet = body(0, 0, { layer: CollisionLayer.PROJECTILE, mask: CollisionLayer.ENEMY });
        const bulletCollision = bullet.getComponent('collision');
        bulletCollision.behaviours.playerDamage = new DamageCollisionBehavior().inflictDamage(bullet.addComponent(new Damage(30)));
        bulletCollision.buildBehaviours();
        bulletCollision.on(CollisionEvent.COLLIDE, () => {
            bullet.active = false;
        });

        const zombieHealth : Health[] = [];
        for (let i = 0; i < 2; i++) {
            const zombie = body(4 * i, 0, { moves: false, layer: CollisionLayer.ENEMY });
            const health = zombie.addComponent(new Health(100));
            const collision = zombie.getComponent('collision');
            collision.behaviours.playerDamage = new DamageCollisionBehavior().acceptDamage(health);
            collision.buildBehaviours();
            zombieHealth.push(health);
            system.add(zombie);
        }
        system.add(bullet);
        system.update(1);
        expect(zombieHealth[0].value + zombieHealth[1].value).toBe(170);
    });

    it('pushes moving bodies out of solid tiles and reports the hit', () => {
        const tileMap = new TileMap(chunksFromRows(['....#', '....#', '....#']));
        const system = new CollisionSystem(tileMap);
        const mover = body(4 * TILE_SIZE - 10, TILE_SIZE * 1.5);
        let hits = 0;
        mover.getComponent('collision').on(CollisionEvent.COLLIDE, () => hits++);
        system.add(mover);
        system.update(1);
        expect(mover.pos.x).toBeCloseTo(4 * TILE_SIZE - 24);
        expect(hits).toBeGreaterThan(0);
    });
});
