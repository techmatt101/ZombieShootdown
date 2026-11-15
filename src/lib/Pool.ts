export interface IPool {
    available : boolean;
    reset() : void;
}

export class Pool <T extends IPool> {
    #factory : () => T;
    #objects : T[] = [];
    #available : T[] = [];
    #nextAvailableId = 0;


    constructor(factory : () => T, prepopulate = 0) {
        this.#factory = factory;

        for (let i = 0; i < prepopulate; i++) {
            this.#buildNew();
        }
        this.#updateAvailability();
    }

    getSize() {
        return this.#objects.length;
    }

    acquire() : T {
        let obj : T;
        if (this.#nextAvailableId === -1) {
            this.#updateAvailability();
        }
        if (this.#nextAvailableId === -1) {
            obj = this.#buildNew();
        } else {
            obj = this.#available[this.#nextAvailableId];
            this.#nextAvailableId--;
        }
        obj.reset();
        obj.available = false;
        return obj;
    }

    #buildNew() {
        const newObj = this.#factory();
        this.#objects.push(newObj);

        return newObj;
    }

    #updateAvailability() {
        this.#available = this.#objects.filter((obj) => obj.available);
        this.#nextAvailableId = this.#available.length - 1;
    }
}
