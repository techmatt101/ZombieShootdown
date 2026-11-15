import type { IVector } from './IVector';

/** A wall edge used for line-of-sight and lighting ray casts. */
export interface Segment {
    a : IVector;
    b : IVector;
}
