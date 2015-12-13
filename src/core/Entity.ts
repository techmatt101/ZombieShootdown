class Entity implements IUpdate, IPool {
    id = Date.now().toString(32) + (~~(Math.random() * 10000000)).toString(32);
    type : string;
    pos : Point;
    geometry : Box;
    components : IComponentDirectory = {};
    available = false;
    active = true;

    private _componentList : IComponent[] = [];
    private _componentListLength = 0;


    constructor(type : string, pos : Point, geometry : Box) {
        this.type = type;
        this.geometry = geometry;
        this.pos = pos; //TODO: hmmmm...
        geometry.pos = pos;
    }

    addComponent(component : IComponent) {
        this._componentList.push(component);
        this._componentListLength++;
        component.build(this.components);
    }

    hasComponent(obj) {
        return typeof obj.reference(this.components) !== 'undefined';
    }

    hasActiveComponent(obj) {
        return this.active && typeof obj.reference(this.components) !== 'undefined' && obj.reference(this.components).active;
    }

    build() {
        for (var i = 0; i < this._componentListLength; i++) {
            this._componentList[i].active = true; //TODO: hmmmm....
            this._componentList[i].build(this.components);
        }
    }

    reset() { ///TODO: hmmm...
        this.active = true;
    }

    update(dt : number) {
        if (this.active) {
            for (var i = 0; i < this._componentListLength; i++) {
                if (this._componentList[i].active) {
                    this._componentList[i].update(dt);
                }
            }
        }
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
        if (this.active) {
            for (var i = 0; i < this._componentListLength; i++) {
                if (this._componentList[i].active) {
                    this._componentList[i].drawDebug(ctx);
                }
            }
        }
    }
}