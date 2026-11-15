import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';

export class Damage implements IComponent {
    active = false;
    value : number;
    cooldown : number;

    #cooldownRemaining = 0;

    static reference(components : IComponentDirectory) {
        return components.damage;
    }

    constructor(damage : number = 10, cooldown = 0) {
        this.value = damage;
        this.cooldown = cooldown;
    }

    get isReady() {
        return this.#cooldownRemaining <= 0;
    }

    dealt() {
        this.#cooldownRemaining = this.cooldown;
    }

    update(dt : number) : void {
        if (this.#cooldownRemaining > 0) {
            this.#cooldownRemaining -= dt;
        }
    }

    reset() {
        this.#cooldownRemaining = 0;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.damage = this;
    }
}
