import { describe, expect, it } from 'vitest';
import { Collision, CollisionEvent, CollisionLayer } from './Collision';
import { Damage } from './Damage';
import { Health, HealthEvent } from './Health';
import { Movement } from './Movement';
import { DamageCollisionBehavior } from '../behaviours/DamageCollisionBehavior';
import { Box } from '../../lib/geometry/Box';
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

    it('announces collisions', () => {
        const collision = new Collision(new Box(1, 1));
        let collided = 0;
        collision.on(CollisionEvent.COLLIDE, () => collided++);
        collision.setAsCollided();
        expect(collided).toBe(1);
    });
});
