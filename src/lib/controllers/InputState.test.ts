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
});
