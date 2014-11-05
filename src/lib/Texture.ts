/// <reference path="geometry/Box" />

class Texture extends Box {
    img : HTMLImageElement;

    constructor(img : HTMLImageElement, width : number, height : number, pos : Vector) {
        super(width, height, pos);
        this.img = img;
    }
}