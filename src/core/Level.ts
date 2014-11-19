class Level {
    private _entities : Entity[] = [];
    private _systems : SystemManager;


    constructor (systems : SystemManager) {
        this._systems = systems;
    }

    getEntities() {
        return this._entities;
    }

    addEntity (entity : Entity) {
        this._entities.push(entity);
        this._systems.add(entity);
    }

    addEntities (entities : Entity[]) {
        for (var i = 0; i < entities.length; i++) {
            this.addEntity(entities[i]);
        }
    }

    update (dt) {
        this._systems.update(dt);
    }
}