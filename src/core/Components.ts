class Components implements IUpdate {

    add (attr : IComponent) {
        this[this.getName(attr)] = attr;
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
        this.updateComponents(this, dt);
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
        this.debugComponents(this, ctx);
    }

    build () {
        var updateCode = [];
        var debugCode = [];
        for (var key in this) {
            if (typeof this[key] === 'object') {
                updateCode.push('self.' + key + '.update(dt);');
                debugCode.push('self.' + key + '.drawDebug(ctx);');
            }
        }
        this.updateComponents = new Function('self, dt', updateCode.join(''));
        this.debugComponents = new Function('self, ctx', debugCode.join(''));
    }

    updateComponents : Function = function (self, dt) {
    };
    debugComponents : Function = function (self, ctx) {
    };
}