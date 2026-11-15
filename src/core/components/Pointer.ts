import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { Material } from './Material';
import { Camera } from '../../lib/Camera';
import { InputState } from '../../lib/controllers/InputState';
import { Vector } from '../../lib/geometry/Vector';

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
        this.#material.active = Math.abs(this.#input.directionCoordinates.x) > 10 || Math.abs(this.#input.directionCoordinates.y) > 10; //TODO: hmmm... could be better
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.pointer = this;
    }
}
