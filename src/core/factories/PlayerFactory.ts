class PlayerFactory {

    static spawnPlayer(room : Room, input : InputController, camera : Camera, weapon : IWeapon) {
        var player = new Entity('Player', new Box(30, 50,
            new Vector(
            room.pos.x + room.width / 2,
            room.pos.y + room.height / 2
        )));

        player.components.add(new Material());
        player.components.add(new Collision(player.geometry));
        player.components.add(new Movement(player.pos, 20, 1));
        player.components.add(new WeaponHolder(player.pos, weapon));
        player.components.add(new Health(200));
        player.components.add(new InputControl(player, input, camera));
        player.components.build();

        return player;
    }
}