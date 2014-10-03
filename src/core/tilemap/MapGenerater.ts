// Based on: http://breinygames.blogspot.com/2011/07/random-map-generation.html

/// <reference path="_helpers.ts" />
/// <reference path="Room.ts" />
/// <reference path="Tile.ts" />


class MapGenerater {
    private _grid : Array<Tile[]> = [];
    private _rooms : Room[] = [];

    generate (gridSize : Vector, minRoomSize : number, maxRoomSize : number, maxRooms : number) {
        this.createEmptyGrid(gridSize);

        //place first room in the middle of the map
        this._rooms = [this.generateRoom(minRoomSize, maxRoomSize)];
        this.placeRoom(this._rooms[0], new Vector(
            (gridSize.x / 2) - (this._rooms[0].width / 2),
            (gridSize.y / 2) - (this._rooms[0].height / 2)
        ));
    }

    private createEmptyGrid (gridSize : Vector) {
        for (var x = 0; x < gridSize.x; ++x) {
            this._grid[x] = [];
            for (var y = 0; y < gridSize.y; ++y) {
                this._grid[x][y] = new Tile(TileType.EMPTY);
            }
        }
    }

    private generateRoom (minSize : number, maxSize : number) {
        var room = new Room(
            new Vector(0, 0),
            helpers.randInt(minSize, maxSize),
            helpers.randInt(minSize, maxSize)
        );

        for (var x = 0; x < room.width; ++x) {
            room.tiles[x] = [];
            for (var y = 0; y < room.height; ++y) {
                var tile = new Tile(TileType.FLOOR);
                room.tiles[x][y] = tile;

                //add walls
                if (x === 0 || x === room.width - 1 || y === 0 || y === room.height - 1) {
                    tile.type = TileType.WALL;
                    var wall = new Wall();
                    room.walls.push(wall);

                    //store position of normal walls (not corners)
                    if (y !== 0 && y !== room.height - 1) {
                        if (x === 0) {
                            wall.direction = Direction.WEST;
                        } else if (x === room.width - 1) {
                            wall.direction = Direction.EAST;
                        }
                    } else if (x !== 0 && x !== room.width - 1) {
                        if (y === 0) {
                            wall.direction = Direction.NORTH;
                        } else if (y === room.height - 1) {
                            wall.direction = Direction.SOUTH;
                        }
                    }
                    else { //add corners
                        wall.corner = true;
                        if (x === 0 && y === 0) {
                            wall.direction = Direction.NORTH;
                        } else if (x === 0 && y === room.height - 1) {
                            wall.direction = Direction.WEST;
                        } else if (x === room.width - 1 && y === 0) {
                            wall.direction = Direction.EAST;
                        } else if (x === room.width - 1 && y === room.height - 1) {
                            wall.direction = Direction.SOUTH;
                        }
                    }
                }
            }
        }

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