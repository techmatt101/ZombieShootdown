class TileFactory {

    static spawnTile(pos : Vector, tileSize : Vector, tileData : Tile) {
        var tile = new Entity('Tile', new Box(tileSize.x, tileSize.y, pos));

        switch(tileData.type) {
            case TileType.WALL:
                tile
                break;
            default :

        }

        tile.components.add(new Collision(<Box> tile.geometry));
        tile.components.build();

        return tile;
    }
}