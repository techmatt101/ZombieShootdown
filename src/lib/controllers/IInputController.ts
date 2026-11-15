import type { InputState } from './InputState';
import type { KeyMappings } from './KeyMapper';

export interface IInputController {
    load(inputState : InputState) : void;
    loadKeyMappings(mappings : KeyMappings) : void;
    update(dt : number) : void;
}
