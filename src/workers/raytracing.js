// Find intersection of RAY & SEGMENT
function getIntersection (ray, segment) {

    // RAY in parametric: Point + Delta*T1
    var rpx = ray.a.x;
    var rpy = ray.a.y;
    var rdx = ray.b.x - ray.a.x;
    var rdy = ray.b.y - ray.a.y;

    // SEGMENT in parametric: Point + Delta*T2
    var spx = segment.a.x;
    var spy = segment.a.y;
    var sdx = segment.b.x - segment.a.x;
    var sdy = segment.b.y - segment.a.y;

    // Are they parallel? If so, no intersect
    var rmag = Math.sqrt(rdx * rdx + rdy * rdy);
    var smag = Math.sqrt(sdx * sdx + sdy * sdy);
    if (rdx / rmag == sdx / smag && rdy / rmag == sdy / smag) {
        // Unit vectors are the same.
        return null;
    }

    // SOLVE FOR T1 & T2
    var T2 = (rdx * (spy - rpy) + rdy * (rpx - spx)) / (sdx * rdy - sdy * rdx);
    var T1 = (spx + sdx * T2 - rpx) / rdx;

    // Must be within parametic whatevers for RAY/SEGMENT
    if (T1 < 0) return null;
    if (T2 < 0 || T2 > 1) return null;

    // Return the POINT OF INTERSECTION
    return {
        x: rpx + rdx * T1,
        y: rpy + rdy * T1,
        param: T1
    };
}