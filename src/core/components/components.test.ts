import { describe, expect, it } from 'vitest';
import { Collision, CollisionEvent, CollisionLayer, CollisionShape } from './Collision';
import { Damage } from './Damage';
import { Health, HealthEvent } from './Health';
import { Movement } from './Movement';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';

describe('Health', () => {
    it('dies once when it drops to zero, and can be revived with set', () => {
        const health = new Health(10);
        let deaths = 0;
        health.on(HealthEvent.DEATH, () => deaths++);
        health.take(4);
        expect(health.value).toBe(6);
        health.take(10);
        health.take(10);
        expect(deaths).toBe(1);
        health.set(100);
        expect(health).toMatchObject({ value: 100, isDead: false });
        health.take(100);
        expect(deaths).toBe(2);
    });

    it('stops notifying a listener removed with off', () => {
        const health = new Health(1);
        let deaths = 0;
        const onDeath = () => deaths++;
        health.on(HealthEvent.DEATH, onDeath);
        health.off(HealthEvent.DEATH, onDeath);
        health.take(5);
        expect(deaths).toBe(0);
    });
});

describe('Movement', () => {
    it('moves along its direction at its speed regardless of direction length', () => {
        const pos = new Point(0, 0, 0);
        const movement = new Movement(pos, 10, 1);
        movement.direction.set(0, 50);
        movement.update(0.5);
        expect(pos.x).toBeCloseTo(0);
        expect(pos.y).toBeCloseTo(5);
    });

    it('keeps moving along its facing when it has no friction', () => {
        const pos = new Point(0, 0, Math.PI / 2);
        const movement = new Movement(pos, 20, 0);
        movement.update(1);
        expect(pos.y).toBeCloseTo(20);
    });

    it('remembers where each step started, so fast movers can be traced along their path', () => {
        const pos = new Point(5, 5, 0);
        const movement = new Movement(pos, 20, 0);
        movement.update(1);
        expect(movement.stepStart).toMatchObject({ x: 5, y: 5 });
        pos.set(100, 100);
        movement.clearPath();
        expect(movement.stepStart).toMatchObject({ x: 100, y: 100 });
    });

    it('stops steering when reset', () => {
        const movement = new Movement(new Point(0, 0, 0), 10, 1);
        movement.direction.set(1, 1);
        movement.reset();
        expect(movement.direction).toMatchObject({ x: 0, y: 0 });
    });
});

describe('Damage', () => {
    it('is ready again once its cooldown has elapsed', () => {
        const damage = new Damage(6, 1);
        expect(damage.isReady).toBe(true);
        damage.dealt();
        expect(damage.isReady).toBe(false);
        damage.update(0.6);
        expect(damage.isReady).toBe(false);
        damage.update(0.6);
        expect(damage.isReady).toBe(true);
    });
});

describe('DamageCollisionBehavior', () => {
    it('lets the attacker hurt the defender no faster than its cooldown', () => {
        const health = new Health(100);
        const damage = new Damage(6, 1);
        const attacker = new DamageCollisionBehavior().inflictDamage(damage);
        const defender = new DamageCollisionBehavior().acceptDamage(health);
        attacker.action(defender);
        attacker.action(defender);
        expect(health.value).toBe(94);
        damage.update(1);
        attacker.action(defender);
        expect(health.value).toBe(88);
    });
});

describe('Collision', () => {
    it('only pairs with layers both sides are interested in', () => {
        const box = () => new Box(10, 10, new Vector(0, 0));
        const player = new Collision(box(), CollisionLayer.PLAYER, CollisionLayer.ENEMY);
        const zombie = new Collision(box(), CollisionLayer.ENEMY, CollisionLayer.PLAYER | CollisionLayer.ENEMY | CollisionLayer.PROJECTILE);
        const bullet = new Collision(box(), CollisionLayer.PROJECTILE, CollisionLayer.ENEMY);
        expect(player.canCollideWith(zombie)).toBe(true);
        expect(bullet.canCollideWith(zombie)).toBe(true);
        expect(bullet.canCollideWith(player)).toBe(false);
        expect(bullet.canCollideWith(bullet)).toBe(false);
        expect(new Collision(box()).canCollideWith(new Collision(box()))).toBe(true);
    });

    it('runs matching behaviours in whichever direction is dominant', () => {
        const health = new Health(100);
        const zombie = new Collision(new Box(10, 10));
        const player = new Collision(new Box(10, 10));
        zombie.behaviours.zombieDamage = new DamageCollisionBehavior().inflictDamage(new Damage(5));
        player.behaviours.zombieDamage = new DamageCollisionBehavior().acceptDamage(health);
        zombie.buildBehaviours();
        player.buildBehaviours();
        player.testBehaviours(zombie);
        expect(health.value).toBe(95);
    });

    it('pushes a box away from a circle in the opposite direction to the circle', () => {
        const circle = new Collision(new Circle(20, new Vector(0, 0)));
        const box = new Collision(new Box(20, 20, new Vector(25, 0)));
        const circlePush = new Vector(0, 0), boxPush = new Vector(0, 0);
        expect(circle.separationFrom(box, circlePush)).toBe(true);
        expect(box.separationFrom(circle, boxPush)).toBe(true);
        expect(circlePush.x).toBeCloseTo(-5);
        expect(boxPush.x).toBeCloseTo(5);
        expect(circle.shape).toBe(CollisionShape.CIRCLE);
        expect(circle.halfWidth).toBe(20);
        expect(box.halfWidth).toBe(10);
    });

    it('treats a point as having no size, so a swept path never hits it', () => {
        const point = new Collision(new Point(0, 0, 0), CollisionLayer.PROJECTILE, CollisionLayer.ENEMY);
        expect(point.shape).toBe(CollisionShape.POINT);
        expect(point.radius).toBe(0);
        expect(point.entryAlong({ x: -10, y: 0 }, { x: 10, y: 0 })).toBe(Infinity);
        expect(point.separationFrom(new Collision(new Circle(20, new Vector(0, 0))), new Vector(0, 0))).toBe(false);
    });

    it('announces collisions', () => {
        const collision = new Collision(new Box(1, 1));
        let collided = 0;
        collision.on(CollisionEvent.COLLIDE, () => collided++);
        collision.setAsCollided();
        expect(collided).toBe(1);
    });
});
