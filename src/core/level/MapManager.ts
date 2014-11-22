class MapManager extends Box implements IUpdate {
    mapGenerator : MapGenerator;
    private _canvas : Canvas;


    constructor (pos : Vector, width, height, canvas : Canvas) {
        super(width, height, pos);
        this._canvas = canvas;
    }

    loadMap (level) {
        var mg = new MapGenerator();
        mg.generate(new Vector(42, 42), new Vector(this.width, this.height), 8, 4);
        this.mapGenerator = mg;

        this.mapGenerator.getGird().loopThrough(function(tile : Tile, pos : Vector, tileSize : Vector) {
            if(tile.type !== TileType.EMPTY) {
                level.addEntity(TileFactory.spawnTile(pos, tileSize, tile));
            }
        });
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }
}
