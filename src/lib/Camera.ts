class Camera {
    public view : Vector;
    public boundary : Box;
    public target : Vector;
    private _canvas : Canvas;
    private _smoothing = new Vector(8, 8);


    constructor(canvas : Canvas, boundary? : Box) {
        this._canvas = canvas;
        this.view = new Vector(0, 0);
        this.boundary = boundary;
    }

    setTarget(targetPos : Vector) {
        this.target = targetPos;
    }

    moveToTarget(time) {
        this.view.x += (((this.target.x - this._canvas.center.x) - this.view.x) / this._smoothing.x) * time; //smooth camera movement
        this.view.y += (((this.target.y - this._canvas.center.y) - this.view.y) / this._smoothing.y) * time;
        this.retainInBoundary();
    }

    jumpToTarget() {
        this.view.x = this.target.x - this._canvas.center.x;
        this.view.y = this.target.y - this._canvas.center.y;
        //this.retainInBoundary();
    }

    retainInBoundary() {
        if (this.view.x < this.boundary.pos.x) {
            this.view.x = this.boundary.pos.x;
        } else if (this.view.x + this._canvas.width > this.boundary.width) {
            this.view.x = this.boundary.width - this._canvas.width;
        }

        if (this.view.y < this.boundary.pos.y) {
            this.view.y = this.boundary.pos.y;
        } else if (this.view.y + this._canvas.height > this.boundary.height) {
            this.view.y = this.boundary.height - this._canvas.height;
        }
    }
}