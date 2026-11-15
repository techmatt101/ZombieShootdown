import type { IComponentDirectory } from './IComponentDirectory';
import type { IUpdate } from '../../lib/IUpdate';

export interface IComponent extends IUpdate {
    active : boolean
    build(components : IComponentDirectory)
}
