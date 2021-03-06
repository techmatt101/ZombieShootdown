class Room extends Box {
    tiles : Array<Tile[]> = [];
    walls : Wall[] = [];
    solidWalls : Wall[] = [];
    connectingRooms : Room[] = [];


    addWall(wall : Wall) {
        this.walls.push(wall);
    }

    addSolidWall(wall : Wall) {
        this.walls.push(wall);
        this.solidWalls.push(wall);
    }

    build() {
        //create walls round edge of room tiles
        for (var x = 1; x < this.width - 1; x++) {
            this.addSolidWall(new Wall(
                new Vector(x, 0),
                this.tiles[x][0],
                Direction.NORTH
            ));
            this.addSolidWall(new Wall(
                    new Vector(x, this.height - 1),
                    this.tiles[x][this.height - 1],
                    Direction.SOUTH)
            );
        }

        for (var y = 1; y < this.height - 1; y++) {
            this.addSolidWall(new Wall(
                new Vector(0, y),
                this.tiles[0][y],
                Direction.WEST
            ));
            this.addSolidWall(new Wall(
                new Vector(this.width - 1, y),
                this.tiles[this.width - 1][y],
                Direction.EAST
            ));
        }

        //create corner walls
        this.addWall(new Wall(
            new Vector(0, 0),
            this.tiles[0][0],
            Direction.NORTH_WEST,
            true
        ));
        this.addWall(new Wall(
            new Vector(this.width - 1, 0),
            this.tiles[this.width - 1][0],
            Direction.NORTH_EAST,
            true
        ));
        this.addWall(new Wall(
            new Vector(0, this.height - 1),
            this.tiles[0][this.height - 1],
            Direction.SOUTH_WEST,
            true
        ));
        this.addWall(new Wall(
            new Vector(this.width - 1, this.height - 1),
            this.tiles[this.width - 1][this.height - 1],
            Direction.SOUTH_EAST,
            true
        ));

        // TEMPORARY HACKY STUFF
        this.tiles[3][0].type = TileType.DOOR;
        this.tiles[4][0].type = TileType.DOOR;
        this.tiles[5][0].type = TileType.DOOR;

        for (var i = 11; i < 20; i++) {
            this.tiles[i][0].type = TileType.FLOOR;
            this.tiles[i][this.height - 1].type = TileType.FLOOR;
        }

        this.tiles[24][0].type = TileType.FLOOR;
        this.tiles[25][0].type = TileType.FLOOR;
        this.tiles[26][0].type = TileType.FLOOR;

        this.tiles[3][this.height - 1].type = TileType.FLOOR;
        this.tiles[4][this.height - 1].type = TileType.FLOOR;
        this.tiles[5][this.height - 1].type = TileType.FLOOR;

        this.tiles[24][this.height - 1].type = TileType.DOOR;
        this.tiles[25][this.height - 1].type = TileType.DOOR;
        this.tiles[26][this.height - 1].type = TileType.DOOR;
    }
}