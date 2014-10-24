/// <reference path="Vector" />

class Polygon implements IShape {
    constructor (public pos : Vector,
                 public points : Vector[]) {
    }
}