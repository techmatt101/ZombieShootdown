class TileFactory {

    static spawnTile(pos : Vector, tileSize : Vector) {
        var tile = new Entity('Tile', new Box(tileSize.x, tileSize.y, pos), null);

        tile.components.add(new Collision(<Box> tile.geometry));
        tile.components.build();

        return tile;
    }
}