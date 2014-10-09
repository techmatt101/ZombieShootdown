/// <reference path="../geometry/Vector.ts" />

enum InputAction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    ACTION_1,
    ACTION_2,
    ACTION_3,
    MENU,
}

class InputController {
    private _pressed = {}; //InputAction.UP: true //example
    private _keyMapper = {}; //87: InputAction.UP //example
    private _pointerPos = new Vector(0,0);


    constructor (canvas : HTMLCanvasElement) {
        var self = this;

        //load all actions into pressed to prevent undefined on lookups
        for(var action in InputAction) {
            this._pressed[action] = false;
        }

        window.addEventListener('keyup', function (e : KeyboardEvent) {
            self.onUp(e.keyCode);
        }, false);

        window.addEventListener('keydown', function (e : KeyboardEvent) {
            self.onDown(e.keyCode);
        }, false);

        window.addEventListener('mousedown', function (e : MouseEvent) {
            self.onDown(e.button)
        }, false);

        window.addEventListener('mouseup', function (e : MouseEvent) {
            self.onUp(e.button)
        }, false);

        canvas.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);

        canvas.addEventListener('mousemove', function (e : MouseEvent) {
            self.onMove(e);
        }, false);
    }

    loadKeyMappings (mappings : Object) {
        this._keyMapper = mappings;
        for(var mapper in this._keyMapper) {
            this._keyMapper[mapper] = InputAction[this._keyMapper[mapper]];
        }
        console.info('Key Mappings Loaded', this);
    }

    private onDown (e) {
        if(typeof this._keyMapper[e] !== 'undefined') {
            this._pressed[this._keyMapper[e]] = true;
        }
    }

    private onUp (e) {
        if(typeof this._keyMapper[e] !== 'undefined') {
            this._pressed[this._keyMapper[e]] = false;
        }
    }

    private onMove (e : MouseEvent) {
        this._pointerPos.x = e.offsetX;
        this._pointerPos.y = e.offsetY;
    }

    private onMoveLegacy (e : MouseEvent) { //TODO: implement switch
        this._pointerPos.x = e.layerX;
        this._pointerPos.y = e.layerY;
    }

    getPointerPos() {
        return this._pointerPos;
    }

    isDown (action : InputAction) {
        return this._pressed[action];
    }
}