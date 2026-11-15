import { InputState } from './InputState';
import { KeyMapper, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

export class MouseAndKeyboardController {
    pointerPos = new Vector(0, 0);

    #keys : KeyBindings = {};
    #inputState! : InputState; // set in load()
    #canvas : HTMLCanvasElement;
    #lastPointerPos = new Vector(0, 0);
    #pointerLockEnabled = false;


    constructor(canvas : HTMLCanvasElement) {
        this.#canvas = canvas;
    }

    load(inputState : InputState) {
        this.#inputState = inputState;

        // Key Presses
        window.addEventListener('keyup', (e : KeyboardEvent) => {
            this.#inputState.setKeyRelease(this.#keys[e.keyCode]);
        }, false);

        window.addEventListener('keydown', (e : KeyboardEvent) => {
            this.#inputState.setKeyPress(this.#keys[e.keyCode]);
        }, false);

        window.addEventListener('mousedown', (e : MouseEvent) => {
            this.#inputState.setKeyPress(this.#keys[e.button]);
        }, false);

        window.addEventListener('mouseup', (e : MouseEvent) => {
            this.#inputState.setKeyRelease(this.#keys[e.button]);
        }, false);

        // Disable right click context menu from appearing
        this.#canvas.addEventListener('contextmenu', (e : MouseEvent) => {
            e.preventDefault();
        }, false);

        // Mouse Movement
        this.#canvas.addEventListener('mousemove', (e : MouseEvent) => {
            if (this.#pointerLockEnabled) {
                this.pointerPos.x += e.movementX || (<any>e).mozMovementX || (<any>e).webkitMovementX || 0;
                this.pointerPos.y += e.movementY || (<any>e).mozMovementY || (<any>e).webkitMovementY || 0;
            } else {
                this.pointerPos.x = e.offsetX || e.layerX || 0;
                this.pointerPos.y = e.offsetY || e.layerX || 0;
            }
        }, false);

        // Pointer Lock
        this.#canvas.requestPointerLock = this.#canvas.requestPointerLock || (<any>this.#canvas).mozRequestPointerLock || (<any>this.#canvas).webkitRequestPointerLock || null;
        var pointerLockChangeEventName = ("onpointerlockchange" in document) ? 'pointerlockchange' :
            ("onmozpointerlockchange" in document) ? 'mozpointerlockchange' :
                ("onwebkitpointerlockchange" in document) ? 'webkitpointerlockchange' : null;

        if (this.#canvas.requestPointerLock !== null && pointerLockChangeEventName !== null) {
            document.addEventListener(pointerLockChangeEventName, this.#pointerLockEvent.bind(this), false);
            this.#pointerLockEvent();
        }
    }

    loadKeyMappings(mappings : KeyMappings | undefined) {
        KeyMapper.loadKeyMappings(this.#keys, mappings, this.#inputState.inputActions);
    }

    #pointerLockEvent() {
        if (document.pointerLockElement === this.#canvas ||
            (<any>document).mozPointerLockElement === this.#canvas ||
            (<any>document).webkitPointerLockElement === this.#canvas) {
            this.#pointerLockEnabled = true;
        }
        else {
            this.#pointerLockEnabled = false;
            window.addEventListener('click', () => {
                this.#canvas.requestPointerLock();
            }, { once: true });
        }
    }
}
