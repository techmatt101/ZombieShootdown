class PlayerFactory {
    static spawnPlayer(room : Room, input : InputController, camera : Camera) {
        var player = new Entity('Player', new Box(30, 50,
            new Vector(
            room.pos.x + room.width / 2,
            room.pos.y + room.height / 2
        )), null);

        player.components.add(new Collision(<Box> player.geometry));
        player.components.add(new Movement(player.pos, 20));
        //player.addComponent(new WeaponHolder(gun));
        player.components.add(new Health(200));
        player.components.add(new InputControl(player, input, camera));

        return player;
    }
}