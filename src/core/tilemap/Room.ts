/// <reference path="Tile.ts" />
/// <reference path="../../lib/geometry/Vector.ts" />

class Room {
    pos : Vector;
    width : number;
    height : number;
    tiles : Array<Tile[]> = [];
    walls : Wall[] = [];
    solidWalls : Wall[] = [];


    constructor(position : Vector, width : number, height : number) {
        this.pos = position;
        this.width = width;
        this.height = height;
    }

    addWall(wall : Wall) {
        this.walls.push(wall);
    }

    addSolidWall(wall : Wall) {
        this.walls.push(wall);
        this.solidWalls.push(wall);
    }
}