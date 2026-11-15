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

    getOpenFloorPositions() : Vector[] {
        const tiles = this.#grid.getGird();
        const isFloor = (x : number, y : number) => tiles[x]?.[y]?.type === TileType.FLOOR;
        const neighbourOffsets = [-1, 0, 1];
        const isSurroundedByFloor = (x : number, y : number) =>
            neighbourOffsets.every((dx) => neighbourOffsets.every((dy) => isFloor(x + dx, y + dy)));
        const positions : Vector[] = [];

        for (let x = 0; x < tiles.length; x++) {
            for (let y = 0; y < tiles[x].length; y++) {
                if (isSurroundedByFloor(x, y)) {
                    positions.push(new Vector(x, y).multiply(this.#grid.tileSize));
                }
            }
        }
        return positions;
    }

    generate(tileSize : Vector, gridSize : Vector, maxRoomSize : number, minRoomSize : number) {
        this.#grid.tileSize = tileSize;
        gridSize.divide(tileSize);

        this.#grid.createEmptyGrid(gridSize, TileType.EMPTY);
        this.#rooms = [];

        this.#grid.width = this.#grid.getGird().length;
        this.#grid.height = this.#grid.getGird()[0].length;

        const pos = new Vector(0, 0);
        const gridBoundary = new Vector(this.#grid.width, this.#grid.height);

        let maxout = 0;
        let isGirdFilled = false;

        const gridPos = new Vector(0, 0);

        while (!isGirdFilled) {
            maxout++;
            pos.y = 0;
            while (pos.y + minRoomSize < this.#grid.height) {
                const roomSizeMax = new Vector(maxRoomSize, maxRoomSize);
                gridPos.copy(gridBoundary).sub(pos);

                const room = new Room(
                    30, 8,
                    Vector.From(pos)
                );

                roomSizeMax.min(gridPos);

                if (roomSizeMax.x < minRoomSize || roomSizeMax.y < minRoomSize) {
                    console.log("Too small to fit room", pos.x, pos.y);
                    pos.y += room.height;
                    continue;
                }

                this.#addRoom(room);
                pos.y += room.height;
            }

            if (maxout > 0) {
                isGirdFilled = true;
            }
        }

        for (const room of this.#rooms) {
            room.pos.multiply(this.#grid.tileSize);
            room.width *= this.#grid.tileSize.x;
            room.height *= this.#grid.tileSize.y;
        }
    }

    #addRoom(room : Room) {
        room.tiles = this.#grid.fill(new Vector(room.width, room.height), TileType.FLOOR);
        room.build();

        this.#placeRoom(room, room.pos);
        this.#rooms.push(room);

        return room;
    }

    #placeRoom(room : Room, position : Vector) {
        room.pos.copy(position).floor();
        let tx = 0, ty = 0;
        for (let x = room.pos.x; x < (room.pos.x + room.width); ++x) {
            for (let y = room.pos.y; y < (room.pos.y + room.height); ++y) {
                this.#grid.getGird()[x][y] = room.tiles[tx][ty];
                ty++;
            }
            tx++;
            ty = 0;
        }
    }
}
