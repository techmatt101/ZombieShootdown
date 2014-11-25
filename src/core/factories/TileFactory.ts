class TileFactory {

    static spawnTile(pos : Vector, tileSize : Vector, tileData : Tile) {
        var tile = new Entity(TileType[tileData.type] + ' Tile', new Box(tileSize.x, tileSize.y, pos));

        tile.addComponent(new Material());

        var texturePos : Vector;

        switch(tileData.type) {
            case TileType.WALL:
                texturePos = new Vector((<Wall>tileData.data).direction, 0);
                tile.addComponent(new Collision(tile.geometry));

                break;

            case TileType.FLOOR:
                texturePos = new Vector(5, 1);

                break;

            default :
                console.warn('Unknown Tile Type');
        }

        texturePos.scale(4);
        ResourceManager.retrieveImage('tiles', (img : HTMLImageElement) => {
            tile.components.material.setTexture(new Texture(img, new Vector(0,0), tileSize.x, tileSize.y, texturePos, 4, 4));
        });

        tile.components.material.zIndex = ZIndexLayer.BACKGROUND;

        tile.build();

        return tile;
    }
}