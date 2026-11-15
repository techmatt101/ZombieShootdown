import { InputState } from './InputState';
import { resolveKeyMappings, type KeyBindings, type KeyMappings } from './KeyMapper';
import { Vector } from '../geometry/Vector';

/** Keyboard keys are bound by `KeyboardEvent.code`, mouse buttons as `Mouse<button>`. */
const mouseButtonCode = (e : MouseEvent) => `Mouse${e.button}`;

export class MouseAndKeyboardController {
    pointerPos = new Vector(0, 0);

    #keys : KeyBindings = new Map();
    #inputState! : InputState; // set in load()
    #canvas : HTMLCanvasElement;
    #pointerLockEnabled = false;


    constructor(canvas : HTMLCanvasElement) {
        this.#canvas = canvas;
    }

    load(inputState : InputState) {
        this.#inputState = inputState;

        // Key Presses
        window.addEventListener('keyup', (e) => {
            this.#inputState.setKeyRelease(this.#keys.get(e.code));
        });

        window.addEventListener('keydown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(e.code));
        });

        window.addEventListener('mousedown', (e) => {
            this.#inputState.setKeyPress(this.#keys.get(mouseButtonCode(e)));
        });

        window.addEventListener('mouseup', (e) => {
            this.#inputState.setKeyRelease(this.#keys.get(mouseButtonCode(e)));
        });

        // Disable right click context menu from appearing
        this.#canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Mouse Movement
        this.#canvas.addEventListener('mousemove', (e) => {
            if (this.#pointerLockEnabled) {
                this.pointerPos.x += e.movementX;
                this.pointerPos.y += e.movementY;
            } else {
                this.pointerPos.x = e.offsetX;
                this.pointerPos.y = e.offsetY;
            }
        });

        // Pointer Lock
        document.addEventListener('pointerlockchange', () => this.#onPointerLockChange());
        this.#onPointerLockChange();
    }

    loadKeyMappings(mappings : KeyMappings) {
        this.#keys = resolveKeyMappings(mappings);
    }

    #onPointerLockChange() {
        this.#pointerLockEnabled = document.pointerLockElement === this.#canvas;
        if (!this.#pointerLockEnabled) {
            window.addEventListener('click', async () => {
                try {
                    await this.#canvas.requestPointerLock();
                } catch (error) {
                    console.warn('Pointer lock unavailable', error);
                }
            }, { once: true });
        }
    }
}
