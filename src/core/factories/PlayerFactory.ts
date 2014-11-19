class PlayerFactory {

    static spawnPlayer(room : Room, input : InputController, camera : Camera, weapon : IWeapon) {
        var player = new Entity('Player', new Box(30, 50,
            new Vector(
            room.pos.x + room.width / 2,
            room.pos.y + room.height / 2
        )));

        player.addComponent(new Material());
        player.addComponent(new Collision(player.geometry));
        player.addComponent(new Movement(player.pos, 20, 1));
        player.addComponent(new WeaponHolder(player.pos, weapon));
        player.addComponent(new Health(200));
        player.addComponent(new InputControl(player, input, camera));
        player.buildComponents();

        return player;
    }
}