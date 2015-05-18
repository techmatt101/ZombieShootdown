/// <reference path="Vector" />

class Circle implements IShape {
    constructor(public radius : number,
                public pos : Vector = new Vector(0, 0)) {
    }
}