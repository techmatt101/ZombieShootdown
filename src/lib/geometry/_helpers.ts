function fastAtan2 (x, y) {
    if (x == 0) {
        if (y > 0) return Math.PI / 2;
        if (y == 0) return 0;
        return -Math.PI / 2;
    }

    var atan, z = y / x;
    if (z < -1 || z > 1) {
        atan = Math.PI / 2 - z / (z * z + 0.28);
        if (y < 0) return atan - Math.PI;
    } else {
        atan = z / (1 + 0.28 * z * z);
        if (x < 0) {
            if (y < 0) return atan - Math.PI;
            return atan + Math.PI;
        }
    }
    return atan;
}

function randInt (max : number, min : number) {
    return ~~(Math.random() * (max - min + 1)) + min;
}