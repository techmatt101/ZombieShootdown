export function fastAtan2(x : number, y : number) {
    if (x == 0 && y == 0) {
        return 0.00;
    }
    var radian = Math.acos(x / Math.sqrt(x * x + y * y));
    if (y < 0) {
        radian = -radian;
    }
    return radian;
}

export function findDistance(ax : number, ay : number, bx : number, by : number) {
    return Math.sqrt((ax -= bx) * ax + (ay -= by) * ay);
}