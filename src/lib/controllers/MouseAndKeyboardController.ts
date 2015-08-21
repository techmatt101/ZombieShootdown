class MouseAndKeyboardController {
    pointerPos = new Vector(0, 0);

    private _keys = {};
    private _inputState : InputState;
    private _canvas : HTMLCanvasElement;
    private _lastPointerPos = new Vector(0, 0);
    private _pointerLockEnabled = false;


    constructor(canvas : HTMLCanvasElement) {
        this._canvas = canvas;
    }

    load(inputState : InputState) {
        this._inputState = inputState;

        // Key Presses
        window.addEventListener('keyup', (e : KeyboardEvent) => {
            this._inputState.setKeyRelease(this._keys[e.keyCode]);
        }, false);

        window.addEventListener('keydown', (e : KeyboardEvent) => {
            this._inputState.setKeyPress(this._keys[e.keyCode]);
        }, false);

        window.addEventListener('mousedown', (e : MouseEvent) => {
            this._inputState.setKeyPress(this._keys[e.button]);
        }, false);

        window.addEventListener('mouseup', (e : MouseEvent) => {
            this._inputState.setKeyRelease(this._keys[e.button]);
        }, false);

        // Disable right click context menu from appearing
        this._canvas.addEventListener('contextmenu', (e : MouseEvent) => {
            e.preventDefault();
        }, false);

        // Mouse Movement
        this._canvas.addEventListener('mousemove', (e : MouseEvent) => {
            if (this._pointerLockEnabled) {
                this.pointerPos.x += e.movementX || (<any>e).mozMovementX || (<any>e).webkitMovementX || 0;
                this.pointerPos.y += e.movementY || (<any>e).mozMovementY || (<any>e).webkitMovementY || 0;
            } else {
                this.pointerPos.x = e.offsetX || e.layerX || 0;
                this.pointerPos.y = e.offsetY || e.layerX || 0;
            }
        }, false);

        // Pointer Lock
        this._canvas.requestPointerLock = this._canvas.requestPointerLock || (<any>this._canvas).mozRequestPointerLock || (<any>this._canvas).webkitRequestPointerLock || null;
        var pointerLockChangeEventName = ("onpointerlockchange" in document) ? 'pointerlockchange' :
            ("onmozpointerlockchange" in document) ? 'mozpointerlockchange' :
                ("onwebkitpointerlockchange" in document) ? 'webkitpointerlockchange' : null;

        if (this._canvas.requestPointerLock !== null && pointerLockChangeEventName !== null) {
            document.addEventListener(pointerLockChangeEventName, this.pointerLockEvent.bind(this), false);
            this.pointerLockEvent();
        }
    }

    loadKeyMappings(mappings : Object) {
        KeyMapper.loadKeyMappings(this._keys, mappings, this._inputState.inputActions);
    }

    private pointerLockEvent() {
        var self = this;
        if (document.pointerLockElement === this._canvas ||
            (<any>document).mozPointerLockElement === this._canvas ||
            (<any>document).webkitPointerLockElement === this._canvas) {
            this._pointerLockEnabled = true;
        }
        else {
            this._pointerLockEnabled = false;
            window.addEventListener('click', function() {
                self._canvas.requestPointerLock();
                window.removeEventListener('click', this);
            });
        }
    }
}