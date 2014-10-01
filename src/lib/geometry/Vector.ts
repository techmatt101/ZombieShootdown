/// <reference path="_helpers.ts" />

class Vector {
    x : number;
    y : number;
    angle : number = 0;


    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }

    copy(other : Vector) {
        this.x = other.x;
        this.y = other.y;
        this.angle = other.angle;
        return this;
    }

    rotateDirection(other : Vector) {
        this.angle = fastAtan2(
            this.x - other.x,
            this.y - other.y
        );
        return this;
    }


//    // Calculate angle between two points (in radians)
//    static rotate(x, y, xm, ym, a) : Vector {  //todo: remove
////        a = a * Math.PI / 180;
//        x -= xm;
//        y -= ym;
//        var cos = Math.cos(a), sin = Math.sin(a);
//
//        return new Vector(
//            x * cos - y * sin + xm,
//            x * sin + y * cos + ym
//        );
//    }

    //    static calcLine (x, y) { //todo: look at
//        var a = new Vector(this.y - y, this.x - x).atan2();
//        return new Vector(
//            Math.cos(a) * 50,
//            Math.sin(a) * 50
//        );
//    }

    //copy(other : Vector) {
    //    this.x = other.x;
    //    this.y = other.y;
    //    return this;
    //}

    //perp() {
    //    var x = this.x;
    //    this.x = this.y;
    //    this.y = -x;
    //    return this;
    //}
    //
    //reverse() {
    //    this.x = -this.x;
    //    this.y = -this.y;
    //    return this;
    //}
    //
    //normalize() {
    //    var d = this.len();
    //    if (d > 0) {
    //        this.x = this.x / d;
    //        this.y = this.y / d;
    //    }
    //    return this;
    //}
    //
    //add(other : Vector) {
    //    this.x += other.x;
    //    this.y += other.y;
    //    return this;
    //}
    //
    //sub(other : Vector) {
    //    this.x -= other.x;
    //    this.y -= other.y;
    //    return this;
    //}
    //
    //multiply(other : Vector) {
    //    this.x *= other.x;
    //    this.y *= other.y;
    //    return this;
    //}
    //
    //divide(other : Vector) {
    //    this.x /= other.x;
    //    this.y /= other.y;
    //    return this;
    //}
    //
    //scale(x, y) {
    //    this.x *= x;
    //    this.y *= y;
    //    return this;
    //}
    //
    //
    //dot(other : Vector) {
    //    return this.x * other.x + this.y * other.y;
    //}
    //
    //len2() {
    //    return this.dot(this);
    //}
    //
    //len() {
    //    return Math.sqrt(this.dot(this));
    //}
    //
    //atan2() {
    //    if (this.x == 0 && this.y == 0) {
    //        return 0.00;
    //    }
    //    var radian = Math.acos(this.x / Math.sqrt(this.x * this.x + this.y * this.y));
    //    if (this.y < 0) {
    //        radian = -radian;
    //    }
    //    return radian;
    //}

    //rotate(other : Vector) {
    //    this.angle *= Math.PI / 180;
    //    this.x -= other.x;
    //    this.y -= other.y;
    //    var cos = Math.cos(this.angle), sin = Math.sin(this.angle);
    //    this.x = this.x * cos - this.y * sin + other.x;
    //    this.y = this.x * sin + this.y * cos + other.y;
    //    return this;
    //}

    //project(other : Vector) {
    //    var amt = this.dot(other) / other.len2();
    //    this.x = amt * other.x;
    //    this.y = amt * other.y;
    //    return this;
    //}
    //
    //projectN(other : Vector) {
    //    var amt = this.dot(other);
    //    this.x = amt * other.x;
    //    this.y = amt * other.y;
    //    return this;
    //}
    //
    //reflect(axis) {
    //    var x = this.x;
    //    var y = this.y;
    //    this.project(axis).scale(2, 2);
    //    this.x -= x;
    //    this.y -= y;
    //    return this;
    //}
    //
    //reflectN(axis) {
    //    var x = this.x;
    //    var y = this.y;
    //    this.projectN(axis).scale(2, 2);
    //    this.x -= x;
    //    this.y -= y;
    //    return this;
    //}
    //
    //min(other : Vector) {
    //    this.x = Math.min(this.x, other.x);
    //    this.y = Math.min(this.y, other.y);
    //    return this;
    //}
    //
    //max(other : Vector) {
    //    this.x = Math.max(this.x, other.x);
    //    this.y = Math.max(this.y, other.y);
    //    return this;
    //}
}