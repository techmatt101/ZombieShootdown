class Material implements IComponent {
    active : boolean;
    texture : Texture = null;
    zIndex = ZIndexLayer.FOREGROUND;

    static reference(components : IComponentDirectory) {
        return components.material;
    }


    setTexture(texture : Texture) {
        this.texture = texture;
    }


    update(dt : number) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    build(components : IComponentDirectory) {
        components.material = this;
    }
}