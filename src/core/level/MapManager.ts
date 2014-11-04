class MapManager extends Box implements IUpdate {
    //metaData;
    //objects : EntityOld[] = [];
    //graphics = [];
    //audio = [];
    width : number;
    height : number;
    pos : Vector;
    x : number;
    y : number;
    mapGenerator : MapGenerator;
    private _canvas : Canvas;
    //angle : number;


    constructor (pos : Vector, width, height, canvas : Canvas) {
        super(width, height, pos);
        this._canvas = canvas;
    }

    loadMap (level) {
        var mg = new MapGenerator();
        mg.generate(new Vector(32, 32), new Vector(this._canvas.width, this._canvas.height), 14, 24);
        this.mapGenerator = mg;

        this.mapGenerator.loopThroughGrid(function(tile : Tile, pos : Vector, tileSize : Vector) {
            if(tile.type === TileType.WALL) {
                level.addEntity(TileFactory.spawnTile(pos, tileSize));
            }
        });
    }

    update (dt : number) : void {
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }
}
