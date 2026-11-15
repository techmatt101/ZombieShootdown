import type { IBehavior } from '../behaviours/IBehavior';
import type { CollisionBehaviourList } from '../CollisionBehaviourList';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';
import type { Box } from '../../lib/geometry/Box';

export enum CollisionEvent {
    COLLIDE
}

export enum CollisionLayer {
    DEFAULT = 1,
    PLAYER = 2,
    ENEMY = 4,
    PROJECTILE = 8,
}

export const COLLIDES_WITH_EVERYTHING = 0xffff;

export class Collision implements IComponent, IObserver<CollisionEvent> {
    active = true;
    behaviours : CollisionBehaviourList = {};
    layer : CollisionLayer;
    mask : number;

    #box : Box;
    #isTouching = false;
    #eventHandler = new EventHandler<CollisionEvent>();
    #behaviourList : Array<(behaviours : CollisionBehaviourList) => IBehavior | undefined> = [];

    static reference(components : IComponentDirectory) {
        return components.collision;
    }

    constructor(box : Box, layer = CollisionLayer.DEFAULT, mask = COLLIDES_WITH_EVERYTHING) {
        this.#box = box;
        this.layer = layer;
        this.mask = mask;
    }

    canCollideWith(other : Collision) {
        return (this.mask & other.layer) !== 0 && (other.mask & this.layer) !== 0;
    }

    getBoundary() {
        return this.#box;
    }

    setAsCollided() {
        this.#isTouching = true;
        this.#eventHandler.fire(CollisionEvent.COLLIDE);
    }

    test(collision : Collision) {
        return this.#box.isBoundingBoxWith(collision.getBoundary());
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
        ctx.strokeRect(this.#box.pos.x - this.#box.width / 2, this.#box.pos.y - this.#box.height / 2, this.#box.width, this.#box.height);
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
