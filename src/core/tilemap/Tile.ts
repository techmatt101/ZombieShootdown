enum TileType {
    EMPTY,
    WALL,
    DOOR,
    FLOOR
}

class Tile {
    type : TileType;

    constructor(type : TileType) {
        this.type = type;
    }
}