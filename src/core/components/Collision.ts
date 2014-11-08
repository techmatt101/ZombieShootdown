class Collision implements IComponent {
    private _box : Box;
    isTouching = false; //TODO: should be private


    constructor(box : Box) {
        this._box = box;
    }

    getBoundary() {
        return this._box;
    }

    test (collision : Collision) {
        if(this._box.isBoundingBoxWith(collision.getBoundary())) {
            this.isTouching = true;
            collision.isTouching = true;
            this._box.pos.add(this._box.getOffset(collision.getBoundary()));

            return true;
        }
        return false;
    }

    update (dt : number) : void {
        this.isTouching = false;
    }

    drawDebug (ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this.isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }
}