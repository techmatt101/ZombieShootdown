/// <reference path="Vector" />

class Box implements IShape {
    constructor (public width : number,
                 public height : number,
                 public pos : Vector = new Vector()) {
    }

    isBoundingBoxWith (box : Box) {
        return  this.pos.x < box.pos.x + box.width &&
            this.pos.x + this.width > box.pos.x &&
            this.pos.y < box.pos.y + box.height &&
            this.pos.y + this.height > box.pos.y;
    }
}