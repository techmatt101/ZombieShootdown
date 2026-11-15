import { ZIndexLayer } from '../level/ZIndexLayer';
import { Material } from '../components/Material';
import { Pointer } from '../components/Pointer';
import { Entity } from '../Entity';
import { Camera } from '../../lib/Camera';
import { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { ResourceManager } from '../../lib/ResourceManager';
import { Texture } from '../../lib/Texture';

export class InterfaceFactory {

    static spawnPointer(input : InputState, camera : Camera) {
        var pointer = new Entity('Pointer', new Point(0, 0, 0), new Box(0, 0));
        const material = pointer.addComponent(new Material());
        pointer.addComponent(new Pointer(pointer.pos, material, input, camera));

        material.zIndex = ZIndexLayer.OVERLAY;

        ResourceManager.retrieveImage('crosshair', (img : HTMLImageElement) => {
            material.setTexture(new Texture(img, new Vector(-16, -16), 32, 32));
        });

        pointer.build();

        return pointer;
    }
}
