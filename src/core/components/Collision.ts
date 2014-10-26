class Collision implements IComponent {
    private _box : Box;
    private _lastPos : Vector;
    private _isTouching = false;


    constructor(box : Box) {
        this._box = box;
        this._lastPos = this._box.pos.clone();
    }

    getBoundary() {
        return this._box;
    }

    test (collision : Collision) {
        if(this._box.isBoundingBoxWith(collision.getBoundary())) {
            this._isTouching = true;
            collision._isTouching = true;
            this._box.pos.copy(this._lastPos);

            return true;
        }
        return false;
    }

    update (dt : number) : void {
        this._isTouching = false;
        this._lastPos.copy(this._box.pos);
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this._isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }
}