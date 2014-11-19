class MapGenerator {
    private _grid  = new Grid();
    private _rooms : Room[] = [];

    getGird() {
        return this._grid;
    }

    getMainRoom() {
        return this._rooms[0];
    }

    getRandomRoom() {
        return this._rooms[randInt(0, this._rooms.length -1)];
    }

    getTileSize() {
        return this._grid.tileSize;
    }

    generate (tileSize : Vector, gridSize : Vector, maxRoomSize : number, minRoomSize : number) {
        this._grid.tileSize = tileSize;
        gridSize.divide(tileSize);

        this._grid.createEmptyGrid(gridSize, TileType.EMPTY);
        this._rooms = [];

        this._grid.width = this._grid.getGird().length;
        this._grid.height = this._grid.getGird()[0].length;

        var pos = new Vector(0,0);
        var gridBoundary = new Vector(this._grid.width, this._grid.height);  //TODO: hmmm...

        var col = [];
        var lastRoom : Room = null;
        var maxout = 0;
        var isGirdFilled = false;

        while(!isGirdFilled) {
            maxout++;
            pos.y = 0;
            while(pos.y + minRoomSize < this._grid.height) {

                var roomSizeMax = new Vector(maxRoomSize, maxRoomSize);

                // Create Room
                var room = new Room( //TODO: better room random size that is based on cubic space
                    //randInt(roomSizeMax.x, minRoomSize),
                    //randInt(roomSizeMax.y, minRoomSize),
                    30, 8,
                    pos.clone()
                );
                var roomSize = new Vector(room.width, room.height);

                // get last col

                //Align to last col

                //Find Height Limit
                for (var i = 0; i < col.length; i++) {
                    //if(col[i].y > pos.y && pos.y + )
                }

                //Clamp to Grid
                roomSizeMax.min(gridBoundary.clone().sub(pos)); //TODO: hmmm...

                //Check room
                if(roomSizeMax.x < minRoomSize || roomSizeMax.y < minRoomSize) {
                    console.log("Too small to fit room", pos.x, pos.y);
                    pos.y += room.height;
                    continue;
                }

                this.addRoom(room);
                pos.y += room.height;

                //Add connection rooms
                // - Last Room
                // - Y Room
                // - Max Room

                //add to next col

                //if(typeof lastRow[activeLastRoom] !== 'undefined') {
                //    pos.x = lastRow[activeLastRoom].pos.x + lastRow[activeLastRoom].width;
                //    pos.y = Math.max(pos.y, lastRow[activeLastRoom].pos.y);
                //
                //} else {
                //    pos.x = 0;
                //}
                //
                //
                //
                //if(typeof lastRow[activeLastRoom] !== 'undefined' && typeof lastRow[activeLastRoom+1] !== 'undefined' && lastRow[activeLastRoom+1].width > lastRow[activeLastRoom].width) {
                //    roomSizeMax.y = Math.min(roomSizeMax.y, lastRow[activeLastRoom].height);
                //}
                //
                //var room = this.addRoom(pos.clone(), roomSizeMax, minRoomSize);
                //currentRow.push(room);
                //lastRoom = room;
                //
                //pos.y += room.height;
                //activeLastRoom++;
            }
            //activeLastRoom = 0;
            //lastRow = currentRow;
            //currentRow = [];

            if(maxout > 0) {
                isGirdFilled = true;
            }
        }


        //TODO: hmmm...
        for (var i = 0; i < this._rooms.length; i++) {
            this._rooms[i].pos.multiply(this._grid.tileSize);
            this._rooms[i].width *= this._grid.tileSize.x;
            this._rooms[i].height *= this._grid.tileSize.y;
        }

        //TODO: add some monsters, items, and gold in random areas of the map.
    }
    
    private addRoom (room : Room) {
        room.tiles = this._grid.fill(new Vector(room.width, room.height), TileType.FLOOR); //TODO: hmmm....
        room.build();

        this.placeRoom(room, room.pos);
        this._rooms.push(room);

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
}