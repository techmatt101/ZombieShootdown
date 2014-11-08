/// <reference path="Vector" />

class Box implements IShape {
    constructor (public width : number,
                 public height : number,
                 public pos : Vector = new Vector()) {
    }

    isBoundingBoxWith (box : Box) {
        return  this.pos.x - this.width / 2 < box.pos.x + box.width / 2 &&
                this.pos.x + this.width / 2 > box.pos.x - box.width / 2 &&
                this.pos.y - this.height / 2 < box.pos.y + box.height / 2 &&
                this.pos.y + this.height / 2 > box.pos.y - box.height / 2;
    }

    getOffset(box : Box) {
        var offset = this.getIntersectionDepth(box);

        if(Math.abs(offset.x) <= Math.abs(offset.y)) {
            offset.y = 0;
        } else {
            offset.x = 0;
        }

        return offset;
    }

    getIntersectionDepth (rectB : Box ) { //TODO: to optimize when not tired
        // Calculate current and minimum-non-intersecting distances between centers.
        var distanceX = this.pos.x - rectB.pos.x;
        var distanceY = this.pos.y - rectB.pos.y;
        var minDistanceX = this.width / 2 + rectB.width / 2;
        var minDistanceY = this.height / 2 + rectB.height / 2;

        // If we are not intersecting at all, return (0, 0).
        if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
            return new Vector(0,0);

        // Calculate and return intersection depths.
        return new Vector(
            (distanceX > 0) ? minDistanceX - distanceX : -minDistanceX - distanceX,
            (distanceY > 0) ? minDistanceY - distanceY : -minDistanceY - distanceY
        );
    }

    toString() {
        return 'Box: {width: ' + this.width + ', height: ' + this.height + '}';
    }
}