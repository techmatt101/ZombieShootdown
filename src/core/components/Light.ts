import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { IVector } from '../../lib/geometry/IVector';

export interface LightColour {
    r : number;
    g : number;
    b : number;
}

export const WHITE_LIGHT : LightColour = { r: 1, g: 1, b: 1 };
export const NO_LIGHT : LightColour = { r: 0, g: 0, b: 0 };

export interface LightCone {
    aim : { readonly direction : number };
    halfAngle : number;
    softEdge? : number;
}

export interface LightSettings {
    radius : number;
    intensity? : number;
    isSight? : boolean;
    glow? : number;
    colour? : LightColour;
    glowColour? : LightColour;
    cone? : LightCone | null;
    fade? : number;
}

export class Light implements IComponent {
    active = true;
    pos : IVector;
    radius : number;
    intensity : number;
    isSight : boolean;
    glow : number;
    colour : LightColour;
    glowColour : LightColour;
    cone : LightCone | null;
    fade : number;

    static reference(components : IComponentDirectory) {
        return components.light;
    }

    constructor(pos : IVector, { radius, intensity = 1, isSight = false, glow = 0, colour = WHITE_LIGHT, glowColour = colour, cone = null, fade = 1 } : LightSettings) {
        this.pos = pos;
        this.radius = radius;
        this.intensity = intensity;
        this.isSight = isSight;
        this.glow = glow;
        this.colour = colour;
        this.glowColour = glowColour;
        this.cone = cone;
        this.fade = fade;
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
