/// <reference path="../lib/geometry/Polygon.ts" />
/// <reference path="../lib/geometry/IBox.ts" />
/// <reference path="../lib/IUpdate.ts" />


class Entity implements IUpdate {
    pos : Vector;
    width : number;
    height : number;
    img : HTMLImageElement;
    touching = false;


    constructor (position, width, height, img) {
        this.pos = position;
        this.width = width;
        this.height = height;
        this.img = img;
    }


    isBoundingBoxWith (box : Entity) {
        return this.pos.x - this.width / 2 < box.pos.x + box.width / 2 &&
            this.pos.x + this.width / 2 > box.pos.x - box.width / 2 &&
            this.pos.y - this.height / 2 < box.pos.y + box.height / 2 &&
            this.pos.y + this.height / 2 > box.pos.y - box.height / 2;
    }

    update (dt : number) {

    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
    }
}
