interface IInputController {
    load(inputState : InputState);
    loadKeyMappings(mappings : Object);
    update(dt : number);
}