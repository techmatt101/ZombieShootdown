class LogicSystem implements ISystem {
    private _entities : Entity[] = [];


    add (entity : Entity) {
        this._entities.push(entity);
    }

    update (dt : number) {
        for (var i = 0; i < this._entities.length; i++) {
            this._entities[i].update(dt);
        }
    }
}