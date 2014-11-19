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
            tile.components.material.setTexture(new Texture(img, 4, 4, texturePos));
        });

        tile.buildComponents();

        return tile;
    }
}