module ZombieApp {
    export class Vector {
        constructor(public x : number,
                    public y : number,
                    public angle : number = 0) {
        }

        //////////////////////

        rotateDirection(other : Vector) {
            this.angle = fastAtan2(
                other.x - this.x,
                other.y - this.y
            );
            return this;
        }

        rotate(other : Vector) {
            var x = this.x - other.x,
                y = this.y - other.y,
                cos = Math.cos(this.angle),
                sin = Math.sin(this.angle);
            this.x = x * cos - y * sin + other.x;
            this.y = x * sin + y * cos + other.y;
            return this;
        }

        traject(speed) {
            this.x += speed * Math.cos(this.angle);
            this.y += speed * Math.sin(this.angle);
        }

        reverse() {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        }

        offset(offset : Vector) {
            this.x += offset.x;
            this.y += offset.y;
            this.angle += offset.angle;
            return this;
        }

        scale(n) { //TODO: hmmm...
            this.x *= n;
            this.y *= n;
            return this;
        }

        min(other : Vector) {
            this.x = Math.min(this.x, other.x);
            this.y = Math.min(this.y, other.y);
            return this;
        }

        max(other : Vector) {
            this.x = Math.max(this.x, other.x);
            this.y = Math.max(this.y, other.y);
            return this;
        }

        /////////////////////

        equal(other : Vector) {
            return (other.x === this.x && other.y === this.y);
        }

        set(x : number, y : number, angle : number = 0) {
            this.x = x;
            this.y = y;
            this.angle = angle;
        }

        copy(other : Vector) {
            this.x = other.x;
            this.y = other.y;
            this.angle = other.angle;
            return this;
        }

        clone() {
            return new Vector(this.x, this.y, this.angle);
        }

        reset() {
            this.x = 0;
            this.y = 0;
            this.angle = 0;
        }

        add(other : Vector) {
            this.x += other.x;
            this.y += other.y;
            return this;
        }

        sub(other : Vector) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        }

        multiply(other : Vector) {
            this.x *= other.x;
            this.y *= other.y;
            return this;
        }

        divide(other : Vector) {
            this.x /= other.x;
            this.y /= other.y;
            return this;
        }

        floor() {
            this.x = ~~this.x;
            this.y = ~~this.y;
        }

        clamp(min : Vector, max : Vector) {
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

        dot(other : Vector) {
            return this.x * other.x + this.y * other.y;
        }

        len() {
            return Math.sqrt(this.dot(this));
        }
    }
}