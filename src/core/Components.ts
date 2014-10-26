class Components implements IUpdate {
    private _list : IComponent[] = [];


    add (attr : IComponent) {
        this[this.getName(attr)] = attr;
        this._list.push(attr);
    }

    private getName (obj) : string {
        if(typeof obj.constructor.name !== 'undefined') {
            return obj.constructor.name;
        }
        //ECMA script < 6 polyfill
        name = /(\w+)\(/.exec(obj.constructor.toString())[1];
        obj.name = name;
        window[name].name = name;

        return name;
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