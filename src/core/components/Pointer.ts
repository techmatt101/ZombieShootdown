import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Material } from './Material';
import type { Camera } from '../../lib/Camera';
import type { InputState } from '../../lib/controllers/InputState';
import type { Vector } from '../../lib/geometry/Vector';

const MIN_VISIBLE_AIM_DISTANCE = 10;

export class Pointer implements IComponent {
    active = true;
    #input : InputState;
    #pos : Vector;
    #camera : Camera;
    #material : Material;

    static reference(components : IComponentDirectory) {
        return components.pointer;
    }

    constructor(pos : Vector, material : Material, input : InputState, camera : Camera) {
        this.#pos = pos;
        this.#material = material;
        this.#input = input;
        this.#camera = camera;
    }

    update(dt : number) : void {
        if (this.#camera.target !== null) {
            this.#pos.copy(this.#camera.target);
        }
        this.#pos.add(this.#input.directionCoordinates);
        const aim = this.#input.directionCoordinates;
        this.#material.active = Math.abs(aim.x) > MIN_VISIBLE_AIM_DISTANCE || Math.abs(aim.y) > MIN_VISIBLE_AIM_DISTANCE;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.pointer = this;
    }
}
