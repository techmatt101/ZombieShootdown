import { describe, expect, it } from 'vitest';
import { InputAction } from './InputAction';
import { InputState } from './InputState';
import { MouseAndKeyboardAdaptor } from './MouseAndKeyboardAdaptor';
import type { MouseAndKeyboardController } from './MouseAndKeyboardController';
import { Camera } from '../Camera';
import { Vector } from '../geometry/Vector';

function setUp(zoom = 1) {
    const camera = new Camera({ x: 600, y: 300 });
    camera.zoom = zoom;
    camera.setTarget(new Vector(1000, 1000));
    camera.jumpToTarget();
    const controller = { pointerPos: new Vector(0, 0), load() {}, loadKeyMappings() {} };
    const adaptor = new MouseAndKeyboardAdaptor(controller as unknown as MouseAndKeyboardController, camera);
    const state = new InputState();
    adaptor.load(state);
    return { adaptor, state, pointer: controller.pointerPos };
}

describe('MouseAndKeyboardAdaptor', () => {
    it('turns held direction keys into movement', () => {
        const { adaptor, state } = setUp();
        state.setKeyPress(InputAction.RIGHT);
        state.setKeyPress(InputAction.UP);
        adaptor.update(1);
        expect(state.movementCoordinates).toMatchObject({ x: 1, y: -1 });
    });

    it('does not aim until the mouse has moved', () => {
        const { adaptor, state } = setUp();
        adaptor.update(1);
        expect(state.aimSource).toBeNull();
        expect(state.directionCoordinates).toMatchObject({ x: 0, y: 0 });
    });

    it('aims from the player to the world point under the mouse, and keeps aiming while still', () => {
        const { adaptor, state, pointer } = setUp();
        pointer.set(900, 200);
        adaptor.update(1);
        expect(state.aimSource).toBe('mouse');
        expect(state.directionCoordinates).toMatchObject({ x: 300, y: -100 });
        state.directionCoordinates.reset();
        adaptor.update(1);
        expect(state.directionCoordinates).toMatchObject({ x: 300, y: -100 });
    });

    it('places the aim point under the mouse when zoomed', () => {
        const { adaptor, state, pointer } = setUp(2);
        pointer.set(900, 300);
        adaptor.update(1);
        expect(state.directionCoordinates).toMatchObject({ x: 150, y: 0 });
    });

    it('keeps the pointer inside the visible area', () => {
        const { adaptor, state, pointer } = setUp();
        pointer.set(5000, -40);
        adaptor.update(1);
        expect(pointer).toMatchObject({ x: 1200, y: 0 });
        expect(state.directionCoordinates).toMatchObject({ x: 600, y: -300 });
    });

    it('hands aiming back to a gamepad until the mouse moves again', () => {
        const { adaptor, state, pointer } = setUp();
        pointer.set(700, 300);
        adaptor.update(1);
        state.aimSource = 'gamepad';
        state.directionCoordinates.set(7, 7);
        adaptor.update(1);
        expect(state.directionCoordinates).toMatchObject({ x: 7, y: 7 });
    });
});
