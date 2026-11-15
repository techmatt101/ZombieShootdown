import { InputState } from './InputState';

export interface IInputController {
    load(inputState : InputState);
    loadKeyMappings(mappings : object);
    update(dt : number);
}
