import type { Box } from './Box';
import type { Circle } from './Circle';
import type { IVector } from './IVector';
import type { Vector } from './Vector';

export const NO_HIT = Infinity;

export function boxesOverlap(a : Box, b : Box) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function separateBoxes(box : Box, from : Box, push : Vector) {
    if (!boxesOverlap(box, from)) return false;
    const dx = box.pos.x - from.pos.x, dy = box.pos.y - from.pos.y;
    const depthX = (dx > 0 ? 1 : -1) * (box.width + from.width) / 2 - dx;
    const depthY = (dy > 0 ? 1 : -1) * (box.height + from.height) / 2 - dy;
    if (Math.abs(depthX) <= Math.abs(depthY)) {
        push.set(depthX, 0);
    } else {
        push.set(0, depthY);
    }
    return true;
}

export function separateCircles(circle : Circle, from : Circle, push : Vector) {
    const dx = circle.pos.x - from.pos.x, dy = circle.pos.y - from.pos.y;
    const reach = circle.radius + from.radius;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared >= reach * reach) return false;
    const distance = Math.sqrt(distanceSquared);
    if (distance === 0) {
        push.set(reach, 0);
    } else {
        const depth = (reach - distance) / distance;
        push.set(dx * depth, dy * depth);
    }
    return true;
}

export function separateCircleFromBox(circle : Circle, box : Box, push : Vector) {
    const { x, y } = circle.pos;
    const radius = circle.radius;
    const closestX = Math.min(Math.max(x, box.left), box.right);
    const closestY = Math.min(Math.max(y, box.top), box.bottom);
    const dx = x - closestX, dy = y - closestY;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared >= radius * radius) return false;
    if (distanceSquared > 0) {
        const distance = Math.sqrt(distanceSquared);
        const depth = (radius - distance) / distance;
        push.set(dx * depth, dy * depth);
        return true;
    }
    pushCentreOutOfBox(circle, box, push);
    return true;
}

function pushCentreOutOfBox(circle : Circle, box : Box, push : Vector) {
    const { x, y } = circle.pos;
    const toLeft = x - box.left, toRight = box.right - x, toTop = y - box.top, toBottom = box.bottom - y;
    const nearest = Math.min(toLeft, toRight, toTop, toBottom);
    if (nearest === toLeft) push.set(-(toLeft + circle.radius), 0);
    else if (nearest === toRight) push.set(toRight + circle.radius, 0);
    else if (nearest === toTop) push.set(0, -(toTop + circle.radius));
    else push.set(0, toBottom + circle.radius);
}

export function distanceToBox(box : Box, point : IVector) {
    const dx = Math.max(box.left - point.x, 0, point.x - box.right);
    const dy = Math.max(box.top - point.y, 0, point.y - box.bottom);
    return Math.hypot(dx, dy);
}

export function segmentCircleEntry(from : IVector, to : IVector, circle : Circle) {
    const fx = from.x - circle.pos.x, fy = from.y - circle.pos.y;
    const startInside = fx * fx + fy * fy - circle.radius * circle.radius;
    if (startInside <= 0) return 0;
    const dx = to.x - from.x, dy = to.y - from.y;
    const a = dx * dx + dy * dy;
    if (a === 0) return NO_HIT;
    const b = 2 * (fx * dx + fy * dy);
    const discriminant = b * b - 4 * a * startInside;
    if (discriminant < 0) return NO_HIT;
    const entry = (-b - Math.sqrt(discriminant)) / (2 * a);
    return entry >= 0 && entry <= 1 ? entry : NO_HIT;
}

export function segmentBoxEntry(from : IVector, to : IVector, box : Box) {
    let entry = 0, exit = 1;
    const dx = to.x - from.x, dy = to.y - from.y;
    if (dx === 0) {
        if (from.x < box.left || from.x > box.right) return NO_HIT;
    } else {
        const toLeft = (box.left - from.x) / dx, toRight = (box.right - from.x) / dx;
        entry = Math.max(entry, Math.min(toLeft, toRight));
        exit = Math.min(exit, Math.max(toLeft, toRight));
    }
    if (dy === 0) {
        if (from.y < box.top || from.y > box.bottom) return NO_HIT;
    } else {
        const toTop = (box.top - from.y) / dy, toBottom = (box.bottom - from.y) / dy;
        entry = Math.max(entry, Math.min(toTop, toBottom));
        exit = Math.min(exit, Math.max(toTop, toBottom));
    }
    return entry <= exit ? entry : NO_HIT;
}
