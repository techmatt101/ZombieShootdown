import type { IComponent } from './components/IComponent';
import type { IComponentDirectory } from './components/IComponentDirectory';
import type { Box } from '../lib/geometry/Box';
import type { Point } from '../lib/geometry/Point';
import type { IUpdate } from '../lib/IUpdate';
import type { IPool } from '../lib/Pool';

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
        this.pos = pos;
        geometry.pos = pos;
    }

    addComponent<T extends IComponent>(component : T) : T {
        this.#componentList.push(component);
        component.build(this.components);
        return component;
    }

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
        const componentList = this.#componentList;
        for (let i = 0; i < componentList.length; i++) {
            componentList[i].active = true;
            componentList[i].build(this.components);
        }
    }

    reset() {
        this.active = true;
        const componentList = this.#componentList;
        for (let i = 0; i < componentList.length; i++) {
            componentList[i].reset?.();
        }
    }

    update(dt : number) {
        if (this.active) {
            const componentList = this.#componentList;
            for (let i = 0; i < componentList.length; i++) {
                if (componentList[i].active) {
                    componentList[i].update(dt);
                }
            }
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if (this.active) {
            const componentList = this.#componentList;
            for (let i = 0; i < componentList.length; i++) {
                if (componentList[i].active) {
                    componentList[i].drawDebug(ctx);
                }
            }
        }
    }
}
