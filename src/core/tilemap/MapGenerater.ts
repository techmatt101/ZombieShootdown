// Based on: http://breinygames.blogspot.com/2011/07/random-map-generation.html

// Needs improvment:
// - It is possible with small rooms for it to not be closed (i.e. a wall tile missing)
// - Walls often double up (more room spacing?)

/// <reference path="_helpers.ts" />
/// <reference path="Room.ts" />
/// <reference path="Tile.ts" />


class MapGenerater {
    private _grid : Array<Tile[]> = [];
    private _rooms : Room[] = [];

    generate (gridSize : Vector, minRoomSize : number, maxRoomSize : number) {
        this._grid = this.createEmptyGrid(gridSize, TileType.EMPTY);

        //place first room in the middle of the map
        this._rooms = [this.generateRoom(minRoomSize, maxRoomSize)];
        this.placeRoom(this._rooms[0], new Vector(
            (gridSize.x / 2) - (this._rooms[0].width / 2),
            (gridSize.y / 2) - (this._rooms[0].height / 2)
        ));
    }

    private createEmptyGrid (gridSize : Vector, fillType : TileType) { //TODO: hmmm... Vector? box maybe?
        var grid = [];
        for (var x = 0; x < gridSize.x; ++x) {
            grid[x] = [];
            for (var y = 0; y < gridSize.y; ++y) {
                grid[x][y] = new Tile(fillType);
            }
        }
        return grid;
    }

    private generateRoom (minSize : number, maxSize : number) {
        var room = new Room(
            new Vector(0, 0),
            helpers.randInt(minSize, maxSize),
            helpers.randInt(minSize, maxSize)
        );

        room.tiles = this.createEmptyGrid(new Vector(room.width, room.height), TileType.FLOOR);

        //create walls round edge of room tiles
        for (var x = 1; x < room.width - 1; ++x) {
            room.addSolidWall(new Wall(room.tiles[x][0], Direction.WEST));
            room.addSolidWall(new Wall(room.tiles[x][room.height - 1], Direction.EAST));
        }

        for (var y = 1; y < room.height - 1; ++y) {
            room.addSolidWall(new Wall(room.tiles[0][y], Direction.NORTH));
            room.addSolidWall(new Wall(room.tiles[room.width - 1][y], Direction.SOUTH));
        }

        //create corner walls
        room.addWall(new Wall(room.tiles[0][0],Direction.NORTH_WEST, true));
        room.addWall(new Wall(room.tiles[room.width - 1][0], Direction.NORTH_EAST, true));
        room.addWall(new Wall(room.tiles[0][room.height - 1], Direction.SOUTH_WEST, true));
        room.addWall(new Wall(room.tiles[room.width - 1][room.height - 1], Direction.SOUTH_EAST, true));

        return room;
    }

    private placeRoom (room : Room, position : Vector) {
        room.pos.copy(position).floor();

        var tx = 0, ty = 0;
        //copy the tiles from the room onto the grid
        for (var x = room.pos.x; x < (room.pos.x + room.width); ++x) {
            for (var y = room.pos.y; y < (room.pos.y + room.width); ++y) {
                this._grid[x][y] = room.tiles[tx][ty];
                ty++;
            }
            tx++;
            ty = 0;
        }
    }
}