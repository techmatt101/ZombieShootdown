import type { IShape } from './IShape';
import { Vector } from './Vector';

export class Polygon implements IShape {
    constructor(public pos : Vector,
                public points : Vector[]) {
    }
}
