/** Random integer in the inclusive range [min, max]. */
export function randInt(min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
