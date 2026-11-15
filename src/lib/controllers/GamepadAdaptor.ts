import { Camera } from '../Camera';
import { GamepadController } from './GamepadController';
import type { IInputController } from './IInputController';
import { InputState } from './InputState';

export class GamepadAdaptor implements IInputController {
    private _gamepadController : GamepadController;
    private _camera : Camera;
    private _inputState : InputState;


    constructor(gamepadController : GamepadController, camera : Camera) {
        this._gamepadController = gamepadController;
        this._camera = camera;
    }

    load(inputState : InputState) {
        this._inputState = inputState;
        this._gamepadController.load(inputState);
    }

    loadKeyMappings(mappings : object) {
        this._gamepadController.loadKeyMappings(mappings);
    }

    update(dt : number) {
        this._gamepadController.update(dt);
        this._inputState.movementCoordinates.copy(this._gamepadController.leftAxes);
        this._inputState.directionCoordinates.copy(this._gamepadController.rightAxes).scale(Math.min(this._camera.size.x, this._camera.size.y) / 2);
    }
}
