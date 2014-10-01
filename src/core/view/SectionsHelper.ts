class SectionsHelper {

    private _camera : Camera;

    constructor (camera : Camera) {
        this._camera =  camera;
    }

    getViewOffset() {
        return new Vector( //Calculate the off set of sections placement to align up one main section perfectly with the view
            (~~(-this._camera.view.x / this._camera.view.width) + 1) * this._camera.view.width + this._camera.view.x,
            (~~(-this._camera.view.y / this._camera.view.height) + 1) * this._camera.view.height + this._camera.view.y
        ); //todo: still think it is out by 1 or not, maybe? not sure?
    }

    createSections(offset : Vector) : Array<Section[]> {
        var baseSections = [];
        for (var x = 0; x < (this._camera.boundary.width + offset.x) / this._camera.view.width; x++) { //splits map up into sections based on view
            baseSections[x] = [];
            for (var y = 0; y < (this._camera.boundary.height + offset.y) / this._camera.view.height; y++) {
                baseSections[x][y] = new Section(this._camera.view.width * x - offset.x, this._camera.view.height * y - offset.y, this._camera.view.width, this._camera.view.height);
            }
        }
        return baseSections;
    }

    assignEntitiesToSection(offset : Vector, baseSections : Array<Section[]>, entities) {
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i],
                x = ~~((entity.x + offset.x) / this._camera.view.width),
                yy = ~~((entity.y + offset.y) / this._camera.view.height);
            entity.section = baseSections[x][yy];
            for (x; x < (entity.x + offset.x + entity.width) / this._camera.view.width; x++) {
                for (var y = yy; y < (entity.y + offset.y + entity.height) / this._camera.view.height; y++) {
                    baseSections[x][y].entities.push(entity);
                }
            }
        }
    }
}