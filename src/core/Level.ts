class Level {
    private _camera : Camera;
    private _map : MapManager;
    private _drawer : Drawer;
    private _entities : Entity[] = [];


    constructor (drawer : Drawer, map : MapManager, camera : Camera) {
        this._camera = camera;
        this._map = map;
        this._drawer = drawer;
    }

    addEntity (entity : Entity) {
        this._entities.push(entity);
    }

    addEntities (entities : Entity[]) {
        for (var i = 0; i < entities.length; i++) {
            this._entities.push(entities[i]);
        }
    }

    setObjectToFollow (obj : Entity) {
        this._camera.setTarget(obj.pos);
    }

    update (dt) {
        this._camera.moveToTarget(dt);

        this._map.update(dt);

        for (var i = 0; i < this._entities.length; i++) {
            this._entities[i].update(dt);

            if(this._entities[i].components.has(Collision)) {
                var collision = <Collision> this._entities[i].components.get(Collision);
                for (var ii = 0; ii < this._entities.length; ii++) {
                    if (this._entities[i] !== this._entities[ii] && this._entities[ii].components.has(Collision)) {
                        collision.test(<Collision> this._entities[ii].components.get(Collision));
                    }
                }
            }
        }

        this._drawer.render(this._entities, this._camera);
        //this._map.drawDebug(this._drawer.getCTX());
    }
}