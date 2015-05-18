class Material implements IComponent<ComponentList> {
    active : boolean;
    texture : Texture = null;
    zIndex = ZIndexLayer.FOREGROUND;

    static reference(components : ComponentList) {
        return components.material;
    }


    setTexture(texture : Texture) {
        this.texture = texture;
    }


    update(dt : number) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    build(components : ComponentList) {
        components.material = this;
    }
}