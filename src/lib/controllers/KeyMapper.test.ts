import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputAction } from './InputAction';
import { resolveKeyMappings } from './KeyMapper';

beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('resolveKeyMappings', () => {
    it('maps input codes to input actions', () => {
        const bindings = resolveKeyMappings({ KeyW: 'UP', Mouse0: 'ACTION_1', KeyE: 'INTERACT' });
        expect(bindings.get('KeyW')).toBe(InputAction.UP);
        expect(bindings.get('Mouse0')).toBe(InputAction.ACTION_1);
        expect(bindings.get('KeyE')).toBe(InputAction.INTERACT);
        expect(bindings.get('KeyQ')).toBeUndefined();
    });
});
