import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IInputController } from './IInputController';
import { InputAction } from './InputAction';
import { InputHandler } from './InputHandler';
import type { InputState } from './InputState';

afterEach(() => {
    vi.unstubAllGlobals();
});

function stubWindow() {
    const listeners = new Map<string, () => void>();
    vi.stubGlobal('window', {
        addEventListener: (type : string, listener : () => void, options? : { signal? : AbortSignal }) => {
            listeners.set(type, listener);
            options?.signal?.addEventListener('abort', () => listeners.delete(type));
        },
    });
    return listeners;
}

describe('InputHandler', () => {
    it('loads and updates every controller with the shared state', () => {
        stubWindow();
        const handler = new InputHandler();
        const loadedWith : InputState[] = [];
        const updatedWith : number[] = [];
        const controller : IInputController = {
            load: (state) => loadedWith.push(state),
            loadKeyMappings: () => {},
            update: (dt) => updatedWith.push(dt),
        };
        handler.loadController(controller);
        handler.load();
        handler.update(0.5);
        expect(loadedWith).toEqual([handler.getState()]);
        expect(updatedWith).toEqual([0.5]);
    });

    it('clears movement and aim before controllers write this frame', () => {
        stubWindow();
        const handler = new InputHandler();
        const state = handler.getState();
        state.movementCoordinates.set(1, 1);
        state.directionCoordinates.set(5, 5);
        handler.update(1);
        expect(state.movementCoordinates).toMatchObject({ x: 0, y: 0 });
        expect(state.directionCoordinates).toMatchObject({ x: 0, y: 0 });
    });

    it('stops listening once its signal is aborted', () => {
        const listeners = stubWindow();
        const lifetime = new AbortController();
        new InputHandler(lifetime.signal);
        expect(listeners.has('blur')).toBe(true);
        lifetime.abort();
        expect(listeners.has('blur')).toBe(false);
    });

    it('releases every key when the window loses focus', () => {
        const listeners = stubWindow();
        const handler = new InputHandler();
        handler.getState().setKeyPress(InputAction.UP);
        listeners.get('blur')!();
        expect(handler.getState().isKeyDown(InputAction.UP)).toBe(false);
    });
});
