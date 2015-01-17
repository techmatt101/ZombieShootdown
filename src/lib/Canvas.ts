/// <reference path="geometry/Vector" />

module ZombieApp {
    export class Canvas {
        element : HTMLCanvasElement;
        center : Vector;
        width : number;
        height : number;
        context;

        constructor(canvas : HTMLCanvasElement) {
            this.width = canvas.width;
            this.height = canvas.height;
            this.element = canvas;
            this.center = new Vector(this.width / 2, this.height / 2);
        }
    }
}