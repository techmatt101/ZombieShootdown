import type { IComponent } from './components/IComponent';
import type { IComponentDirectory } from './components/IComponentDirectory';
import { Box } from '../lib/geometry/Box';
import { Point } from '../lib/geometry/Point';
import type { IUpdate } from '../lib/IUpdate';
import type { IPool } from '../lib/Pool';

/** A component class: exposes a static lookup for its slot in the component directory. */
export interface ComponentType {
    reference(components : IComponentDirectory) : IComponent | undefined;
}

export class Entity implements IUpdate, IPool {
    id = Date.now().toString(32) + (~~(Math.random() * 10000000)).toString(32);
    type : string;
    pos : Point;
    geometry : Box;
    components : IComponentDirectory = {};
    available = false;
    active = true;

    #componentList : IComponent[] = [];
    #componentListLength = 0;


    constructor(type : string, pos : Point, geometry : Box) {
        this.type = type;
        this.geometry = geometry;
        this.pos = pos; //TODO: hmmmm...
        geometry.pos = pos;
    }

    addComponent<T extends IComponent>(component : T) : T {
        this.#componentList.push(component);
        this.#componentListLength++;
        component.build(this.components);
        return component;
    }

    /** Returns a component this entity is known to have; throws if it was never added. */
    getComponent<K extends keyof IComponentDirectory>(key : K) : NonNullable<IComponentDirectory[K]> {
        const component = this.components[key];
        if (component === undefined) {
            throw new Error(`${this.type} has no ${key} component`);
        }
        return component as NonNullable<IComponentDirectory[K]>;
    }

    hasComponent(type : ComponentType) {
        return typeof type.reference(this.components) !== 'undefined';
    }

    hasActiveComponent(type : ComponentType) {
        return this.active && type.reference(this.components)?.active === true;
    }

    build() {
        for (var i = 0; i < this.#componentListLength; i++) {
            this.#componentList[i].active = true; //TODO: hmmmm....
            this.#componentList[i].build(this.components);
        }
    }

    reset() { ///TODO: hmmm...
        this.active = true;
    }

    update(dt : number) {
        if (this.active) {
            for (var i = 0; i < this.#componentListLength; i++) {
                if (this.#componentList[i].active) {
                    this.#componentList[i].update(dt);
                }
            }
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if (this.active) {
            for (var i = 0; i < this.#componentListLength; i++) {
                if (this.#componentList[i].active) {
                    this.#componentList[i].drawDebug(ctx);
                }
            }
        }
    }
}
