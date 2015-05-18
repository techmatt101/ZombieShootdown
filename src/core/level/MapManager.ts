class MapManager extends Box implements IUpdate {
    mapGenerator : MapGenerator;
    segments = [];
    private _canvas : Canvas;


    constructor(pos : Vector, width, height, canvas : Canvas) {
        super(width, height, pos);
        this._canvas = canvas;
    }

    loadMap(level) {
        var self = this;
        var mg = new MapGenerator();
        mg.generate(new Vector(42, 42), new Vector(this.width, this.height), 8, 4);
        this.mapGenerator = mg;

        this.segments = [
            // Border
            { a: { x: 0, y: 0 }, b: { x: this.width, y: 0 } },
            { a: { x: this.width, y: 0 }, b: { x: this.width, y: this.height } },
            { a: { x: this.width, y: this.height }, b: { x: 0, y: this.height } },
            { a: { x: 0, y: this.height }, b: { x: 0, y: 0 } },
        ];

        this.mapGenerator.getGird().loopThrough(function(tile : Tile, pos : Vector, tileSize : Vector) {
            if (tile.type !== TileType.EMPTY) {
                var entityTile = TileFactory.spawnTile(pos, tileSize, tile);
                level.addEntity(entityTile);

                if (tile.type === TileType.WALL && entityTile.pos.x !== 0 && entityTile.pos.y !== 0 && entityTile.pos.x !== 928 && entityTile.pos.y !== 992) { //TODO: SUPER HACK
                    self.segments = self.segments.concat(entityTile.geometry.toPolygon());
                    console.log("TILE");
                }
            }
        });
    }

    update(dt : number) : void {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }
}