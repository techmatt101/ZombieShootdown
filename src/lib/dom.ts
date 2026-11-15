/** Looks up a required element by id, failing loudly if the markup is missing it. */
export function byId<T extends HTMLElement = HTMLElement>(id : string) : T {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Missing #${id} element`);
    }
    return element as T;
}
