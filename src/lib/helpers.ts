export function randInt(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function shuffle<T>(items : T[]) : T[] {
    for (let i = items.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}
