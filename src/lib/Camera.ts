class Camera implements IUpdate {
    public pos : Vector;
    public size : Vector;
    public viewportOffset : Vector;
    public zoom = 1;
    public boundary : Box = null;
    public target : Vector = null;
    private _smoothing : Vector;


    constructor(canvas : Canvas) {
        this.pos = new Vector(canvas.center.x, canvas.center.y);
        this.size = new Vector(canvas.center.x, canvas.center.y);
        this.viewportOffset = canvas.center;
        this._smoothing = new Vector(0.00001, 0.00001);
    }

    setScale(scale : number) {
        this.zoom = scale;
        this.size.copy(this.viewportOffset).scale(1 / this.zoom);
    }

    setTarget(targetPos : Vector) {
        this.target = targetPos;
    }

    setBoundary(boundary : Box) {
        this.boundary = boundary;
    }

    setSmoothing(smoothing : Vector) {
        this._smoothing = smoothing;
    }

    jumpToTarget() {
        this.pos.x = this.target.x;
        this.pos.y = this.target.y;
        this.retainInBoundary();
    }

    retainInBoundary() {
        if (this.boundary === null) return;

        if(this.size.x * 2 < this.boundary.width) {
            if (this.pos.x - this.size.x < this.boundary.pos.x) {
                this.pos.x = this.boundary.pos.x + this.size.x;
            } else if (this.pos.x + this.size.x > this.boundary.width) {
                this.pos.x = this.boundary.width - this.size.x;
            }
        }

        if(this.size.y * 2 < this.boundary.height) {
            if (this.pos.y - this.size.y < this.boundary.pos.y) {
                this.pos.y = this.boundary.pos.y + this.size.y;
            } else if (this.pos.y + this.size.y > this.boundary.height) {
                this.pos.y = this.boundary.height - this.size.y;
            }
        }
    }

    update(dt : number) {
        var distanceToTravelX = this.target.x - this.pos.x;
        var distanceToTravelY = this.target.y - this.pos.y;

        var x = distanceToTravelX * distanceToTravelX * distanceToTravelX;
        var y = distanceToTravelY * distanceToTravelY * distanceToTravelY;

        this.pos.x += x * this._smoothing.x;
        this.pos.y += y * this._smoothing.y;

        this.retainInBoundary();
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
}