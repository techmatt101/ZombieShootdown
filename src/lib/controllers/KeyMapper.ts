import type { InputAction } from './InputAction';

/** Config format: physical key/button code -> InputAction name, e.g. `{ 87: 'UP' }`. */
export type KeyMappings = Record<number, string>;
/** Resolved lookup: physical key/button code -> InputAction. */
export type KeyBindings = Record<number, InputAction>;
export type InputActions = typeof InputAction;

export class KeyMapper {
    static loadKeyMappings(keys : KeyBindings, mappings : KeyMappings | undefined, inputActions : InputActions) {
        for (const [code, actionName] of Object.entries(mappings ?? {})) {
            const mappedInputAction : InputAction | undefined = inputActions[actionName as keyof InputActions];
            if (typeof mappedInputAction !== 'undefined') {
                keys[Number(code)] = mappedInputAction;
            } else {
                console.warn('Unable to find ' + actionName + ' mapping in input actions');
            }
        }
        console.info('Key Mappings Loaded');
    }
}
