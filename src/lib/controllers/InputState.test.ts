import { describe, expect, it } from 'vitest';
import { InputAction } from './InputAction';
import { InputState } from './InputState';

describe('InputState', () => {
    it('tracks pressed and released actions', () => {
        const state = new InputState();
        state.setKeyPress(InputAction.UP);
        expect(state.isKeyDown(InputAction.UP)).toBe(true);
        state.setKeyRelease(InputAction.UP);
        expect(state.isKeyDown(InputAction.UP)).toBe(false);
    });

    it('ignores unmapped input and releases everything on reset', () => {
        const state = new InputState();
        state.setKeyPress(undefined);
        state.setKeyPress(InputAction.LEFT);
        state.setKeyPress(InputAction.ACTION_1);
        state.reset();
        expect(state.isKeyDown(InputAction.LEFT)).toBe(false);
        expect(state.isKeyDown(InputAction.ACTION_1)).toBe(false);
    });

    it('counts each new press, not key repeats while held', () => {
        const state = new InputState();
        state.setKeyPress(InputAction.TOGGLE_DEBUG);
        state.setKeyPress(InputAction.TOGGLE_DEBUG);
        state.setKeyPress(InputAction.TOGGLE_DEBUG);
        expect(state.pressCount(InputAction.TOGGLE_DEBUG)).toBe(1);
        state.setKeyRelease(InputAction.TOGGLE_DEBUG);
        state.setKeyPress(InputAction.TOGGLE_DEBUG);
        expect(state.pressCount(InputAction.TOGGLE_DEBUG)).toBe(2);
        expect(state.pressCount(InputAction.UP)).toBe(0);
    });
});
