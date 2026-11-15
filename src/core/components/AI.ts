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

    reset() {
        this.#ai.reset();
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        this.#ai.drawDebug(ctx);
    }

    build(components : IComponentDirectory) {
        components.ai = this;
    }
}
