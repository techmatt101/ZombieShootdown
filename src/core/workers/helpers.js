function fastAtan2(x, y) {
    if (x == 0 && y == 0) {
        return 0.00;
    }
    var radian = Math.acos(x / Math.sqrt(x * x + y * y));
    if (y < 0) {
        radian = -radian;
    }
    return radian;
}

function findDistance(ax, ay, bx, by) {
    return Math.sqrt((ax -= bx) * ax + (ay -= by) * ay);
}