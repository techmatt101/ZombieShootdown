import { Vector } from './geometry/Vector';

export class Canvas {
    element : HTMLCanvasElement;
    context : CanvasRenderingContext2D;
    center : Vector;
    width : number;
    height : number;

    constructor(canvas : HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        if (context === null) {
            throw new Error('2D canvas context is not supported');
        }
        this.width = canvas.width;
        this.height = canvas.height;
        this.element = canvas;
        this.context = context;
        this.center = new Vector(this.width / 2, this.height / 2);
    }
}
