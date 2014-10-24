class PlayerFactory {
    static spawnPlayer(room : Room, input : InputController, camera : Camera) {
        var player = new Entity('Player', new Box(30, 50,
            new Vector(
            room.pos.x + room.width / 2,
            room.pos.y + room.height / 2
        )), null);

        player.addAttr(new InputControl(input, camera));
        player.addAttr(new Movement(20));
        player.addAttr(new Health(200));
        //player.addAttr(new WeaponHolder(gun));

        return player;
    }
}