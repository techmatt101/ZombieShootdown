import type { IVector } from './geometry/IVector';
import { Vector } from './geometry/Vector';
import type { IUpdate } from './IUpdate';

export interface ViewBounds {
    left : number;
    top : number;
    right : number;
    bottom : number;
}

const FOLLOW_EASING = 0.00001;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;

function easeTowards(distance : number) {
    const step = distance * distance * distance * FOLLOW_EASING;
    return Math.abs(step) > Math.abs(distance) ? distance : step;
}

export class Camera implements IUpdate {
    pos : Vector;
    zoom = 1;
    target : Vector | null = null;
    readonly screenCentre : Vector;
    readonly halfView : Vector;
    readonly view : ViewBounds = { left: 0, top: 0, right: 0, bottom: 0 };

    constructor(screenCentre : IVector) {
        this.screenCentre = new Vector(screenCentre.x, screenCentre.y);
        this.pos = new Vector(screenCentre.x, screenCentre.y);
        this.halfView = new Vector(screenCentre.x, screenCentre.y);
        this.#updateView();
    }

    setTarget(targetPos : Vector) {
        this.target = targetPos;
    }

    jumpToTarget() {
        if (this.target === null) return;
        this.pos.copy(this.target);
        this.#updateView();
    }

    isInCurrentView(point : IVector, margin = 0) {
        return this.#isInViewAround(this.pos, point, margin);
    }

    isInCurrentOrUpcomingView(point : IVector, margin = 0) {
        return this.isInCurrentView(point, margin)
            || (this.target !== null && this.#isInViewAround(this.target, point, margin));
    }

    worldToScreen(world : IVector, out : Vector) {
        out.x = (world.x - Math.trunc(this.view.left)) * this.zoom;
        out.y = (world.y - Math.trunc(this.view.top)) * this.zoom;
        return out;
    }

    screenToWorld(screen : IVector, out : Vector) {
        out.x = this.view.left + screen.x / this.zoom;
        out.y = this.view.top + screen.y / this.zoom;
        return out;
    }

    zoomBy(amount : number) {
        this.zoom = Math.min(Math.max(this.zoom + amount, MIN_ZOOM), MAX_ZOOM);
        this.#updateView();
    }

    update(dt : number) {
        if (this.target !== null) {
            this.pos.x += easeTowards(this.target.x - this.pos.x);
            this.pos.y += easeTowards(this.target.y - this.pos.y);
        }
        this.#updateView();
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }

    #isInViewAround(centre : IVector, point : IVector, margin : number) {
        const halfWidth = this.screenCentre.x / this.zoom + margin;
        const halfHeight = this.screenCentre.y / this.zoom + margin;
        return Math.abs(point.x - centre.x) <= halfWidth && Math.abs(point.y - centre.y) <= halfHeight;
    }

    #updateView() {
        this.halfView.copy(this.screenCentre).scale(1 / this.zoom);
        this.view.left = this.pos.x - this.halfView.x;
        this.view.top = this.pos.y - this.halfView.y;
        this.view.right = this.pos.x + this.halfView.x;
        this.view.bottom = this.pos.y + this.halfView.y;
    }
}
