class PlayerFactory {

    static spawnPlayer(room : Room, input : InputController, camera : Camera, weapon : IWeapon) {
        var player = new Entity('Player', new Box(54, 32,
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

        player.components.collision.behaviours.zombieDamage = new DamageCollisionBehavior()
            .acceptDamage(player.components.health);

        ResourceManager.retrieveImage('player', (img : HTMLImageElement) => {
            player.components.material.setTexture(new Texture(img, 30, 18, new Vector(0,0)));
        });

        player.build();

        return player;
    }
}