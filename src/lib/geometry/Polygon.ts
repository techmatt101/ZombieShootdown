/// <reference path="Vector.ts" />

class Polygon extends Vector {
    points : Vector[] = [];


    constructor (x, y, points) {
        super(x, y);
        this.points = points;
    }
}