import { describe, expect, it } from 'vitest';
import { CollisionSystem } from './CollisionSystem';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Collision, CollisionEvent, CollisionLayer } from '../components/Collision';
import { Damage } from '../components/Damage';
import { Health } from '../components/Health';
import { Movement } from '../components/Movement';
import { Entity } from '../Entity';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import { Point } from '../../lib/geometry/Point';
import { chunksFromRows } from '../../testing/worldFixtures';
import { TILE_SIZE } from '../../world/constants';
import { TileMap } from '../../world/TileMap';

interface BodyOptions {
    moves? : boolean;
    layer? : CollisionLayer;
    mask? : number;
    radius? : number;
}

const BODY_RADIUS = 21;

function body(x : number, y : number, { moves = true, layer, mask, radius } : BodyOptions = {}) {
    const entity = new Entity('Body', new Point(x, y, 0), new Box(48, 48));
    if (moves) {
        entity.addComponent(new Movement(entity.pos));
    }
    const shape = radius === undefined ? entity.geometry : new Circle(radius, entity.pos);
    entity.addComponent(new Collision(shape, layer, mask));
    entity.build();
    return entity;
}

function zombie(x : number, y : number) {
    const entity = body(x, y, { moves: false, layer: CollisionLayer.ENEMY, radius: BODY_RADIUS });
    const health = entity.addComponent(new Health(100));
    const collision = entity.getComponent('collision');
    collision.behaviours.playerDamage = new DamageCollisionBehavior().acceptDamage(health);
    collision.buildBehaviours();
    return { entity, health };
}

function bulletFrom(fromX : number, fromY : number, toX : number, toY : number) {
    const bullet = new Entity('Bullet', new Point(fromX, fromY, 0), new Box(8, 5));
    const movement = bullet.addComponent(new Movement(bullet.pos));
    const collision = bullet.addComponent(new Collision(bullet.pos, CollisionLayer.PROJECTILE, CollisionLayer.ENEMY));
    collision.behaviours.playerDamage = new DamageCollisionBehavior().inflictDamage(bullet.addComponent(new Damage(30)));
    bullet.build();
    collision.on(CollisionEvent.COLLIDE, () => {
        bullet.active = false;
    });
    movement.clearPath();
    bullet.pos.set(toX, toY);
    return bullet;
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

describe('CollisionSystem with round bodies', () => {
    it('pushes overlapping circles apart along the line between them, so crowds spread', () => {
        const system = new CollisionSystem();
        const a = body(0, 0, { radius: BODY_RADIUS }), b = body(20, 20, { radius: BODY_RADIUS });
        system.add(a);
        system.add(b);
        system.update(1);
        expect(Math.hypot(b.pos.x - a.pos.x, b.pos.y - a.pos.y)).toBeCloseTo(BODY_RADIUS * 2);
        expect(b.pos.x - a.pos.x).toBeCloseTo(b.pos.y - a.pos.y);
    });

    it('slides a body diagonally off a wall corner instead of stopping it dead', () => {
        const tileMap = new TileMap(chunksFromRows(['....', '.#..', '....']));
        const system = new CollisionSystem(tileMap);
        const corner = { x: 2 * TILE_SIZE, y: 2 * TILE_SIZE };
        const mover = body(corner.x + 10, corner.y + 10, { radius: BODY_RADIUS });
        system.add(mover);
        system.update(1);
        expect(Math.hypot(mover.pos.x - corner.x, mover.pos.y - corner.y)).toBeCloseTo(BODY_RADIUS);
        expect(mover.pos.x - corner.x).toBeCloseTo(mover.pos.y - corner.y);
    });

    it('slides smoothly along a flat wall, without catching on the seams between tiles', () => {
        const tileMap = new TileMap(chunksFromRows(['....', '....', '####']));
        const system = new CollisionSystem(tileMap);
        const seamX = 2 * TILE_SIZE;
        const mover = body(seamX, 2 * TILE_SIZE - 15, { radius: BODY_RADIUS });
        system.add(mover);
        system.update(1);
        expect(mover.pos.x).toBeCloseTo(seamX);
        expect(mover.pos.y).toBeCloseTo(2 * TILE_SIZE - BODY_RADIUS);
    });
});

describe('CollisionSystem projectiles', () => {
    it('hits a zombie it would have skipped straight past in one big step', () => {
        const system = new CollisionSystem();
        const target = zombie(100, 0);
        const bullet = bulletFrom(0, 0, 400, 0);
        system.add(target.entity);
        system.add(bullet);
        system.update(1);
        expect(target.health.value).toBe(70);
        expect(bullet.active).toBe(false);
        expect(bullet.pos.x).toBeCloseTo(100 - BODY_RADIUS);
    });

    it('hits only the nearest of two zombies in its path, whatever order they were added in', () => {
        const system = new CollisionSystem();
        const far = zombie(300, 0), near = zombie(150, 0);
        system.add(far.entity);
        system.add(near.entity);
        system.add(bulletFrom(0, 0, 400, 0));
        system.update(1);
        expect(near.health.value).toBe(70);
        expect(far.health.value).toBe(100);
    });

    it('cannot skip through a wall one tile thick, stopping at its surface', () => {
        const tileMap = new TileMap(chunksFromRows(['..#....']));
        const system = new CollisionSystem(tileMap);
        const behindWall = zombie(5 * TILE_SIZE, TILE_SIZE / 2);
        const bullet = bulletFrom(TILE_SIZE / 2, TILE_SIZE / 2, 6 * TILE_SIZE, TILE_SIZE / 2);
        system.add(behindWall.entity);
        system.add(bullet);
        system.update(1);
        expect(bullet.active).toBe(false);
        expect(bullet.pos.x).toBeCloseTo(2 * TILE_SIZE);
        expect(behindWall.health.value).toBe(100);
    });

    it('flies on untouched through open space, and never shoves the bodies it misses', () => {
        const tileMap = new TileMap(chunksFromRows(['.......']));
        const system = new CollisionSystem(tileMap);
        const bystander = zombie(100, 60);
        const bullet = bulletFrom(0, TILE_SIZE / 2, 200, TILE_SIZE / 2);
        system.add(bystander.entity);
        system.add(bullet);
        system.update(1);
        expect(bullet.active).toBe(true);
        expect(bullet.pos.x).toBe(200);
        expect(bystander.entity.pos.y).toBe(60);
    });
});
