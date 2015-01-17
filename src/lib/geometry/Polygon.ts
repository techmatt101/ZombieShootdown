/// <reference path="Vector" />

module ZombieApp {
    export class Polygon implements IShape {
        constructor(public pos : Vector,
                    public points : Vector[]) {
        }
    }
}