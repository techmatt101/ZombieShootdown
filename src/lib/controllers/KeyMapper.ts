import { InputAction } from './InputAction';

export type InputActionName = keyof typeof InputAction;
export type KeyMappings = Partial<Record<string, InputActionName>>;
export type KeyBindings = Map<string, InputAction>;

export function resolveKeyMappings(mappings : KeyMappings) : KeyBindings {
    const bindings : KeyBindings = new Map();
    for (const [code, actionName] of Object.entries(mappings)) {
        if (actionName !== undefined) {
            bindings.set(code, InputAction[actionName]);
        }
    }
    console.info('Key Mappings Loaded');
    return bindings;
}
