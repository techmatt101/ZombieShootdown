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
    id = crypto.randomUUID();
    type : string;
    pos : Point;
    geometry : Box;
    components : IComponentDirectory = {};
    available = false;
    active = true;

    #componentList : IComponent[] = [];


    constructor(type : string, pos : Point, geometry : Box) {
        this.type = type;
        this.geometry = geometry;
        this.pos = pos; //TODO: hmmmm...
        geometry.pos = pos;
    }

    addComponent<T extends IComponent>(component : T) : T {
        this.#componentList.push(component);
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
        return type.reference(this.components) !== undefined;
    }

    hasActiveComponent(type : ComponentType) {
        return this.active && type.reference(this.components)?.active === true;
    }

    build() {
        for (const component of this.#componentList) {
            component.active = true; //TODO: hmmmm....
            component.build(this.components);
        }
    }

    reset() { ///TODO: hmmm...
        this.active = true;
    }

    update(dt : number) {
        if (this.active) {
            for (const component of this.#componentList) {
                if (component.active) {
                    component.update(dt);
                }
            }
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if (this.active) {
            for (const component of this.#componentList) {
                if (component.active) {
                    component.drawDebug(ctx);
                }
            }
        }
    }
}
