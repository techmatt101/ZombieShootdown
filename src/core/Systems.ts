class Systems<T> {
    private _systems : ISystem<T>[] = [];


    schedule(system : ISystem<T>) {
        this._systems.push(system);
    }

    add(object : T) {
        for (var i = 0; i < this._systems.length; i++) {
            this._systems[i].add(object);
        }
    }

    update(dt : number) {
        for (var i = 0; i < this._systems.length; i++) {
            this._systems[i].update(dt);
        }
    }
}