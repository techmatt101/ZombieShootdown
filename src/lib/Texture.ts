/// <reference path="geometry/Box" />

class Texture extends Box {
    img : HTMLImageElement;
    sourcePos : Vector;
    sourceWidth : number;
    sourceHeight : number;

    constructor(img : HTMLImageElement,
                pos : Vector,
                width : number,
                height : number,
                sourcePos = new Vector(0, 0),
                sourceWidth?,
                sourceHeight?) {

        super(width, height, pos);
        this.img = img;
        this.sourcePos = sourcePos;
        this.sourceWidth = sourceWidth || img.width;
        this.sourceHeight = sourceHeight || img.height;
    }
}