/// <reference path="../../lib/ResourceManager.ts" />
/// <reference path="../Entity.ts" />

class MapManager implements IBox, IUpdate{
    metaData;
    objects : Entity[] = [];
    graphics = [];
    audio = [];
    width : number;
    height : number;
    x : number;
    y : number;
    angle : number;


    constructor(x, y, width, height, points, img) {
//        super(x, y, width, height, points, img);
    }

    //loadMap (mapData, callback) {
    //    this.layoutMap(mapData.objects, callback);
    //}
    //
    //layoutMap (objects, callback) {
    //    console.log("%cLaying Out MapManager", "color: #23cf9c");
    //
    //    var self = this;
    //    Resources.retrieveImage('platform', function (image) {
    //        for (var i = 0; i < objects.length; i++) {
    //            var obj = new Platform(objects[i].x, objects[i].y, objects[i].width, objects[i].height, null, image);
    //            self.objects.push(obj);
    //        }
    //        callback();
    //    });
    //}

    update(dt : number) : void {
    }

    draw(ctx : CanvasRenderingContext2D) {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].drawDebug(ctx);
//            ctx.rect(this.objects[i].x, this.objects[i].y, this.objects[i].weight, this.objects[i].height);
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        for (var i = 0; i < this.objects.length; i++) {
            this.objects[i].drawDebug(ctx);
//            ctx.rect(this.objects[i].x, this.objects[i].y, this.objects[i].weight, this.objects[i].height);
        }
    }
}
