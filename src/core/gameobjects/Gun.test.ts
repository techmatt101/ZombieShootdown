import { describe, expect, it } from 'vitest';
import { Gun, WeaponEvent } from './Gun';
import { Movement } from '../components/Movement';
import { WeaponHolder } from '../components/WeaponHolder';
import { Entity } from '../Entity';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Pool } from '../../lib/Pool';

function armedPlayer() {
    const bullets : Entity[] = [];
    const pool = new Pool<Entity>(() => {
        const bullet = new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5));
        bullet.addComponent(new Movement(bullet.pos, 80));
        bullet.build();
        bullets.push(bullet);
        return bullet;
    });
    const gun = new Gun('Gun', new Point(0, 0, 0), new Box(14, 5), pool);
    const player = new Entity('Player', new Point(100, 100, Math.PI / 2), new Box(48, 48));
    const holder = player.addComponent(new WeaponHolder(player.pos, gun));
    player.build();
    return { gun, holder, bullets };
}

describe('Gun', () => {
    it('is held in front of its holder, facing the same way', () => {
        const { gun, holder } = armedPlayer();
        holder.update(1);
        expect(gun.pos.x).toBeCloseTo(100);
        expect(gun.pos.y).toBeCloseTo(132);
        expect(gun.pos.direction).toBeCloseTo(Math.PI / 2);
    });

    it('fires a bullet from the gun, then waits out its cooldown', () => {
        const { gun, holder, bullets } = armedPlayer();
        holder.update(1);
        holder.attack();
        holder.attack();
        expect(bullets.length).toBe(1);
        expect(bullets[0].pos).toMatchObject({ x: gun.pos.x, y: gun.pos.y, direction: gun.pos.direction });
        gun.update(1.5);
        holder.attack();
        expect(bullets.length).toBe(2);
    });

    it('announces each shot it actually fires', () => {
        const { gun, holder } = armedPlayer();
        let shots = 0;
        gun.on(WeaponEvent.FIRED, () => shots++);
        holder.attack();
        holder.attack();
        expect(shots).toBe(1);
        gun.update(1.5);
        holder.attack();
        expect(shots).toBe(2);
    });

    it('starts a reused bullet\'s path at the gun, not where it last died', () => {
        const { gun, holder, bullets } = armedPlayer();
        holder.attack();
        const bullet = bullets[0];
        bullet.pos.set(5000, 5000);
        bullet.components.movement!.update(1);
        bullet.active = false;
        bullet.available = true;
        gun.update(1.5);
        holder.attack();
        expect(bullets.length).toBe(1);
        expect(bullet.components.movement!.stepStart).toMatchObject({ x: gun.pos.x, y: gun.pos.y });
    });
});
