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

        for (var i = 0; i < prepopulate; i++) {
            this.#buildNew();
        }
        this.#updateAvailability();
    }

    getSize() {
        return this.#objects.length;
    }

    acquire() : T {
        var obj : T;
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
        var newObj = this.#factory();
        this.#objects.push(newObj);

        return newObj;
    }

    #updateAvailability() {
        this.#available = [];
        var objectLength = this.#objects.length;
        for (var i = 0; i < objectLength; i++) {
            if (this.#objects[i].available) {
                this.#available.push(this.#objects[i]);
            }
        }
        this.#nextAvailableId = this.#available.length - 1;
    }
}
