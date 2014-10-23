/// <reference path="../lib/geometry/Vector.ts" />
/// <reference path="../lib/geometry/Box.ts" />
/// <reference path="../lib/Canvas.ts" />
/// <reference path="view/Camera.ts" />
/// <reference path="Entity.ts" />
/// <reference path="level/MapManager.ts" />
/// <reference path="Drawer.ts" />

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
                self.addEntity(new Entity(pos, tileSize.x, tileSize.y, null));
            }
        });
    }

    addEntity (entity : Entity) {
        this._entities.push(entity);
    }

    setObjectToFollow (obj : Entity) {
        this._camera.setTarget(obj);
    }

    update (time) {
        this._camera.moveToTarget(time);

        this._map.update(time);

        for (var i = 0; i < this._entities.length; i++) {
            this._entities[i].update(time);
            this._entities[i].touching = false;

            for (var ii = 0; ii < this._entities.length; ii++) {
                if (!this._entities[i].collision || this._entities[i] === this._entities[ii]) {
                    continue;
                }
                if (this._entities[i].isBoundingBoxWith(this._entities[ii])) {
                    this._entities[i].touching = true;
                    this._entities[ii].touching = true;
                    this._entities[i].pos.copy(this._entities[i].lastPos);
                    this._entities[i].onCollision(this._entities[ii]);
                }
            }
        }

        this._drawer.render(this._entities, this._camera);
        //this._map.drawDebug(this._drawer.getCTX());
    }
}