import { afterEach, describe, expect, it, vi } from 'vitest';
import { InputControl } from './InputControl';
import { Material } from './Material';
import { Movement } from './Movement';
import { WeaponHolder } from './WeaponHolder';
import { giveGun } from '../decorators/WeaponiseDecorator';
import { Entity } from '../Entity';
import { spawnPointer } from '../factories/InterfaceFactory';
import { spawnGun } from '../factories/WeaponFactory';
import { Camera } from '../../lib/Camera';
import { InputAction } from '../../lib/controllers/InputAction';
import { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { Pool } from '../../lib/Pool';

vi.mock('../../lib/assets', () => ({ loadImage: () => new Promise(() => {}) }));

afterEach(() => {
    vi.restoreAllMocks();
});

function controlledPlayer() {
    const input = new InputState();
    const player = new Entity('Player', new Point(0, 0, 0), new Box(48, 48));
    const movement = player.addComponent(new Movement(player.pos, 10, 1));
    const control = player.addComponent(new InputControl(player, input));
    player.build();
    return { input, player, movement, control };
}

describe('InputControl', () => {
    it('steers movement from input and faces the aim direction', () => {
        const { input, player, movement, control } = controlledPlayer();
        input.movementCoordinates.set(1, 0);
        input.directionCoordinates.set(0, 5);
        control.update(1);
        expect(movement.direction).toMatchObject({ x: 1, y: 0 });
        expect(player.pos.direction).toBeCloseTo(Math.PI / 2);
    });

    it('keeps facing the same way when there is no aim input', () => {
        const { player, control } = controlledPlayer();
        player.pos.direction = 1.2;
        control.update(1);
        expect(player.pos.direction).toBe(1.2);
    });

    it('fires a held weapon while the fire action is held', () => {
        const { input, player, control } = controlledPlayer();
        const attack = vi.fn();
        player.addComponent(new WeaponHolder(player.pos, { pos: new Point(0, 0, 0), placementOffset: new Vector(0, 0), attack } as never));
        player.build();
        control.update(1);
        input.setKeyPress(InputAction.ACTION_1);
        control.update(1);
        expect(attack).toHaveBeenCalledOnce();
    });

    it('can be handed to another entity', () => {
        const { input, control } = controlledPlayer();
        const other = new Entity('Other', new Point(0, 0, 0), new Box(1, 1));
        const otherMovement = other.addComponent(new Movement(other.pos));
        other.build();
        control.setEntity(other);
        input.movementCoordinates.set(0, 1);
        control.update(1);
        expect(otherMovement.direction).toMatchObject({ x: 0, y: 1 });
    });
});

describe('Pointer', () => {
    it('sits at the aim point and only shows once aiming away from the player', () => {
        const camera = new Camera({ x: 600, y: 300 });
        camera.setTarget(new Vector(100, 100));
        const input = new InputState();
        const pointer = spawnPointer(input, camera);
        const pointerControl = pointer.getComponent('pointer');

        input.directionCoordinates.set(3, 0);
        pointerControl.update(1);
        expect(pointerControl.isShown).toBe(false);

        input.directionCoordinates.set(50, -20);
        pointerControl.update(1);
        expect(pointer.pos).toMatchObject({ x: 150, y: 80 });
        expect(pointerControl.isShown).toBe(true);
    });

    it('is not part of the lit world, so the GPU never draws it', () => {
        const pointer = spawnPointer(new InputState(), new Camera({ x: 600, y: 300 }));
        expect(pointer.components.material).toBeUndefined();
    });
});

describe('giveGun', () => {
    it('arms an entity with a gun that fires bullets from the pool', () => {
        const bullets : Entity[] = [];
        const pool = new Pool<Entity>(() => {
            const bullet = new Entity('Bullet', new Point(0, 0, 0), new Box(8, 5));
            bullets.push(bullet);
            return bullet;
        });
        const player = new Entity('Player', new Point(0, 0, 0), new Box(48, 48));
        giveGun(player, spawnGun(pool));
        player.getComponent('weaponHolder').attack();
        expect(bullets.length).toBe(1);
    });
});
