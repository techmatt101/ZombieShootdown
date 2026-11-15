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
        for (let x = 0; x < this.#grid.length; x++) {
            for (let y = 0; y < this.#grid[x].length; y++) {
                loopCycle(this.#grid[x][y], new Vector(x, y).multiply(this.tileSize), this.tileSize);
            }
        }
    }

    fill(gridSize : Vector, fillType : TileType) {
        const grid : Tile[][] = [];
        for (let x = 0; x < gridSize.x; ++x) {
            grid[x] = [];
            for (let y = 0; y < gridSize.y; ++y) {
                grid[x][y] = new Tile(fillType);
            }
        }
        return grid;
    }

    createEmptyGrid(gridSize : Vector, fillType : TileType) {
        const grid : Tile[][] = [];
        for (let x = 0; x < gridSize.x; x++) {
            grid[x] = [];
            for (let y = 0; y < gridSize.y; y++) {
                grid[x][y] = new Tile(fillType);
            }
        }
        this.#grid = grid;
    }

    toString() {
        const yLength = this.#grid[0].length;
        for (let y = 0; y < yLength; y++) {
            let out = `${y + 100} `;
            for (const column of this.#grid) {
                const tile = column[y];
                if (tile === undefined) {
                    out += '?';
                    continue;
                }
                switch (tile.type) {
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
