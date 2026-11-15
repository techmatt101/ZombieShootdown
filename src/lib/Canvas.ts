import { Vector } from './geometry/Vector';

const DEFAULT_FILL = '#000';

export class Canvas {
    element : HTMLCanvasElement;
    center : Vector;

    constructor(element : HTMLCanvasElement) {
        this.element = element;
        this.center = new Vector(element.width / 2, element.height / 2);
    }

    get width() {
        return this.element.width;
    }

    get height() {
        return this.element.height;
    }
}

export class HudCanvas extends Canvas {
    context : CanvasRenderingContext2D;

    constructor(element : HTMLCanvasElement) {
        super(element);
        const context = element.getContext('2d');
        if (context === null) {
            throw new Error('2D canvas context is not supported');
        }
        this.context = context;
    }

    beginFrame() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = DEFAULT_FILL;
    }
}
