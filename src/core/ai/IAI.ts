import type { Segment } from '../../lib/geometry/Segment';

export interface IAI {
    updatePathFind(segments : Segment[]) : void;
    update(dt : number) : void;
}
