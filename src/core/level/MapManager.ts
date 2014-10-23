class MapManager implements IBox, IUpdate {
    //metaData;
    //objects : Entity[] = [];
    //graphics = [];
    //audio = [];
    width:number;
    height:number;
    pos:Vector;
    x:number;
    y:number;
    mapGenerator:MapGenerator;
    //angle : number;


    constructor(pos:Vector, width, height, mapGenerator:MapGenerator) {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.mapGenerator = mapGenerator;
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

    update(dt:number):void {
    }

    drawDebug(ctx:CanvasRenderingContext2D) {
    }
}
