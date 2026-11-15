import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Texture } from '../../lib/Texture';

export class Material implements IComponent {
    active = false;
    texture : Texture | null = null;
    zIndex = ZIndexLayer.FOREGROUND;

    static reference(components : IComponentDirectory) {
        return components.material;
    }


    setTexture(texture : Texture) {
        this.texture = texture;
    }


    update(dt : number) {
    }

    drawDebug(ctx : CanvasRenderingContext2D) {
    }

    build(components : IComponentDirectory) {
        components.material = this;
    }
}
