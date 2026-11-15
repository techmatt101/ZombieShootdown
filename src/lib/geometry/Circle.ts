import { Vector } from './Vector';

export class Circle {
    constructor(public radius : number,
                public pos : Vector = new Vector(0, 0)) {
    }

    toString() {
        return `Circle: {radius: ${this.radius}}`;
    }
}
