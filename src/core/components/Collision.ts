import type { IBehavior } from '../behaviours/IBehavior';
import { CollisionBehaviourList } from '../CollisionBehaviourList';
import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { EventHandler, type IObserver } from '../../lib/EventHandler';
import { Box } from '../../lib/geometry/Box';

export enum CollisionEvent {
    COLLIDE
}

export class Collision implements IComponent, IObserver {
    active = true;
    behaviours = new CollisionBehaviourList();

    private _box : Box;
    private _isTouching = false;
    private _eventHandler = new EventHandler<CollisionEvent>();
    private _behaviourList : Array<(behaviours : CollisionBehaviourList) => IBehavior> = [];

    static reference(components : IComponentDirectory) {
        return components.collision;
    }

    constructor(box : Box) {
        this._box = box;
    }

    getBoundary() {
        return this._box;
    }

    setAsCollided() {
        this._isTouching = true;
        this._eventHandler.fire(CollisionEvent.COLLIDE);
    }

    test(collision : Collision) {
        return this._box.isBoundingBoxWith(collision.getBoundary());
    }

    testBehaviours(collision : Collision) {
        for (var i = 0; i < this._behaviourList.length; i++) {
            var our = this._behaviourList[i](this.behaviours),
                their = this._behaviourList[i](collision.behaviours);

            if (typeof their !== 'undefined') {
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
        this._behaviourList = [];
        for (const key in this.behaviours) {
            this._behaviourList.push((b) => b[key]);
        }
    }

    update(dt : number) : void {
        this._isTouching = false;
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = (this._isTouching) ? '#FFFF00' : '#F00';
        ctx.strokeRect(this._box.pos.x - this._box.width / 2, this._box.pos.y - this._box.height / 2, this._box.width, this._box.height);
    }

    build(components : IComponentDirectory) {
        components.collision = this;
        this.buildBehaviours();
    }

    on(event_type : CollisionEvent, callback) {
        this._eventHandler.add(event_type, callback);
    }

    off() {
    }
}
