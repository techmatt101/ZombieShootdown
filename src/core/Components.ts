class Components implements IUpdate {
    controller : IEntityController;
    collision : Collision;
    movement : Movement;
    health : Health;
    weaponHolder : WeaponHolder;
    spriteAnimation : SpriteAnimation;

    private _list : IComponent[] = [];
    private _parent : Entity;


    constructor (parent : Entity) {
        this._parent = parent;
    }

    add (component : IComponent) {
        this._list.push(component);
        component.load(this);
    }

    has (obj) {
        return typeof obj.reference(this) !== 'undefined';
    }

    hasActive (obj) {
        return this._parent.active && typeof obj.reference(this) !== 'undefined' && obj.reference(this).active;
    }

    update (dt : number) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].active) {
                this._list[i].update(dt);
            }
        }
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].active) {
                this._list[i].drawDebug(ctx);
            }
        }
    }

    build () {
        for (var i = 0; i < this._list.length; i++) {
            this._list[i].active = true; //TODO: hmmmm....
            this._list[i].load(this);
        }
    }
}