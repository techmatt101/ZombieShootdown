class Systems {
    private _systems : ISystem[] = []; //TODO: optimize


    schedule (system : ISystem) {
        this._systems.push(system);
    }

    add (entity : Entity) {
        for (var i = 0; i < this._systems.length; i++) {
            this._systems[i].add(entity);
        }
    }

    update (dt : number) {
        for (var i = 0; i < this._systems.length; i++) {
            this._systems[i].update(dt);
        }
    }
}