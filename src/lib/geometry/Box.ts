/// <reference path="Vector" />

class Box implements IShape {
    private _offset = new Vector(0, 0);

    constructor(public width : number,
                public height : number,
                public pos : Vector = new Vector(0, 0)) {
    }

    isBoundingBoxWith(box : Box) { //TODO: cache half value
        return this.pos.x - this.width / 2 < box.pos.x + box.width / 2 &&
            this.pos.x + this.width / 2 > box.pos.x - box.width / 2 &&
            this.pos.y - this.height / 2 < box.pos.y + box.height / 2 &&
            this.pos.y + this.height / 2 > box.pos.y - box.height / 2;
    }

    getOffset(box : Box) {
        var offset = this.getIntersectionDepth(box);

        if (Math.abs(offset.x) <= Math.abs(offset.y)) {
            offset.y = 0;
        } else {
            offset.x = 0;
        }

        return offset;
    }

    getIntersectionDepth(rectB : Box) {
        this._offset.x = this.pos.x - rectB.pos.x;
        this._offset.x = ((this._offset.x > 0) ? 1 : -1) * ((this.width + rectB.width) / 2) - this._offset.x;

        this._offset.y = this.pos.y - rectB.pos.y;
        this._offset.y = ((this._offset.y > 0) ? 1 : -1) * ((this.height + rectB.height) / 2) - this._offset.y;

        return this._offset;
    }

    toPolygon() {
        var x = this.pos.x - this.width / 2;
        var y = this.pos.y - this.height / 2;
        var width = this.pos.x + this.width / 2;
        var height = this.pos.y + this.height / 2;

        return [
            { a: { x: x, y: y }, b: { x: width, y: y } },
            { a: { x: width, y: y }, b: { x: width, y: height } },
            { a: { x: width, y: height }, b: { x: x, y: height } },
            { a: { x: x, y: height }, b: { x: x, y: y } }
        ]
    }

    toString() {
        return 'Box: {width: ' + this.width + ', height: ' + this.height + '}';
    }
}