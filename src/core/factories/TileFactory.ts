class TileFactory {

    static spawnTile(pos : Vector, tileSize : Vector, tileData : Tile) {
        var tile = new Entity(TileType[tileData.type] + ' Tile', new Box(tileSize.x, tileSize.y, pos));

        switch(tileData.type) {
            case TileType.WALL:
                var pos = new Vector((<Wall>tileData.data).direction, 0);
                pos.scale(4);
                ResourceManager.retrieveImage('tiles', (img : HTMLImageElement) => {
                    tile.setTexture(new Texture(img, 4, 4, pos));
                });

                tile.components.add(new Collision(tile.geometry));

                break;

            case TileType.FLOOR:
                var pos = new Vector(5, 1);
                pos.scale(4);
                ResourceManager.retrieveImage('tiles', (img : HTMLImageElement) => {
                    tile.setTexture(new Texture(img, 4, 4, pos));
                });

                break;

            default :
                console.warn('Unknown Tile Type');
        }


        tile.components.build();

        return tile;
    }
}