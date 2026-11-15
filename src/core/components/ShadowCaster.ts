import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { IVector } from '../../lib/geometry/IVector';
import type { ShadowOccluder } from '../../lighting/casterShadow';

export class ShadowCaster implements IComponent, ShadowOccluder {
    active = true;
    readonly pos : IVector;
    readonly radius : number;

    static reference(components : IComponentDirectory) {
        return components.shadowCaster;
    }

    constructor(pos : IVector, radius : number) {
        this.pos = pos;
        this.radius = radius;
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.shadowCaster = this;
    }
}
