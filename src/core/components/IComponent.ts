interface IComponent extends IUpdate {
    active : boolean
    build(components : IComponentDirectory)
}