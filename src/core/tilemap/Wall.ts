/// <reference path="Direction.ts" />
/// <reference path="Tile.ts" />

class Wall {
    tile : Tile;
    direction : Direction;
    corner : boolean;

    constructor(tile : Tile, direction = Direction.NONE, corner = false) {
        this.tile = tile;
        this.direction = direction;
        this.corner = corner;

        tile.type = TileType.WALL;
    }
}