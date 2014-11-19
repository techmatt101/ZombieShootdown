/// <reference path="Vector" />

class Box implements IShape {
    private _offset = new Vector(0, 0);

    constructor (public width : number,
                 public height : number,
                 public pos : Vector = new Vector(0, 0)) {
    }

    isBoundingBoxWith (box : Box) {
        return this.pos.x - this.width / 2 < box.pos.x + box.width / 2 &&
        this.pos.x + this.width / 2 > box.pos.x - box.width / 2 &&
        this.pos.y - this.height / 2 < box.pos.y + box.height / 2 &&
        this.pos.y + this.height / 2 > box.pos.y - box.height / 2;
    }

    getOffset (box : Box) {
        var offset = this.getIntersectionDepth(box);

        if (Math.abs(offset.x) <= Math.abs(offset.y)) {
            offset.y = 0;
        } else {
            offset.x = 0;
        }

        return offset;
    }

    getIntersectionDepth (rectB : Box) {
         this._offset.x = this.pos.x - rectB.pos.x;
         this._offset.x = ((this._offset.x > 0) ? 1 : -1) * ((this.width + rectB.width) / 2) - this._offset.x;

         this._offset.y = this.pos.y - rectB.pos.y;
         this._offset.y = ((this._offset.y > 0) ? 1 : -1) * ((this.height + rectB.height) / 2) - this._offset.y;

         return this._offset;
    }

    toString () {
        return 'Box: {width: ' + this.width + ', height: ' + this.height + '}';
    }
}