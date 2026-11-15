import type { IBehavior } from '../behaviours/IBehavior';
import { CollisionBehaviourList } from '../CollisionBehaviourList';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { EventHandler, type IObserver, type Listener } from '../../lib/EventHandler';
import { Box } from '../../lib/geometry/Box';

export enum CollisionEvent {
    COLLIDE
}

export class Collision implements IComponent, IObserver<CollisionEvent> {
    active = true;
    behaviours = new CollisionBehaviourList();

    #box : Box;
    #isTouching = false;
    #eventHandler = new EventHandler<CollisionEvent>();
    #behaviourList : Array<(behaviours : CollisionBehaviourList) => IBehavior | undefined> = [];

    static reference(components : IComponentDirectory) {
        return components.collision;
    }

    constructor(box : Box) {
        this.#box = box;
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
        for (const getBehaviour of this.#behaviourList) {
            const our = getBehaviour(this.behaviours),
                their = getBehaviour(collision.behaviours);

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
        for (const key of Object.keys(this.behaviours) as Array<keyof CollisionBehaviourList>) {
            this.#behaviourList.push((b) => b[key]);
        }
    }

    update(dt : number) : void {
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

    off() {
    }
}
