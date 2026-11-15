import { Tile, TileType } from './Tile';
import { Vector } from '../../lib/geometry/Vector';

export class Grid {
    #grid : Array<Tile[]> = [];
    width = 0;
    height = 0;
    tileSize = new Vector(0, 0);


    getGird() {
        return this.#grid;
    }

    loopThrough(loopCycle : (tile : Tile, pos : Vector, tileSize : Vector) => void) {
        for (var x = 0; x < this.#grid.length; x++) {
            for (var y = 0; y < this.#grid[x].length; y++) {
                loopCycle(this.#grid[x][y], new Vector(x, y).multiply(this.tileSize), this.tileSize);
            }
        }
    }

    fill(gridSize : Vector, fillType : TileType) {
        var grid : Tile[][] = [];
        for (var x = 0; x < gridSize.x; ++x) {
            grid[x] = [];
            for (var y = 0; y < gridSize.y; ++y) {
                grid[x][y] = new Tile(fillType);
            }
        }
        return grid;
    }

    createEmptyGrid(gridSize : Vector, fillType : TileType) {
        var grid : Tile[][] = [];
        for (var x = 0; x < gridSize.x; x++) {
            grid[x] = [];
            for (var y = 0; y < gridSize.y; y++) {
                grid[x][y] = new Tile(fillType);
            }
        }
        this.#grid = grid;
    }

    toString() {
        var yLength = this.#grid[0].length;
        for (var y = 0; y < yLength; y++) {
            var out = y + 100 + ' ';
            for (var x = 0; x < this.#grid.length; x++) {
                if (typeof this.#grid[x][y] === 'undefined') {
                    out += '?';
                    continue;
                }
                switch (this.#grid[x][y].type) {
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
