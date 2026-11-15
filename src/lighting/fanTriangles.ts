export const FLOATS_PER_FAN_VERTEX = 2;
const VERTICES_PER_TRIANGLE = 3;

export function fanVertexCount(polygon : Float32Array) {
    return (polygon.length / 2) * VERTICES_PER_TRIANGLE;
}

export function fanTriangles(originX : number, originY : number, polygon : Float32Array, out : Float32Array, offset : number) : number {
    const lastPoint = polygon.length - 2;
    let next = offset;
    for (let i = 0; i < polygon.length; i += 2) {
        const following = i === lastPoint ? 0 : i + 2;
        out[next++] = originX;
        out[next++] = originY;
        out[next++] = polygon[i];
        out[next++] = polygon[i + 1];
        out[next++] = polygon[following];
        out[next++] = polygon[following + 1];
    }
    return next;
}
