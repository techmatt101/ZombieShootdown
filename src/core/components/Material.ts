import type { IComponent } from './IComponent';
import type { IComponentDirectory } from './IComponentDirectory';
import { ZIndexLayer } from '../level/ZIndexLayer';
import { Texture } from '../../lib/Texture';

export class Material implements IComponent {
    active : boolean;
    texture : Texture = null;
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
