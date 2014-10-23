class PlayerFactory {
    static spawnPlayer(room : Room, gun : Gun) {
        return new Player(new Vector(
            room.pos.x + room.width / 2,
            room.pos.y + room.height / 2
        ), 30, 50, null, gun);
    }
}