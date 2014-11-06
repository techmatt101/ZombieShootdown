class Components implements IUpdate {

    get (obj) : IComponent {
        return this[obj.name];
    }

    has (obj) {
        return typeof this[obj.name] !== 'undefined';
    }

    add (attr : IComponent) {
        this[this.getName(attr)] = attr;
    }

    update (dt : number) {
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }

    build () {
        var updateCode = [];
        var debugCode = [];
        for (var key in this) {
            if (typeof this[key] === 'object') {
                updateCode.push('this.' + key + '.update(dt);');
                debugCode.push('this.' + key + '.drawDebug(ctx);');
            }
        }
        this.update = new Function('dt', updateCode.join('')).bind(this);
        this.drawDebug = new Function('ctx', debugCode.join('')).bind(this);
    }

    private getName (obj) : string {
        if(typeof obj.constructor.name !== 'undefined') {
            return obj.constructor.name;
        }
        //ECMA script < 6 polyfill
        name = /(\w+)\(/.exec(obj.constructor.toString())[1];
        obj.constructor.name = name;
        window[name].name = name;

        return name;
    }
}