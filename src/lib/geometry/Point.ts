// <reference path="IPoint" />
// <reference path="Vector" />

class Point extends Vector {
    x : number;
    y : number;
    direction : number;

    constructor(x : number, y : number, direction : number) {
        super(x, y);
        this.direction = direction;
    }

    trajectFromDirection(speed : number) {
        return this.traject(speed, this.direction);
    }

    rotateDirection(other : IVector) {
        this.direction = fastAtan2(
            other.x - this.x,
            other.y - this.y
        );

        return this;
    }

    copy(other : IPoint) {
        this.x = other.x;
        this.y = other.y;
        this.direction = other.direction;

        return this;
    }

    rotate(other : IVector) {
        var x = this.x - other.x,
            y = this.y - other.y,
            cos = Math.cos(this.direction),
            sin = Math.sin(this.direction);
        this.x = x * cos - y * sin + other.x;
        this.y = x * sin + y * cos + other.y;

        return this;
    }

    copyVector(other : IVector) {
        this.x = other.x;
        this.y = other.y;

        return this;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.direction = 0;
    }
}