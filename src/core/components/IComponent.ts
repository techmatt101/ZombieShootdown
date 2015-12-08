interface IComponent<T> extends IUpdate {
    active : boolean
    build(components : T)
}