import type { ISystem } from './systems/ISystem';

export class Systems<T> {
    #systems : ISystem<T>[] = [];


    schedule(system : ISystem<T>) {
        this.#systems.push(system);
    }

    add(object : T) {
        for (const system of this.#systems) {
            system.add(object);
        }
    }

    update(dt : number) {
        for (const system of this.#systems) {
            system.update(dt);
        }
    }
}
