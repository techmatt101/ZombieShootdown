import { Vector } from './Vector';

export class Box {
    constructor(public width : number,
                public height : number,
                public pos : Vector = new Vector(0, 0)) {
    }

    get left() {
        return this.pos.x - this.width / 2;
    }

    get right() {
        return this.pos.x + this.width / 2;
    }

    get top() {
        return this.pos.y - this.height / 2;
    }

    get bottom() {
        return this.pos.y + this.height / 2;
    }

    toString() {
        return `Box: {width: ${this.width}, height: ${this.height}}`;
    }
}
