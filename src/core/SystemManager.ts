class SystemManager {
    logic : LogicSystem;
    collision : CollisionSystem;
    render : RenderSystem;


    constructor(renderer : Drawer) {
        this.logic = new LogicSystem();
        this.collision = new CollisionSystem();
        this.render = new RenderSystem(renderer);
    }

    add (entity : Entity) {
        this.logic.add(entity);
        this.collision.add(entity);
        this.render.add(entity);
    }

    update(dt : number) {
        this.logic.update(dt);
        this.collision.update(dt);
        this.render.update(dt);
    }
}