import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GamepadAdaptor } from './GamepadAdaptor';
import { GamepadController } from './GamepadController';
import { InputAction } from './InputAction';
import { InputState } from './InputState';
import { Camera } from '../Camera';

interface FakeGamepad {
    axes : number[];
    buttons : Array<{ pressed : boolean }>;
}

let gamepad : FakeGamepad | null;

beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    gamepad = { axes: [0, 0, 0, 0], buttons: [{ pressed: false }, { pressed: false }] };
    vi.stubGlobal('navigator', { getGamepads: () => [gamepad] });
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function setUp() {
    const controller = new GamepadController();
    const state = new InputState();
    controller.load(state);
    controller.loadKeyMappings({ Button1: 'ACTION_1' });
    return { controller, state };
}

describe('GamepadController', () => {
    it('ignores stick movement inside the dead zone', () => {
        const { controller } = setUp();
        gamepad!.axes = [0.2, 0.1, 0, 0];
        controller.update(1);
        expect(controller.leftAxes).toMatchObject({ x: 0, y: 0 });
        gamepad!.axes = [0.8, 0, 0, -0.6];
        controller.update(1);
        expect(controller.leftAxes).toMatchObject({ x: 0.8, y: 0 });
        expect(controller.rightAxes).toMatchObject({ x: 0, y: -0.6 });
    });

    it('presses and releases mapped buttons only when they change', () => {
        const { controller, state } = setUp();
        controller.update(1);
        gamepad!.buttons[1].pressed = true;
        controller.update(1);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(true);
        gamepad!.buttons[1].pressed = false;
        controller.update(1);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(false);
    });

    it('does not fire buttons already held when the gamepad is first seen', () => {
        const { controller, state } = setUp();
        gamepad!.buttons[1].pressed = true;
        controller.update(1);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(false);
    });

    it('does nothing without a connected gamepad', () => {
        const { controller } = setUp();
        gamepad = null;
        expect(() => controller.update(1)).not.toThrow();
    });
});

describe('GamepadAdaptor', () => {
    it('moves with the left stick and takes over aiming with the right stick', () => {
        const camera = new Camera({ x: 600, y: 300 });
        const controller = new GamepadController();
        const adaptor = new GamepadAdaptor(controller, camera);
        const state = new InputState();
        adaptor.load(state);
        adaptor.loadKeyMappings({});

        gamepad!.axes = [1, 0, 0, 0];
        adaptor.update(1);
        expect(state.movementCoordinates).toMatchObject({ x: 1, y: 0 });
        expect(state.aimSource).toBeNull();

        gamepad!.axes = [0, 0, 0, 1];
        adaptor.update(1);
        expect(state.aimSource).toBe('gamepad');
        expect(state.directionCoordinates).toMatchObject({ x: 0, y: 150 });
    });
});
