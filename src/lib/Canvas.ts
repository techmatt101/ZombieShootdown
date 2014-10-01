/// <reference path="geometry/Box.ts" />
/// <reference path="geometry/Vector.ts" />

class Canvas extends Box {
    element : HTMLCanvasElement;
    center : Vector;
    context;

    constructor(canvas : HTMLCanvasElement) {
        super(0, 0, canvas.width, canvas.height);
        this.element = canvas;
        this.center = new Vector(canvas.width / 2, canvas.height / 2);
    }
}