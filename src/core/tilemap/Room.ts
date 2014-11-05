class Room extends Box{
    pos : Vector;
    width : number;
    height : number;
    tiles : Array<Tile[]> = [];
    walls : Wall[] = [];
    solidWalls : Wall[] = [];


    addWall(wall : Wall) {
        this.walls.push(wall);
    }

    addSolidWall(wall : Wall) {
        this.walls.push(wall);
        this.solidWalls.push(wall);
    }
}