class MapGenerator {
    private _grid  = new Grid();
    private _rooms : Room[] = [];

    getGird() {
        return this._grid.getGird();
    }

    getMainRoom() {
        return this._rooms[0];
    }

    getTileSize() {
        return this._grid.tileSize;
    }

    loopThroughGrid(loopCycle : (tile : Tile, pos : Vector, tileSize : Vector) => void) {
        this._grid.loopThroughGrid(loopCycle);
    }

    // Based on: http://breinygames.blogspot.com/2011/07/random-map-generation.html
    generate (tileSize : Vector, gridSize : Vector, minRoomSize : number, maxRoomSize : number) {
        this._grid.tileSize = tileSize;
        gridSize.divide(tileSize);

        this._grid.createEmptyGrid(gridSize, TileType.EMPTY);
        this._rooms = [];

        //place first room in the middle of the map
        this._rooms.push(this.generateRoom(minRoomSize, maxRoomSize));
        this.placeRoom(this._rooms[0], new Vector(
            (gridSize.x / 2) - (this._rooms[0].width / 2),
            (gridSize.y / 2) - (this._rooms[0].height / 2)
        ));

        this._rooms.push(this.generateRoom(7, 7));
        this.placeRoom(this._rooms[1], new Vector(
            this._rooms[0].pos.x + this._rooms[0].width,
            this._rooms[0].pos.y + 8
        ));

        //TODO: hmmm...
        for (var i = 0; i < this._rooms.length; i++) {
            this._rooms[i].pos.multiply(this._grid.tileSize);
            this._rooms[i].width *= this._grid.tileSize.x;
            this._rooms[i].height *= this._grid.tileSize.y;
        }

        //TODO: add some monsters, items, and gold in random areas of the map.
    }

    private generateRoom (minSize : number, maxSize : number) {
        var room = new Room(
            this.randInt(minSize, maxSize),
            this.randInt(minSize, maxSize),
            new Vector(0, 0)
        );

        room.tiles = this._grid.fill(new Vector(room.width, room.height), TileType.FLOOR);
        room.build();

        return room;
    }

    private placeRoom (room : Room, position : Vector) {
        room.pos.copy(position).floor();
        var tx = 0, ty = 0;
        //copy the tiles from the room onto the grid
        for (var x = room.pos.x; x < (room.pos.x + room.width); ++x) {
            for (var y = room.pos.y; y < (room.pos.y + room.height); ++y) {
                this._grid.getGird()[x][y] = room.tiles[tx][ty];
                ty++;
            }
            tx++;
            ty = 0;
        }
    }

    randInt (low, high) {
        return ~~(Math.random() * (high - low)) + low;
    }
}