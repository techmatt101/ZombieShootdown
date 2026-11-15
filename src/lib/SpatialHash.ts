export class SpatialHash<T> {
    #cellSize : number;
    #cells = new Map<string, T[]>();
    #lastQueryOf = new Map<T, number>();
    #queryId = 0;

    constructor(cellSize : number) {
        this.#cellSize = cellSize;
    }

    clear() {
        this.#cells.clear();
        this.#lastQueryOf.clear();
    }

    insert(item : T, minX : number, minY : number, maxX : number, maxY : number) {
        this.#forEachCell(minX, minY, maxX, maxY, (key) => {
            const cell = this.#cells.get(key);
            if (cell === undefined) {
                this.#cells.set(key, [item]);
            } else {
                cell.push(item);
            }
        });
    }

    query(minX : number, minY : number, maxX : number, maxY : number, visit : (item : T) => void) {
        const queryId = ++this.#queryId;
        this.#forEachCell(minX, minY, maxX, maxY, (key) => {
            const cell = this.#cells.get(key);
            if (cell === undefined) return;
            for (let i = 0; i < cell.length; i++) {
                const item = cell[i];
                if (this.#lastQueryOf.get(item) !== queryId) {
                    this.#lastQueryOf.set(item, queryId);
                    visit(item);
                }
            }
        });
    }

    #forEachCell(minX : number, minY : number, maxX : number, maxY : number, visit : (key : string) => void) {
        const firstColumn = Math.floor(minX / this.#cellSize), lastColumn = Math.floor(maxX / this.#cellSize);
        const firstRow = Math.floor(minY / this.#cellSize), lastRow = Math.floor(maxY / this.#cellSize);
        for (let row = firstRow; row <= lastRow; row++) {
            for (let column = firstColumn; column <= lastColumn; column++) {
                visit(`${column},${row}`);
            }
        }
    }
}
