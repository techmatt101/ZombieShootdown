import { Pointer } from '../components/Pointer';
import { Entity } from '../Entity';
import type { Camera } from '../../lib/Camera';
import type { InputState } from '../../lib/controllers/InputState';
import { Box } from '../../lib/geometry/Box';
import { Point } from '../../lib/geometry/Point';

export function spawnPointer(input : InputState, camera : Camera) {
    const pointer = new Entity('Pointer', new Point(0, 0, 0), new Box(0, 0));
    pointer.addComponent(new Pointer(pointer.pos, input, camera));
    pointer.build();
    return pointer;
}
