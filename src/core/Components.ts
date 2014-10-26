class Components implements IUpdate {
    private _list : IComponent[] = [];


    add (attr : IComponent) {
        this[(<any> attr).constructor.name] = attr;
        this._list.push(attr);
    }

    get (obj) : IComponent {
        return this[obj.name];
    }

    has (obj) {
        return typeof this[obj.name] !== 'undefined';
    }

    update (dt : number) {
        for (var i = 0; i < this._list.length; i++) {
            this._list[i].update(dt);
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        for (var i = 0; i < this._list.length; i++) {
            this._list[i].drawDebug(ctx);
        }
    }
}