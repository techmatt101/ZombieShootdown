class Components implements IUpdate {
    health :  Health;
    movement :  Movement;
    weapon :  WeaponHolder;
    controller;

    private _list : IComponent[] = [];


    add (attr : IComponent) {
        this._list.push(attr);
        attr.bind(this);
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