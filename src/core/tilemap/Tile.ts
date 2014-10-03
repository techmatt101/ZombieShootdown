enum TileType {
    EMPTY,
    WALL,
    DOOR,
    FLOOR
}

class Tile {
    type : TileType;
    explored = false;

    constructor(type : TileType) {
        this.type = type;
    }
}