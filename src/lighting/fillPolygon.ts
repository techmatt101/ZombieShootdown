const SEEN = 255;
const PIXEL_CENTRE = 0.5;

let crossings = new Float32Array(64);

export function fillPolygon(mask : Uint8Array, size : number, polygon : Float32Array, left : number, top : number, pixelSize : number) {
    const pointCount = polygon.length / 2;
    if (pointCount < 3) return;

    let minY = Infinity, maxY = -Infinity;
    for (let i = 1; i < polygon.length; i += 2) {
        minY = Math.min(minY, polygon[i]);
        maxY = Math.max(maxY, polygon[i]);
    }
    const firstRow = Math.max(0, Math.ceil((minY - top) / pixelSize - PIXEL_CENTRE));
    const lastRow = Math.min(size - 1, Math.floor((maxY - top) / pixelSize - PIXEL_CENTRE));
    if (crossings.length < pointCount) {
        crossings = new Float32Array(pointCount * 2);
    }

    for (let row = firstRow; row <= lastRow; row++) {
        const y = top + (row + PIXEL_CENTRE) * pixelSize;
        const count = findCrossings(polygon, y);
        sortAscending(crossings, count);
        for (let i = 0; i + 1 < count; i += 2) {
            fillSpan(mask, row * size, size, crossings[i], crossings[i + 1], left, pixelSize);
        }
    }
}

function findCrossings(polygon : Float32Array, y : number) {
    let count = 0;
    let previousX = polygon[polygon.length - 2], previousY = polygon[polygon.length - 1];
    for (let i = 0; i < polygon.length; i += 2) {
        const x = polygon[i], pointY = polygon[i + 1];
        if ((pointY <= y) !== (previousY <= y)) {
            crossings[count++] = previousX + (y - previousY) * (x - previousX) / (pointY - previousY);
        }
        previousX = x;
        previousY = pointY;
    }
    return count;
}

function sortAscending(values : Float32Array, count : number) {
    for (let i = 1; i < count; i++) {
        const value = values[i];
        let j = i - 1;
        while (j >= 0 && values[j] > value) {
            values[j + 1] = values[j];
            j--;
        }
        values[j + 1] = value;
    }
}

function fillSpan(mask : Uint8Array, rowStart : number, size : number, startX : number, endX : number, left : number, pixelSize : number) {
    const firstColumn = Math.max(0, Math.ceil((startX - left) / pixelSize - PIXEL_CENTRE));
    const lastColumn = Math.min(size - 1, Math.ceil((endX - left) / pixelSize - PIXEL_CENTRE) - 1);
    for (let column = firstColumn; column <= lastColumn; column++) {
        mask[rowStart + column] = SEEN;
    }
}
