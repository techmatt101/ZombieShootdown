class TileFactory {

    static spawnTile(pos : Vector, tileSize : Vector, tileData : Tile) {
        var tile = new Entity(TileType[tileData.type] + ' Tile', new Point(0, 0, 0).copyVector(pos), new Box(tileSize.x, tileSize.y));

        tile.addComponent(new Material());

        var texturePos : Vector, tileImageSize = 8;

        switch (tileData.type) {
            case TileType.WALL:
                texturePos = new Vector((<Wall>tileData.data).direction, 0);
                tile.addComponent(new Collision(tile.geometry));

                break;

            case TileType.DOOR:
                texturePos = new Vector(1, 1);
                tile.addComponent(new Collision(tile.geometry));

                //window.addEventListener('click', () => { //TODO: BIGGEST HACK OF THE UNIVERSE BIG TIME JUST WOW REALLY HAVE TO BE JOKING ME!!!! ARE YOU MAD OR WHAT!?!?!
                //    if(tile.components.collision.getBoundary().isBoundingBoxWith(new Box(5, 5, game.camera.view.clone().offset(game.input.getPointerPos())))) {
                //        tile.components.collision.active =  !tile.components.collision.active;
                //        tile.components.material.texture.sourcePos.x = ((tile.components.collision.active) ? 1 : 2) * tileImageSize;
                //    }
                //});

                break;

            case TileType.FLOOR:
                texturePos = new Vector(0, 1);
                tile.pos.direction = (Math.PI / 2) * randInt(0, 3);

                break;

            default :
                console.warn('Unknown Tile Type');
        }

        texturePos.scale(tileImageSize);
        ResourceManager.retrieveImage('tiles', (img : HTMLImageElement) => {
            tile.components.material.setTexture(new Texture(img, new Vector(0, 0), tileSize.x, tileSize.y, texturePos, 8, 8));
        });

        tile.components.material.zIndex = ZIndexLayer.BACKGROUND;

        tile.build();

        return tile;
    }
}