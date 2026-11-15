import { InputAction } from './InputAction';

export type InputActionName = keyof typeof InputAction;
export type KeyMappings = Partial<Record<string, InputActionName>>;
export type KeyBindings = Map<string, InputAction>;

export function resolveKeyMappings(mappings : KeyMappings) : KeyBindings {
    const bindings : KeyBindings = new Map();
    const codes = Object.keys(mappings);
    for (let i = 0; i < codes.length; i++) {
        const actionName = mappings[codes[i]];
        if (actionName !== undefined) {
            bindings.set(codes[i], InputAction[actionName]);
        }
    }
    console.info('Key Mappings Loaded');
    return bindings;
}
