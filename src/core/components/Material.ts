class Material implements IComponent {
    active : boolean;
    texture : Texture = null;

    static reference(components : Components) {
        return components.material;
    }


    setTexture (texture : Texture) {
        this.texture = texture;
    }


    update (dt : number) {
    }

    drawDebug (ctx : CanvasRenderingContext2D) {
    }

    load (components : Components) {
        components.material = this;
    }
}