import { Grid } from './Grid';
import { Room } from './Room';
import { TileType } from './Tile';
import { Vector } from '../../lib/geometry/Vector';
import { randInt } from '../../lib/helpers';

export class MapGenerator {
    #grid = new Grid();
    #rooms : Room[] = [];

    getGird() {
        return this.#grid;
    }

    getMainRoom() {
        return this.#rooms[1];
    }

    getRooms() {
        return this.#rooms;
    }

    getRandomRoom() {
        return this.#rooms[randInt(0, this.#rooms.length - 1)];
    }

    getTileSize() {
        return this.#grid.tileSize;
    }

    generate(tileSize : Vector, gridSize : Vector, maxRoomSize : number, minRoomSize : number) {
        this.#grid.tileSize = tileSize;
        gridSize.divide(tileSize);

        this.#grid.createEmptyGrid(gridSize, TileType.EMPTY);
        this.#rooms = [];

        this.#grid.width = this.#grid.getGird().length;
        this.#grid.height = this.#grid.getGird()[0].length;

        var pos = new Vector(0, 0);
        var gridBoundary = new Vector(this.#grid.width, this.#grid.height);  //TODO: hmmm...

        var col = [];
        var lastRoom : Room | null = null;
        var maxout = 0;
        var isGirdFilled = false;

        var gridPos = new Vector(0, 0);

        while (!isGirdFilled) {
            maxout++;
            pos.y = 0;
            while (pos.y + minRoomSize < this.#grid.height) {
                var roomSizeMax = new Vector(maxRoomSize, maxRoomSize);
                gridPos.copy(gridBoundary).sub(pos);

                // Create Room
                var room = new Room( //TODO: better room random size that is based on cubic space
                    //randInt(roomSizeMax.x, minRoomSize),
                    //randInt(roomSizeMax.y, minRoomSize),
                    30, 8,
                    Vector.From(pos)
                );
                var roomSize = new Vector(room.width, room.height);

                // get last col

                //Align to last col

                //Find Height Limit
                for (var i = 0; i < col.length; i++) {
                    //if(col[i].y > pos.y && pos.y + )
                }

                //Clamp to Grid
                roomSizeMax.min(gridPos); //TODO: hmmm...

                //Check room
                if (roomSizeMax.x < minRoomSize || roomSizeMax.y < minRoomSize) {
                    console.log("Too small to fit room", pos.x, pos.y);
                    pos.y += room.height;
                    continue;
                }

                this.#addRoom(room);
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

            if (maxout > 0) {
                isGirdFilled = true;
            }
        }


        //TODO: hmmm...
        for (var i = 0; i < this.#rooms.length; i++) {
            this.#rooms[i].pos.multiply(this.#grid.tileSize);
            this.#rooms[i].width *= this.#grid.tileSize.x;
            this.#rooms[i].height *= this.#grid.tileSize.y;
        }

        //TODO: add some monsters, items, and gold in random areas of the map.
    }

    #addRoom(room : Room) {
        room.tiles = this.#grid.fill(new Vector(room.width, room.height), TileType.FLOOR); //TODO: hmmm....
        room.build();

        this.#placeRoom(room, room.pos);
        this.#rooms.push(room);

        return room;
    }

    #placeRoom(room : Room, position : Vector) {
        room.pos.copy(position).floor();
        var tx = 0, ty = 0;
        //copy the tiles from the room onto the grid
        for (var x = room.pos.x; x < (room.pos.x + room.width); ++x) {
            for (var y = room.pos.y; y < (room.pos.y + room.height); ++y) {
                this.#grid.getGird()[x][y] = room.tiles[tx][ty];
                ty++;
            }
            tx++;
            ty = 0;
        }
    }
}
