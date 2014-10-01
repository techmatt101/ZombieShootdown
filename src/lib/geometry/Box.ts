/// <reference path="Vector.ts" />
/// <reference path="Polygon.ts" />
/// <reference path="IBox.ts" />

class Box extends Vector implements IBox {
    width : number;
    height : number;


    constructor(x, y, width, height) {
        super(x, y);
        this.width = width;
        this.height = height;
    }

//    copy (other) {
//        this.x = other.x;
//        this.y = other.y;
//        this.width = other.width;
//        this.height = other.height;
//        return this;
//    }
//
//    isBoundingBoxWith (box) {
//        return  this.x < box.x + box.width &&
//            this.x + this.width > box.x &&
//            this.y < box.y + box.height &&
//            this.y + this.height > box.y;
//    }
//
//    toPolygon() { //todo: killing performance? maybe get rid of box class or link up with polygon class
//        return new Polygon(this.x, this.y, [
//            new Vector(0, 0),
//            new Vector(this.width, 0),
//            new Vector(this.width, this.height),
//            new Vector(0, this.height)
//        ]);
//    }
}