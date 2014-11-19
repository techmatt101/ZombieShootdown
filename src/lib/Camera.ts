class Camera {
    public view : Vector;
    public boundary : Box;
    private _canvas : Canvas;
    private _target : Vector;
    private _smoothing = new Vector(2, 2);


    constructor(canvas : Canvas, boundary? : Box) {
        this._canvas = canvas;
        this.view = new Vector(0,0);
        this.boundary = boundary;
    }

    setTarget(targetPos : Vector) {
        this._target = targetPos;
    }

    moveToTarget(time) {
        this.view.x += (((this._canvas.center.x - this._target.x) - this.view.x) / this._smoothing.x) * time; //smooth camera movement
        this.view.y += (((this._canvas.center.y - this._target.y) - this.view.y) / this._smoothing.y) * time;
        //this.retainInBoundary();
    }

    jumpToTarget() {
        this.view.x = this._canvas.center.x - this._target.x;
        this.view.y = this._canvas.center.y - this._target.y;
        //this.retainInBoundary();
    }

    retainInBoundary() { //TODO: broken needs looking at
        // Limit Level to Boundary --------------------//
        if (this.view.x > this.boundary.pos.x) { //check boundary for x
            this.view.x = this.boundary.pos.x;
        } else if (this.view.x - this._canvas.width < -(this.boundary.pos.x + this.boundary.width)) {
            this.view.x = -(this.boundary.pos.x + this.boundary.width) + this._canvas.width;
        }

        if (this.view.y > this.boundary.pos.y) {//check boundary for y
            this.view.y = this.boundary.pos.y;
        } else if (this.view.y - this._canvas.height < -(this.boundary.pos.y + this.boundary.height)) {
            this.view.y = -(this.boundary.pos.y + this.boundary.height) + this._canvas.height;
        }
    }
}