// <reference path="IVector" />

class Vector implements IVector {
    x : number;
    y : number;

    static From(other : IVector) {
        return new Vector(other.x, other.y);
    }

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    traject(speed : number, direction : number) {
        this.x += speed * Math.cos(direction);
        this.y += speed * Math.sin(direction);
    }

    reverse() {
        this.x = -this.x;
        this.y = -this.y;

        return this;
    }

    offset(offset : IVector) {
        this.x += offset.x;
        this.y += offset.y;
        return this;
    }

    scale(n : number) {
        this.x *= n;
        this.y *= n;

        return this;
    }

    min(other : IVector) {
        this.x = Math.min(this.x, other.x);
        this.y = Math.min(this.y, other.y);

        return this;
    }

    max(other : IVector) {
        this.x = Math.max(this.x, other.x);
        this.y = Math.max(this.y, other.y);

        return this;
    }

    equal(other : IVector) {
        return (other.x === this.x && other.y === this.y);
    }

    set(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    copy(other : IVector) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    reset() {
        this.x = 0;
        this.y = 0;
    }

    add(other : IVector) {
        this.x += other.x;
        this.y += other.y;

        return this;
    }

    sub(other : IVector) {
        this.x -= other.x;
        this.y -= other.y;

        return this;
    }

    multiply(other : IVector) {
        this.x *= other.x;
        this.y *= other.y;

        return this;
    }

    divide(other : IVector) {
        this.x /= other.x;
        this.y /= other.y;

        return this;
    }

    floor() {
        this.x = ~~this.x;
        this.y = ~~this.y;
    }

    clamp(min : IVector, max : IVector) {
        this.x = Math.min(Math.max(this.x, min.x), max.x);
        this.y = Math.min(Math.max(this.y, min.y), max.y);

        return this;
    }

    normalize() {
        var d = this.len();
        if (d > 0) {
            this.x = this.x / d;
            this.y = this.y / d;
        }
        return this;
    }

    dot(other : IVector) {
        return this.x * other.x + this.y * other.y;
    }

    len() {
        return Math.sqrt(this.dot(this));
    }
}