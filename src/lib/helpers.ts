module ZombieApp {
    export function fastAtan2(x, y) {
        if (x == 0 && y == 0) {
            return 0.00;
        }
        var radian = Math.acos(x / Math.sqrt(x * x + y * y));
        if (y < 0) {
            radian = -radian;
        }
        return radian;
    }

    export function insertionSort(ary) {
        for (var i = 1, l = ary.length; i < l; i++) {
            var value = ary[i];
            for (var j = i - 1; j >= 0; j--) {
                if (ary[j] <= value)
                    break;
                ary[j + 1] = ary[j];
            }
            ary[j + 1] = value;
        }
        return ary;
    }

    export function randInt(min : number, max : number) {
        return ~~(Math.random() * (max - min + 1) + min);
    }
}