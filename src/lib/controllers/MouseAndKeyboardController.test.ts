import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InputAction } from './InputAction';
import { InputState } from './InputState';
import { MouseAndKeyboardController } from './MouseAndKeyboardController';

type Handler = (event : Record<string, unknown>) => void;

function eventTarget() {
    const listeners = new Map<string, Array<{ handler : Handler; once : boolean }>>();
    return {
        addEventListener(type : string, handler : Handler, options? : { once? : boolean; signal? : AbortSignal }) {
            const listener = { handler, once: options?.once === true };
            const forType = listeners.get(type) ?? [];
            forType.push(listener);
            listeners.set(type, forType);
            options?.signal?.addEventListener('abort', () => {
                const current = listeners.get(type) ?? [];
                listeners.set(type, current.filter((candidate) => candidate !== listener));
            });
        },
        dispatch(type : string, event : Record<string, unknown> = {}) {
            const current = listeners.get(type) ?? [];
            const kept = [];
            for (let i = 0; i < current.length; i++) {
                if (!current[i].once) kept.push(current[i]);
            }
            listeners.set(type, kept);
            for (let i = 0; i < current.length; i++) {
                current[i].handler(event);
            }
        },
    };
}

let windowTarget : ReturnType<typeof eventTarget>;
let documentTarget : ReturnType<typeof eventTarget> & { pointerLockElement : unknown };

beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    windowTarget = eventTarget();
    documentTarget = { ...eventTarget(), pointerLockElement: null };
    vi.stubGlobal('window', windowTarget);
    vi.stubGlobal('document', documentTarget);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function setUp(requestPointerLock = vi.fn(async () => {}), signal? : AbortSignal) {
    const canvas = { ...eventTarget(), requestPointerLock };
    const controller = new MouseAndKeyboardController(canvas as unknown as HTMLCanvasElement, signal);
    const state = new InputState();
    controller.load(state);
    controller.loadKeyMappings({ KeyW: 'UP', Mouse0: 'ACTION_1' });
    return { controller, state, canvas };
}

describe('MouseAndKeyboardController', () => {
    it('maps keyboard codes and mouse buttons to actions', () => {
        const { state } = setUp();
        windowTarget.dispatch('keydown', { code: 'KeyW' });
        windowTarget.dispatch('mousedown', { button: 0 });
        expect(state.isKeyDown(InputAction.UP)).toBe(true);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(true);
        windowTarget.dispatch('keyup', { code: 'KeyW' });
        windowTarget.dispatch('mouseup', { button: 0 });
        expect(state.isKeyDown(InputAction.UP)).toBe(false);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(false);
    });

    it('follows the mouse, or accumulates movement while the pointer is locked', () => {
        const { controller, canvas } = setUp();
        canvas.dispatch('mousemove', { offsetX: 100, offsetY: 50, movementX: 0, movementY: 0 });
        expect(controller.pointerPos).toMatchObject({ x: 100, y: 50 });
        documentTarget.pointerLockElement = canvas;
        documentTarget.dispatch('pointerlockchange');
        canvas.dispatch('mousemove', { offsetX: 0, offsetY: 0, movementX: 5, movementY: -3 });
        expect(controller.pointerPos).toMatchObject({ x: 105, y: 47 });
    });

    it('tries to lock the pointer again on the next click after a refusal', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const requestPointerLock = vi.fn(async () => {
            throw new Error('denied');
        });
        setUp(requestPointerLock);
        windowTarget.dispatch('click');
        await new Promise((resolve) => setTimeout(resolve, 0));
        windowTarget.dispatch('click');
        expect(requestPointerLock).toHaveBeenCalledTimes(2);
    });

    it('ignores all input once its signal is aborted', () => {
        const lifetime = new AbortController();
        const requestPointerLock = vi.fn(async () => {});
        const { state } = setUp(requestPointerLock, lifetime.signal);
        lifetime.abort();
        windowTarget.dispatch('keydown', { code: 'KeyW' });
        windowTarget.dispatch('click');
        expect(state.isKeyDown(InputAction.UP)).toBe(false);
        expect(requestPointerLock).not.toHaveBeenCalled();
    });

    it('stops the right-click menu on the canvas', () => {
        const { canvas } = setUp();
        const preventDefault = vi.fn();
        canvas.dispatch('contextmenu', { preventDefault });
        expect(preventDefault).toHaveBeenCalled();
    });
});
