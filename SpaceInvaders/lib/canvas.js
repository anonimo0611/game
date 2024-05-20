const roundedPoly = (ctx, points,radius)=> {
    let i, x, y, len, p1, p2, p3, v1, v2,
	    sinA, sinA90, radDirection, drawDirection, 
	    angle, halfAngle, cRadius, lenOut;
    const asVec = (p, pp, v)=> { // convert points to a line with len and normalised
        v.x = pp.x - p.x; // x,y as vec
        v.y = pp.y - p.y;
        v.len = Math.sqrt(v.x * v.x + v.y * v.y); // length of vec
        v.nx = v.x / v.len; // normalised
        v.ny = v.y / v.len;
        v.ang = Math.atan2(v.ny, v.nx); // direction of vec
    }
    v1 = {};
    v2 = {};
	points = points.map(([x,y])=> ({x,y}));	
    len = points.length;                         // number points
    p1 = points[len - 1];                        // start at end of path
    for (i = 0; i < len; i++) {                  // do each corner
        p2 = points[(i) % len];                  // the corner point that is being rounded
        p3 = points[(i + 1) % len];
        // get the corner as vectors out away from corner
        asVec(p2, p1, v1);                       // vec back from corner point
        asVec(p2, p3, v2);                       // vec forward from corner point
        // get corners cross product (asin of angle)
        sinA = v1.nx * v2.ny - v1.ny * v2.nx;    // cross product
        // get cross product of first line and perpendicular second line
        sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny; // cross product to normal of line 2
        angle = Math.asin(sinA);                 // get the angle
        radDirection = 1;                        // may need to reverse the radius
        drawDirection = false;                   // may need to draw the arc anticlockwise
        // find the correct quadrant for circle center
        if (sinA90 < 0) {
            if (angle < 0) {
                angle = Math.PI + angle; // add 180 to move us to the 3 quadrant
            } else {
                angle = Math.PI - angle; // move back into the 2nd quadrant
                radDirection = -1;
                drawDirection = true;
            }
        } else {
            if (angle > 0) {
                radDirection = -1;
                drawDirection = true;
            }
        }
        halfAngle = angle / 2;
        // get distance from corner to point where round corner touches line
        lenOut = Math.abs(Math.cos(halfAngle) * radius / Math.sin(halfAngle));
        if (lenOut > Math.min(v1.len / 2, v2.len / 2)) { // fix if longer than half line length
            lenOut = Math.min(v1.len / 2, v2.len / 2);
            // ajust the radius of corner rounding to fit
            cRadius = Math.abs(lenOut * Math.sin(halfAngle) / Math.cos(halfAngle));
        } else {
            cRadius = radius;
        }
        x = p2.x + v2.nx * lenOut; // move out from corner along second line to point where rounded circle touches
        y = p2.y + v2.ny * lenOut;
        x += -v2.ny * cRadius * radDirection; // move away from line to circle center
        y += v2.nx * cRadius * radDirection;
        // x,y is the rounded corner circle center
        ctx.arc(x, y, cRadius, v1.ang + Math.PI / 2 * radDirection, v2.ang - Math.PI / 2 * radDirection, drawDirection); // draw the arc clockwise
        p1 = p2;
        p2 = p3;
    }
    ctx.closePath();
};
const createRegularPolygonPath = (ctx,radius,num,{scaleX=1,scaleY=1}={})=> {
    ctx.beginPath();
    for (let deg=0; deg<360; deg+=360/num) {
	  	const x = cos(PI/180 * deg) * radius;
		const y = sin(PI/180 * deg) * radius;
        ctx.lineTo(x*scaleX, y*scaleY);
    }
    ctx.closePath();
}
const createRoundRectPath = (ctx, x, y, w, h, r)=> {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.arc(x+w-r, y+r, r, Math.PI * (3/2), 0, false);
    ctx.lineTo(x+w, y+h-r);
    ctx.arc(x+w-r, y+h-r, r, 0, Math.PI * (1/2), false);
    ctx.lineTo(x+r, y+h);
    ctx.arc(x+r, y+h-r, r, Math.PI * (1/2), Math.PI, false);
    ctx.lineTo(x, y+r);
    ctx.arc(x+r, y+r, r, Math.PI, Math.PI * (3/2), false);
    ctx.closePath();
}
const fillRoundRect = (ctx, x, y, w, h, r, color)=> {
 	ctx.fillStyle = color;
	createRoundRectPath(ctx, x, y, w, h, r);
    ctx.fill();
}
const strokeRoundRect = (ctx, x, y, w, h, r, color)=> {
 	ctx.strokeStyle = color;
	createRoundRectPath(ctx, x, y, w, h, r);
    ctx.stroke();
}