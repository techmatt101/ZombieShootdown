class PlayerFactory {

    static spawnPlayer(room : Room, input : InputState) {
        var player = new Entity('Player', new Point(room.pos.x + room.width / 2, room.pos.y + room.height / 2, 0), new Box(48, 48));

        player.addComponent(new InputControl(player, input));
        player.addComponent(new Movement(player.pos, 30, 1));
        player.addComponent(new Collision(player.geometry));

        player.addComponent(new Material());

        player.addComponent(new Health(400));

        player.components.collision.behaviours.zombieDamage = new DamageCollisionBehavior()
            .acceptDamage(player.components.health);

        ResourceManager.retrieveImage('player', (img : HTMLImageElement) => {
            player.components.material.setTexture(new Texture(img, new Vector(0, 0), 78, 46, new Vector(0, 72), 30, 17));
        });

        player.build();

        return player;
    }
}