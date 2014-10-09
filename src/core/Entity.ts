/// <reference path="../lib/geometry/Polygon.ts" />
/// <reference path="../lib/geometry/IBox.ts" />
/// <reference path="../lib/interfaces/IUpdate.ts" />


class Entity implements IUpdate {
    pos : Vector;
    width : number;
    height : number;
    img : HTMLImageElement;


    constructor (position, width, height, img) {
        this.pos = position;
        this.width = width;
        this.height = height;
        this.img = img;
    }


    update (dt : number) {

    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }
}
