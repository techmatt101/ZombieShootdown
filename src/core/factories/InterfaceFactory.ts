class InterfaceFactory {

    static spawnPointer(input : InputState, camera : Camera) {
        var pointer = new Entity('Pointer', new Box(0, 0));
        var martial = new Material();
        pointer.addComponent(martial);
        pointer.addComponent(new Pointer(pointer.pos, martial, input, camera));

        pointer.components.material.zIndex = 99999;

        ResourceManager.retrieveImage('crosshair', (img : HTMLImageElement) => {
            martial.setTexture(new Texture(img, new Vector(-16, -16), 32, 32));
        });

        pointer.build();

        return pointer;
    }
}