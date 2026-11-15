import type { ISystem } from './systems/ISystem';

export class Systems<T> {
    #systems : ISystem<T>[] = [];


    schedule(system : ISystem<T>) {
        this.#systems.push(system);
    }

    add(object : T) {
        for (var i = 0; i < this.#systems.length; i++) {
            this.#systems[i].add(object);
        }
    }

    update(dt : number) {
        for (var i = 0; i < this.#systems.length; i++) {
            this.#systems[i].update(dt);
        }
    }
}
