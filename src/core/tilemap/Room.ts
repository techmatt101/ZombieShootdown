/// <reference path="Tile.ts" />
/// <reference path="../../lib/geometry/Vector.ts" />

class Room {
    pos : Vector;
    width : number;
    height : number;
    tiles : Array<Tile[]> = [];
    walls = []; //indexes for wall tiles

    constructor(position : Vector, width : number, height : number) {
        this.pos = position;
        this.width = width;
        this.height = height;
    }
}