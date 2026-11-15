import type { ISystem } from './systems/ISystem';

export class Systems<T> {
    #systems : ISystem<T>[] = [];


    schedule(system : ISystem<T>) {
        this.#systems.push(system);
    }

    add(object : T) {
        const systems = this.#systems;
        for (let i = 0; i < systems.length; i++) {
            systems[i].add(object);
        }
    }

    update(dt : number) {
        const systems = this.#systems;
        for (let i = 0; i < systems.length; i++) {
            systems[i].update(dt);
        }
    }
}
