interface IComponent<T> extends IUpdate {
    active : boolean
    load(components : T)
}