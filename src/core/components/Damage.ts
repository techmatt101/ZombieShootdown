module ZombieApp {
    export class Damage implements IComponent<ComponentList> {
        active : boolean;
        value : number;

        static reference(components : ComponentList) {
            return components.damage;
        }

        constructor(damage : number = 10) {
            this.value = damage;
        }

        update(dt : number) : void {
        }

        drawDebug(ctx : CanvasRenderingContext2D) : void {
        }

        build(components : ComponentList) {
            components.damage = this;
        }
    }
}