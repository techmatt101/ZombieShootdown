/// <reference path="Direction.ts" />
/// <reference path="Tile.ts" />

class Wall {
    pos : Vector;
    tile : Tile;
    direction : Direction;
    corner : boolean;

    constructor(position : Vector, tile : Tile, direction = Direction.NONE, corner = false) {
        this.pos = position;
        this.tile = tile;
        this.direction = direction;
        this.corner = corner;

        tile.type = TileType.WALL;
    }
}