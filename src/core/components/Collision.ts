import type { IBehavior } from '../behaviours/IBehavior';
import type { CollisionBehaviourList } from '../CollisionBehaviourList';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';
import { Box } from '../../lib/geometry/Box';
import { Circle } from '../../lib/geometry/Circle';
import type { IVector } from '../../lib/geometry/IVector';
import { NO_HIT, segmentBoxEntry, segmentCircleEntry, separateBoxes, separateCircleFromBox, separateCircles } from '../../lib/geometry/overlap';
import { Vector } from '../../lib/geometry/Vector';

export enum CollisionEvent {
    COLLIDE
}

export enum CollisionLayer {
    DEFAULT = 1,
    PLAYER = 2,
    ENEMY = 4,
    PROJECTILE = 8,
}

export enum CollisionShape {
    BOX,
    CIRCLE,
    POINT,
}

export type CollisionBody = Box | Circle | Vector;

export const COLLIDES_WITH_EVERYTHING = 0xffff;
const POINT_MARKER_SIZE = 3;

export class Collision implements IComponent, IObserver<CollisionEvent> {
    active = true;
    behaviours : CollisionBehaviourList = {};
    layer : CollisionLayer;
    mask : number;
    shape : CollisionShape;
    pos : Vector;

    #box : Box | null;
    #circle : Circle | null;
    #scratchPush = new Vector(0, 0);
    #isTouching = false;
    #eventHandler = new EventHandler<CollisionEvent>();
    #behaviourList : Array<(behaviours : CollisionBehaviourList) => IBehavior | undefined> = [];

    static reference(components : IComponentDirectory) {
        return components.collision;
    }

    constructor(body : CollisionBody, layer = CollisionLayer.DEFAULT, mask = COLLIDES_WITH_EVERYTHING) {
        this.layer = layer;
        this.mask = mask;
        this.#box = body instanceof Box ? body : null;
        this.#circle = body instanceof Circle ? body : null;
        this.shape = shapeOf(body);
        this.pos = body instanceof Vector ? body : body.pos;
    }

    get radius() {
        return this.#circle?.radius ?? 0;
    }

    get halfWidth() {
        return this.#box === null ? this.radius : this.#box.width / 2;
    }

    get halfHeight() {
        return this.#box === null ? this.radius : this.#box.height / 2;
    }

    canCollideWith(other : Collision) {
        return (this.mask & other.layer) !== 0 && (other.mask & this.layer) !== 0;
    }

    setAsCollided() {
        this.#isTouching = true;
        this.#eventHandler.fire(CollisionEvent.COLLIDE);
    }

    test(collision : Collision) {
        return this.separationFrom(collision, this.#scratchPush);
    }

    separationFrom(other : Collision, push : Vector) {
        const otherBox = other.#box, otherCircle = other.#circle;
        if (otherBox !== null) {
            return this.separationFromBox(otherBox, push);
        }
        if (otherCircle === null) return false;
        if (this.#circle !== null) {
            return separateCircles(this.#circle, otherCircle, push);
        }
        if (this.#box === null || !separateCircleFromBox(otherCircle, this.#box, push)) return false;
        push.reverse();
        return true;
    }

    separationFromBox(box : Box, push : Vector) {
        if (this.#circle !== null) {
            return separateCircleFromBox(this.#circle, box, push);
        }
        if (this.#box !== null) {
            return separateBoxes(this.#box, box, push);
        }
        return false;
    }

    entryAlong(from : IVector, to : IVector) {
        if (this.#circle !== null) {
            return segmentCircleEntry(from, to, this.#circle);
        }
        if (this.#box !== null) {
            return segmentBoxEntry(from, to, this.#box);
        }
        return NO_HIT;
    }

    testBehaviours(collision : Collision) {
        const behaviourList = this.#behaviourList;
        for (let i = 0; i < behaviourList.length; i++) {
            const our = behaviourList[i](this.behaviours),
                their = behaviourList[i](collision.behaviours);

            if (our !== undefined && their !== undefined) {
                if (our.dominant && their.passive) {
                    our.action(their);
                }
                if (their.dominant && our.passive) {
                    their.action(our);
                }
            }
        }
    }

    buildBehaviours() {
        this.#behaviourList = [];
        const keys = Object.keys(this.behaviours) as Array<keyof CollisionBehaviourList>;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.#behaviourList.push((b) => b[key]);
        }
    }

    update(dt : number) : void {
        this.#isTouching = false;
    }

    reset() {
        this.#isTouching = false;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this.#isTouching) ? '#FFFF00' : '#F00';
        const { x, y } = this.pos;
        if (this.#circle !== null) {
            ctx.beginPath();
            ctx.arc(x, y, this.#circle.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.#box !== null) {
            ctx.strokeRect(this.#box.left, this.#box.top, this.#box.width, this.#box.height);
        } else {
            ctx.strokeRect(x - POINT_MARKER_SIZE, y - POINT_MARKER_SIZE, POINT_MARKER_SIZE * 2, POINT_MARKER_SIZE * 2);
        }
    }

    build(components : IComponentDirectory) {
        components.collision = this;
        this.buildBehaviours();
    }

    on(event_type : CollisionEvent, callback : Listener) {
        this.#eventHandler.add(event_type, callback);
    }

    off(event : CollisionEvent, callback : Listener) {
        this.#eventHandler.remove(event, callback);
    }
}

function shapeOf(body : CollisionBody) {
    if (body instanceof Box) return CollisionShape.BOX;
    if (body instanceof Circle) return CollisionShape.CIRCLE;
    return CollisionShape.POINT;
}
