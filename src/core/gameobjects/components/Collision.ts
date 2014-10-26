class Collision implements IComponent {
    isTouching = false;
    lastPos : Vector;

    private _box : Box;


    constructor(box : Box) {
        this._box = box;
        this.lastPos = this._box.pos.clone();
    }

    getBoundary() {
        return this._box;
    }

    test (collision : Collision) {
        if(this._box.isBoundingBoxWith(collision.getBoundary())) {
            this.isTouching = true;
            collision.isTouching = true;
            this._box.pos.copy(this.lastPos);

            return true;
        }
        return false;
    }

    update (dt : number) : void {
        this.isTouching = false;
        this.lastPos.copy(this._box.pos);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this.isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }
}