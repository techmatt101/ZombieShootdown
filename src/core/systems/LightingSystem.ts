import { Light } from '../components/Light';
import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';
import type { IVector } from '../../lib/geometry/IVector';

export interface LightReceiver {
    setLights(lights : readonly Light[]) : void;
}

export interface LightView {
    isInCurrentOrUpcomingView(point : IVector, margin : number) : boolean;
}

export class LightingSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #litLights : Light[] = [];
    #receiver : LightReceiver;
    #view : LightView | null;

    constructor(receiver : LightReceiver, view : LightView | null = null) {
        this.#receiver = receiver;
        this.#view = view;
    }

    add(entity : Entity) {
        if (entity.hasComponent(Light)) {
            this.#entities.push(entity);
        }
    }

    update(dt : number) {
        const entities = this.#entities;
        const litLights = this.#litLights;
        litLights.length = 0;
        for (let i = 0; i < entities.length; i++) {
            if (!entities[i].active) continue;
            const light = entities[i].getComponent('light');
            if (light.isLit && this.#reachesView(light)) {
                litLights.push(light);
            }
        }
        this.#receiver.setLights(litLights);
    }

    #reachesView(light : Light) {
        return this.#view === null || this.#view.isInCurrentOrUpcomingView(light.pos, light.radius);
    }
}
