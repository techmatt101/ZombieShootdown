import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { IVector } from '../../lib/geometry/IVector';

export interface LightSettings {
    radius : number;
    intensity? : number;
    behindWalls? : number;
    glow? : number;
}

export class Light implements IComponent {
    active = true;
    pos : IVector;
    radius : number;
    intensity : number;
    behindWalls : number;
    glow : number;

    static reference(components : IComponentDirectory) {
        return components.light;
    }

    constructor(pos : IVector, { radius, intensity = 1, behindWalls = 0, glow = 0 } : LightSettings) {
        this.pos = pos;
        this.radius = radius;
        this.intensity = intensity;
        this.behindWalls = behindWalls;
        this.glow = glow;
    }

    get isLit() {
        return this.active && this.intensity > 0;
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.light = this;
    }
}
