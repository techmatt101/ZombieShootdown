import { describe, expect, it } from 'vitest';
import { ActionToggle } from './ActionToggle';
import { InputAction } from './InputAction';
import { InputState } from './InputState';

describe('ActionToggle', () => {
    it('starts in the state it is given', () => {
        expect(new ActionToggle(new InputState(), InputAction.TOGGLE_DEBUG, true).isOn).toBe(true);
        expect(new ActionToggle(new InputState(), InputAction.TOGGLE_DEBUG, false).isOn).toBe(false);
    });

    it('flips once per press, however long the key is held', () => {
        const input = new InputState();
        const toggle = new ActionToggle(input, InputAction.TOGGLE_DEBUG, false);
        input.setKeyPress(InputAction.TOGGLE_DEBUG);
        toggle.update();
        toggle.update();
        toggle.update();
        expect(toggle.isOn).toBe(true);
        input.setKeyRelease(InputAction.TOGGLE_DEBUG);
        toggle.update();
        expect(toggle.isOn).toBe(true);
        input.setKeyPress(InputAction.TOGGLE_DEBUG);
        toggle.update();
        expect(toggle.isOn).toBe(false);
    });

    it('ignores other actions', () => {
        const input = new InputState();
        const toggle = new ActionToggle(input, InputAction.TOGGLE_DEBUG, false);
        input.setKeyPress(InputAction.INTERACT);
        toggle.update();
        expect(toggle.isOn).toBe(false);
    });

    it('catches a tap that starts and ends between two updates', () => {
        const input = new InputState();
        const toggle = new ActionToggle(input, InputAction.TOGGLE_DEBUG, true);
        input.setKeyPress(InputAction.TOGGLE_DEBUG);
        input.setKeyRelease(InputAction.TOGGLE_DEBUG);
        toggle.update();
        expect(toggle.isOn).toBe(false);
    });

    it('cancels out two taps between updates', () => {
        const input = new InputState();
        const toggle = new ActionToggle(input, InputAction.TOGGLE_DEBUG, true);
        for (let i = 0; i < 2; i++) {
            input.setKeyPress(InputAction.TOGGLE_DEBUG);
            input.setKeyRelease(InputAction.TOGGLE_DEBUG);
        }
        toggle.update();
        expect(toggle.isOn).toBe(true);
    });

    it('ignores presses from before it was made', () => {
        const input = new InputState();
        input.setKeyPress(InputAction.TOGGLE_DEBUG);
        input.setKeyRelease(InputAction.TOGGLE_DEBUG);
        const toggle = new ActionToggle(input, InputAction.TOGGLE_DEBUG, true);
        toggle.update();
        expect(toggle.isOn).toBe(true);
    });
});
