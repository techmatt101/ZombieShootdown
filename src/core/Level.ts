class Level {
    private _camera : Camera;
    private _map : MapManager;
    private _drawer : Drawer;
    //private _sectionsHelper : SectionsHelper;

    private _entities : Entity[] = [];


    constructor (drawer : Drawer, map : MapManager, camera : Camera) {
        this._camera = camera;
        this._map = map;
        this._drawer = drawer;
        //this._sectionsHelper = new SectionsHelper(this._camera);

        var self = this;
        this._map.mapGenerator.loopThroughGrid(function(tile : Tile, pos : Vector, tileSize : Vector) {
            if(tile.type === TileType.WALL) {
                self.addEntity(new Entity('Tile', new Box(tileSize.x, tileSize.y, pos), null));
            }
        });
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
            //this._entities[i].touching = false;
            //
            //for (var ii = 0; ii < this._entities.length; ii++) {
            //    if (!this._entities[i].collision || this._entities[i] === this._entities[ii]) {
            //        continue;
            //    }
            //    if (this._entities[i].isBoundingBoxWith(this._entities[ii])) {
            //        this._entities[i].touching = true;
            //        this._entities[ii].touching = true;
            //        this._entities[i].pos.copy(this._entities[i].lastPos);
            //        this._entities[i].onCollision(this._entities[ii]);
            //    }
            //}
        }

        this._drawer.render(this._entities, this._camera);
        //this._map.drawDebug(this._drawer.getCTX());
    }
}