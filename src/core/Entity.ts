class Entity implements IUpdate, IPool {
    id : string;
    pos : Vector;
    geometry : Box;
    components = new ComponentList();
    available = false;
    active = true;

    private _componentList : IComponent<ComponentList>[] = [];
    private _componentListLength = 0;


    constructor (id : string, geometry : Box) {
        this.id = id;
        this.geometry = geometry;
        this.pos = this.geometry.pos; //TODO: hmmmm...
    }

    addComponent (component : IComponent<ComponentList>) {
        this._componentList.push(component);
        this._componentListLength++;
        component.build(this.components);
    }

    hasComponent (obj) {
        return typeof obj.reference(this) !== 'undefined';
    }

    hasActiveComponent (obj) {
        return this.active && typeof obj.reference(this) !== 'undefined' && obj.reference(this).active;
    }

    buildComponents () {
        for (var i = 0; i < this._componentListLength; i++) {
            this._componentList[i].active = true; //TODO: hmmmm....
            this._componentList[i].build(this.components);
        }
    }

    reset () { ///TODO: hmmm...
        this.active = true;
    }

    update (dt : number) {
        if (this.active) {
            for (var i = 0; i < this._componentListLength; i++) {
                if (this._componentList[i].active) {
                    this._componentList[i].update(dt);
                }
            }
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        if (this.active) {
            for (var i = 0; i < this._componentListLength; i++) {
                if (this._componentList[i].active) {
                    this._componentList[i].drawDebug(ctx);
                }
            }
        }
    }
}
