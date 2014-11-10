enum TileType {
    EMPTY,
    WALL,
    DOOR,
    FLOOR
}

class Tile {
    type : TileType;
    data : any = null;

    constructor(type : TileType) {
        this.type = type;
    }
}