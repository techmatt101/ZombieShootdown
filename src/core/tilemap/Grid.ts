class Grid {
    private _grid : Array<Tile[]> = [];
    width : number;
    height : number;
    tileSize : Vector;


    getGird() {
        return this._grid;
    }

    loopThrough(loopCycle : (tile : Tile, pos : Vector, tileSize : Vector) => void) {
        for (var x = 0; x < this._grid.length; x++) {
            for (var y = 0; y < this._grid[x].length; y++) {
                loopCycle(this._grid[x][y], new Vector(x, y).multiply(this.tileSize), this.tileSize);
            }
        }
    }

    fill(gridSize : Vector, fillType : TileType) {
        var grid = [];
        for (var x = 0; x < gridSize.x; ++x) {
            grid[x] = [];
            for (var y = 0; y < gridSize.y; ++y) {
                grid[x][y] = new Tile(fillType);
            }
        }
        return grid;
    }

    createEmptyGrid(gridSize : Vector, fillType : TileType) {
        var grid = [];
        for (var x = 0; x < gridSize.x; x++) {
            grid[x] = [];
            for (var y = 0; y < gridSize.y; y++) {
                grid[x][y] = new Tile(fillType);
            }
        }
        this._grid = grid;
    }

    toString() {
        var yLength = this._grid[0].length;
        for (var y = 0; y < yLength; y++) {
            var out = y + 100 + ' ';
            for (var x = 0; x < this._grid.length; x++) {
                if (typeof this._grid[x][y] === 'undefined') {
                    out += '?';
                    continue;
                }
                switch (this._grid[x][y].type) {
                    default:
                    case TileType.EMPTY :
                        out += '.';
                        break;

                    case TileType.WALL :
                        out += '#';
                        break;

                    case TileType.FLOOR :
                        out += 'x';
                        break;
                }
            }
            console.log(out);
        }
    }
}