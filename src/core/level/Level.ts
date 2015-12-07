class Level {
    protected _entities : Entity[] = [];
    protected _systems : Systems<IUpdate>;


    constructor(systems : Systems<Entity>) {
        this._systems = systems;
    }

    getEntities() {
        return this._entities;
    }

    addEntity(entity : Entity) {
        this._entities.push(entity);
        this._systems.add(entity); //TODO: hmmm....
    }

    addEntities(entities : Entity[]) {
        for (var i = 0; i < entities.length; i++) {
            this.addEntity(entities[i]);
        }
    }
}