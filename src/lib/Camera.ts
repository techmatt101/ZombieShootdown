import { Canvas } from './Canvas';
import { Box } from './geometry/Box';
import type { IVector } from './geometry/IVector';
import { Vector } from './geometry/Vector';
import type { IUpdate } from './IUpdate';

export class Camera implements IUpdate {
    public pos : Vector;
    public size : Vector;
    public viewport : Box;
    public viewportOffset : Vector;
    public zoom = 1;
    public boundary : Box | null = null;
    public target : Vector | null = null;
    #smoothing : Vector;


    constructor(canvas : Canvas) {
        this.pos = new Vector(canvas.center.x, canvas.center.y);
        this.size = new Vector(canvas.center.x, canvas.center.y);
        this.viewportOffset = canvas.center;
        this.#smoothing = new Vector(0.00001, 0.00001);
        this.viewport = new Box(0, 0);
    }

    setTarget(targetPos : Vector) {
        this.target = targetPos;
    }

    setBoundary(boundary : Box) {
        this.boundary = boundary;
    }

    setSmoothing(smoothing : Vector) {
        this.#smoothing = smoothing;
    }

    jumpToTarget() {
        if (this.target === null) return;
        this.pos.x = this.target.x;
        this.pos.y = this.target.y;
        this.retainInBoundary();
    }

    retainInBoundary() {
        this.#clampToBoundary(this.pos);
    }

    canSee(point : IVector, margin = 0) {
        return this.#isInViewAround(this.pos, point, margin)
            || this.#isInViewAround(this.#positionOnceSettled(), point, margin);
    }

    #positionOnceSettled() : IVector {
        if (this.target === null) {
            return this.pos;
        }
        return this.#clampToBoundary(new Vector(this.target.x, this.target.y));
    }

    #isInViewAround(center : IVector, point : IVector, margin : number) {
        const halfWidth = this.viewportOffset.x / this.zoom + margin;
        const halfHeight = this.viewportOffset.y / this.zoom + margin;
        return Math.abs(point.x - center.x) <= halfWidth && Math.abs(point.y - center.y) <= halfHeight;
    }

    #clampToBoundary(pos : Vector) {
        if (this.boundary === null) return pos;

        if (this.size.x * 2 < this.boundary.width) {
            if (pos.x - this.size.x < this.boundary.pos.x) {
                pos.x = this.boundary.pos.x + this.size.x;
            } else if (pos.x + this.size.x > this.boundary.width) {
                pos.x = this.boundary.width - this.size.x;
            }
        }

        if (this.size.y * 2 < this.boundary.height) {
            if (pos.y - this.size.y < this.boundary.pos.y) {
                pos.y = this.boundary.pos.y + this.size.y;
            } else if (pos.y + this.size.y > this.boundary.height) {
                pos.y = this.boundary.height - this.size.y;
            }
        }

        return pos;
    }

    update(dt : number) {
        if (this.target === null) return;
        const distanceToTravelX = this.target.x - this.pos.x;
        const distanceToTravelY = this.target.y - this.pos.y;

        const x = distanceToTravelX * distanceToTravelX * distanceToTravelX;
        const y = distanceToTravelY * distanceToTravelY * distanceToTravelY;

        this.pos.x += x * this.#smoothing.x;
        this.pos.y += y * this.#smoothing.y;

        this.retainInBoundary();

        this.size.copy(this.viewportOffset).scale(1 / this.zoom);

        this.viewport.pos.x = this.pos.x - this.size.x;
        this.viewport.pos.y = this.pos.y - this.size.y;
        this.viewport.width = this.pos.x + this.size.x;
        this.viewport.height = this.pos.y + this.size.y;
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
}
