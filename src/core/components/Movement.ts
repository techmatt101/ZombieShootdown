import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import type { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';

export class Movement implements IComponent {
    active = true;
    speed : number;
    friction : number;
    direction  = new Vector(0, 0);
    stepStart = new Vector(0, 0);

    #pos : Point;

    static reference(components : IComponentDirectory) {
        return components.movement;
    }

    constructor(pos : Point, speed = 5, friction = 0) {
        this.#pos = pos;
        this.stepStart.copy(pos);
        this.speed = speed;
        this.friction = friction;
    }

    update(dt : number) : void {
        this.stepStart.copy(this.#pos);
        this.direction.normalize().scale(this.speed * dt);
        this.#pos.add(this.direction);
        if (this.friction < 1) {
            this.#pos.trajectFromDirection((this.speed - this.speed * this.friction) * dt);
        }
    }

    reset() {
        this.direction.reset();
        this.clearPath();
    }

    clearPath() {
        this.stepStart.copy(this.#pos);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }

    build(components : IComponentDirectory) {
        components.movement = this;
    }
}
