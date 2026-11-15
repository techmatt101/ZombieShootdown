import type { IShape } from './IShape';
import { Vector } from './Vector';

export class Circle implements IShape {
    constructor(public radius : number,
                public pos : Vector = new Vector(0, 0)) {
    }
}
