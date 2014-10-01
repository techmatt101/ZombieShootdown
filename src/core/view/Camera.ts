/// <reference path="../../lib/geometry/Vector.ts" />
/// <reference path="../../lib/geometry/IBox.ts" />
/// <reference path="../../lib/Canvas.ts" />

class Camera {
    private _canvas : Canvas;
    public view : IBox;
    public boundary : IBox;
    private _target : IBox = new Box(0, 0, 0, 0);
    private _smoothing = new Vector(1.5, 1.5);


    constructor(canvas : Canvas, boundary : IBox) {
        this._canvas = canvas;
        this.view = new Box(0,0, canvas.width, canvas.height);
        this.boundary = boundary;
    }

    setTarget(obj : IBox) {
        this._target = obj;
    }

    moveToTarget(time) {
        this.view.x += (((this._canvas.center.x - this._target.width / 2 - this._target.x) - this.view.x) / this._smoothing.x) * time; //smooth camera movement
        this.view.y += (((this._canvas.center.y - this._target.height / 2 - this._target.y) - this.view.y) / this._smoothing.y) * time;
        this.retainInBoundary();
    }

    jumpToTarget() {
        this.view.x = (this._canvas.center.x - this._target.width / 2 - this._target.x) - this.view.x;
        this.view.y = (this._canvas.center.y - this._target.height / 2 - this._target.y) - this.view.y;
        this.retainInBoundary();
    }

    retainInBoundary() {
        // Limit Level to Boundary --------------------//
        if (this.view.x > this.boundary.x) { //check boundary for x
            this.view.x = this.boundary.x;
        } else if (this.view.x - this._canvas.width < -(this.boundary.x + this.boundary.width)) {
            this.view.x = -(this.boundary.x + this.boundary.width) + this._canvas.width;
        }

        if (this.view.y > this.boundary.y) {//check boundary for y
            this.view.y = this.boundary.y;
        } else if (this.view.y - this._canvas.height < -(this.boundary.y + this.boundary.height)) {
            this.view.y = -(this.boundary.y + this.boundary.height) + this._canvas.height;
        }
    }
}