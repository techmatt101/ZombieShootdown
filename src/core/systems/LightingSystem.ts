import { Light } from '../components/Light';
import type { Entity } from '../Entity';
import type { ISystem } from './ISystem';

export interface LightReceiver {
    setLights(lights : readonly Light[]) : void;
}

export class LightingSystem implements ISystem<Entity> {
    #entities : Entity[] = [];
    #litLights : Light[] = [];
    #receiver : LightReceiver;

    constructor(receiver : LightReceiver) {
        this.#receiver = receiver;
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
            if (light.isLit) {
                litLights.push(light);
            }
        }
        this.#receiver.setLights(litLights);
    }
}
