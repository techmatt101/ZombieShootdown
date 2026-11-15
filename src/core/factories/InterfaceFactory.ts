import { ZIndexLayer } from '../level/ZIndexLayer';
import { Material } from '../components/Material';
import { Pointer } from '../components/Pointer';
import { Entity } from '../Entity';
import { Camera } from '../../lib/Camera';
import { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';
import { Vector } from '../../lib/geometry/Vector';
import { loadImage } from '../../lib/assets';
import { Texture } from '../../lib/Texture';

export function spawnPointer(input : InputState, camera : Camera) {
    const pointer = new Entity('Pointer', new Point(0, 0, 0), new Box(0, 0));
    const material = pointer.addComponent(new Material());
    pointer.addComponent(new Pointer(pointer.pos, material, input, camera));

    material.zIndex = ZIndexLayer.OVERLAY;

    loadImage('crosshair').then((img) => {
        material.setTexture(new Texture(img, new Vector(-16, -16), 32, 32));
    });

    pointer.build();

    return pointer;
}
