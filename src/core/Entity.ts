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

    update (dt) {

    }

    draw(ctx : CanvasRenderingContext2D) : void {
        //ctx.drawImage(this.img, this.pos.x, this.pos.y, this.width, this.height);
    }

    drawDebug(ctx : CanvasRenderingContext2D) : void {
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.pos.angle);
        ctx.translate(-this.width / 2, -this.height / 2);
        ctx.fillRect(0, 0, this.width, this.height);
        //ctx.fillRect(-this.pos.x / 2, -this.pos.yq2 / 2, this.width, this.height);
    }
}
