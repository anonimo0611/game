const canvas2D = (id, w, h, attrs)=> {
	const cvs = byId(id) ?? document.createElement('canvas');
	const ctx = cvs.getContext('2d', attrs);
	if (typeOf(w) == 'HTMLCanvasElement') {
		({width:w,height:h}= w);
	}
	({w,h}= setCanvasSize(cvs)(w,h));
	ctx.clear = (x=0,y=0,w=cvs.width,h=cvs.height)=> ctx.clearRect(x,y,w,h);
	return {cvs,ctx,width:w,height:h,vals:[cvs,ctx,w,h]};
}
const setCanvasSize = param=> (w, h)=> {
	const cvs = (isStr(param)? byId(param) : param) || {};
	if (typeOf(cvs) == 'HTMLCanvasElement') {
		isNum(w) && (cvs.width  = w);
		isNum(h) && (cvs.height = h);
	}
	return {
		width: cvs.width  || 0,
		height:cvs.height || 0}
}
const roundedPoly = ctx=> (points,radius)=> {
	let i, x, y, len, p1, p2, p3, v1, v2,
		sinA, sinA90, radDirection, drawDirection,
		angle, halfAngle, cRadius, lenOut;

	const asVec = (p, pp, v)=> {
		v.x = pp.x - p.x;
		v.y = pp.y - p.y;
		v.len = Math.sqrt(v.x * v.x + v.y * v.y);
		v.nx = v.x / v.len;
		v.ny = v.y / v.len;
		v.ang = Math.atan2(v.ny, v.nx);
	}
	v1 = {};
	v2 = {};
	points = points.map(([x,y])=> ({x,y}));
	len = points.length;
	p1	= points[len-1];
	for (i = 0; i < len; i++) {
		p2 = points[(i)   % len];
		p3 = points[(i+1) % len];

		asVec(p2, p1, v1);
		asVec(p2, p3, v2);
		sinA   = v1.nx * v2.ny - v1.ny * v2.nx;
		sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny;
		angle	= Math.asin(sinA);
		radDirection  = 1;
		drawDirection = false;

		if (sinA90 < 0) {
			if (angle < 0) {
				angle = Math.PI + angle;
			} else {
				angle = Math.PI - angle;
				radDirection  = -1;
				drawDirection = true;
			}
		} else {
			if (angle > 0) {
				radDirection  = -1;
				drawDirection = true;
			}
		}
		halfAngle = angle / 2;

		lenOut = Math.abs(Math.cos(halfAngle) * radius / Math.sin(halfAngle));
		if (lenOut > Math.min(v1.len/2, v2.len/2)) {
			lenOut	= Math.min(v1.len/2, v2.len/2);
			cRadius = Math.abs(lenOut * Math.sin(halfAngle) / Math.cos(halfAngle));
		} else {
			cRadius = radius;
		}
		x = p2.x + v2.nx * lenOut;
		y = p2.y + v2.ny * lenOut;
		x += -v2.ny * cRadius * radDirection;
		y += v2.nx * cRadius * radDirection;

		ctx.arc(x, y,
			cRadius, v1.ang + Math.PI/2 * radDirection,
			v2.ang - Math.PI/2 * radDirection, drawDirection);
		p1 = p2;
		p2 = p3;
	}
	ctx.closePath();
};