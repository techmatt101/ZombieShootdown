/// <reference path="../lib/geometry/Vector.ts" />
/// <reference path="../lib/geometry/Box.ts" />
/// <reference path="../lib/Canvas.ts" />
/// <reference path="view/Camera.ts" />
/// <reference path="Entity.ts" />
/// <reference path="view/SectionsHelper.ts" />
/// <reference path="view/Section.ts" />
/// <reference path="level/MapManager.ts" />
/// <reference path="Drawer.ts" />

class Level {
    private _canvas:Canvas;
    private _camera:Camera;
    private _map:MapManager;
    private _drawer:Drawer;
    private _sectionsHelper:SectionsHelper;

    private _entities:Entity[] = [];
    private _layers:Entity[] = [];


    constructor(canvas:Canvas, drawer:Drawer, map:MapManager) {
        this._canvas = canvas;
        this._camera = new Camera(canvas, map);
        this._map = map;
        this._drawer = drawer;
        this._sectionsHelper = new SectionsHelper(this._camera);


        var g = this._map.mapGenerator.getGird();
        for (var x = 0; x < g.length; x++) {
            for (var y = 0; y < g[x].length; y++) {
                if (g[x][y].type === TileType.WALL) {
                    this.addEntity(new Entity(new Vector(x * tileSize, y * tileSize), tileSize, tileSize, null))
                }
            }

        }
    }

    addLayer(layer:Entity) {
        this._layers.push(layer);
    }

    addEntity(entity:Entity) {
        this._entities.push(entity);
    }

    setObjectToFollow(obj:IBox) {
        this._camera.setTarget(obj);
    }

    update(time) {
//        this._camera.moveToTarget(time);

        this._map.update(time);

        for (var i = 0; i < this._entities.length; i++) {
            this._entities[i].update(time);
            this._entities[i].touching = false;
        }

        for (var i = 0; i < this._entities.length; i++) {
            for (var ii = 0; ii < this._entities.length; ii++) {
                if (this._entities[i] === this._entities[ii]) {
                    continue;
                }
                if (this._entities[i].isBoundingBoxWith(this._entities[ii])) {
                    this._entities[i].touching = true;
                    this._entities[ii].touching = true;
                }
            }
        }

        this._drawer.render(this._entities);
        //this._map.drawDebug(this._drawer.getCTX());
    }
}