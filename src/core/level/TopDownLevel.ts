/// <reference path="Level" />

class TopDownLevel extends Level {
    private _camera : Camera;
    private _map : MapManager;


    constructor (map : MapManager, camera : Camera, systems : Systems) {
        super(systems);
        this._map = map;
        this._camera = camera;
    }

    getMap() {
        return this._map;
    }

    setObjectToFollow (obj : Entity) {
        this._camera.setTarget(obj.pos);
    }

    update (dt) {
        this._camera.moveToTarget(dt);
        super.update(dt);
    }
}