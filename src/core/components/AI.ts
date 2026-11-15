import type { IAI } from '../ai/IAI';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';

export class AI implements IComponent {
    active = true;

    #ai : IAI;

    static reference(components : IComponentDirectory) {
        return components.ai;
    }

    constructor(ai : IAI) {
        this.#ai = ai;
    }

    getAI() {
        return this.#ai;
    }

    update(dt : number) {
        this.#ai.update(dt);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.ai = this;
    }
}
