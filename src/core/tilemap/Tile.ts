module ZombieApp {
    export enum TileType {
        EMPTY,
        WALL,
        DOOR,
        FLOOR
    }

    export class Tile {
        type : TileType;
        data : any = null;

        constructor(type : TileType) {
            this.type = type;
        }
    }
}