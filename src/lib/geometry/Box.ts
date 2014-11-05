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

    toString() {
        return 'Box: {width: ' + this.width + ', height: ' + this.height + '}';
    }
}