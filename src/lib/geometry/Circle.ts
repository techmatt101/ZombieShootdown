/// <reference path="Vector.ts" />

class Circle extends Vector {
    radius : number;


    constructor (x, y, radius) {
        super(x, y);
        this.radius = radius;
    }
}