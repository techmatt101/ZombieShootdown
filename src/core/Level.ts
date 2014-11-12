class Level {
    private _camera : Camera;
    private _map : MapManager;
    private _entities : Entity[] = [];
    private _systems : SystemManager;


    constructor (map : MapManager, camera : Camera, systems : SystemManager) {
        this._camera = camera;
        this._map = map;
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

    setObjectToFollow (obj : Entity) {
        this._camera.setTarget(obj.pos);
    }

    update (dt) {
        this._camera.moveToTarget(dt);
        this._systems.update(dt);
    }
}