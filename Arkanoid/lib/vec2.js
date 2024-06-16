class Vector2 {
	constructor(...args) {
		const {x, y}= xyFrom(args)
	    this.x = x
	    this.y = y
	}
	get vals()         {return [this.x, this.y]}
	get string()       {return this.toString()}
	get inverse()      {return this.clone.mul(-1)}
	get sqrMagnitude() {return this.x**2 + this.y**2}
	get magnitude()    {return Math.sqrt(this.sqrMagnitude)}
	get asInt()        {return Vec2(Math.trunc(this.x), Math.trunc(this.y))}
	get clone()        {return Vec2(this.x, this.y)}
	get normalized()   {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}
	set(...args) {
		const {x, y}= xyFrom(args)
		this.x = x
		this.y = y
		return this
	}
	dot(v) {
		this.set(Vec2.dot(this,v));
		return this;
	}
	cross(v) {
		this.set(Vec2.cross(this,v));
		return this;
	}
	add(...args) {
		const {x, y}= xyFrom(args)
		this.x += x
		this.y += y
		return this
	}
	sub(...args) {
		const {x, y}= xyFrom(args)
		this.x -= x
		this.y -= y
		return this
	}
	mul(...args) {
		const {x, y}= xyFrom(args)
		this.x *= x
		this.y *= y
		return this
	}
	div(...args) {
		const {x, y}= xyFrom(args)
		this.x /= x
		this.y /= y
		return this
	}
	divInt(...args) {
		const {x, y}= xyFrom(args)
		this.x = Math.trunc(this.x / x)
		this.y = Math.trunc(this.y / y)
		return this
	}
	eq(...args) {
		const {x, y}= xyFrom(args)
		return Vec2.eq(this, {x, y});
	}
	toString() {
		return `{x: ${this.x}, y: ${this.y}}`
	}
	freeze() {
		return Object.freeze(this);
	}
	xFreeze() {
		return Object.defineProperty(this, 'x', {value:this.x, configurable:false})
	}
	yFreeze() {
		return Object.defineProperty(this, 'y', {value:this.y, configurable:false})
	}
}
function xyFrom(args) {
	let x=0, y=0
	if (typeof args[0] == 'object') {
		x = args[0].x || 0
		y = args[0].y || 0
	} else {
		x = args[0] || 0
		y = args[1] || 0
		if (args.length == 1)
			y = x;
	}
	return {x, y}
}
export const
Vec2 = (...args)=> new Vector2(...args)
Vec2.dot         = (v1, v2)=> v1.x * v2.x + v1.y * v2.y
Vec2.cross       = (v1, v2)=> v1.x * v2.y - v1.y * v2.x
Vec2.isParallel  = (v1, v2)=> Vec2.cross(v1, v2) < 1e-6
Vec2.isVertical  = (v1, v2)=> Vec2.dot(v1, v2) < 1e-6
Vec2.add         = (v1, v2)=> Vec2(v1).add(v2)
Vec2.sub         = (v1, v2)=> Vec2(v1).sub(v2)
Vec2.mul         = (v1, n) => Vec2(v1).mul(n)
Vec2.div         = (v1, n) => Vec2(v1).div(n)
Vec2.divInt      = (v1, n) => Vec2(v1).divInt(n)
Vec2.distance    = (v1, v2)=> Vec2.sub(v1, v2).magnitude
Vec2.fromRadians = (radian)=> Vec2(Math.cos(radian), Math.sin(radian));
Vec2.fromDegrees = (degree)=> Vec2(Math.cos(degree * PI/180), Math.sin(degree * PI/180));
Vec2.toRadians   = (v1, v2)=> atan2(v1.y - v2.y, v1.x - v2.x);
Vec2.toDegrees   = (v1, v2)=> atan2(v1.y - v2.y, v1.x - v2.x) * 180/PI;
Vec2.eq          = (v1, v2)=> abs(v1.x - v2.x) < 1e-6 && abs(v1.y - v2.y) < 1e-6
Object.defineProperties(Vec2, {
	Zero:  {get() {return Vec2( 0, 0)}},
	One:   {get() {return Vec2(+1,+1)}},
	Right: {get() {return Vec2(+1, 0)}},
	Left:  {get() {return Vec2(-1, 0)}},
	Up:    {get() {return Vec2( 0,-1)}},
	Down:  {get() {return Vec2( 0,+1)}},
})
Vec2.getIntersection = (a, b, c, d)=> {
	const {cross,sub}= Vec2;
	const v = cross(sub(b,a), sub(d,c))
	if (v == 1e-6) {
		// Line segments are parallel
		return null
	}
	const s = cross(sub(c,a), sub(d,c)) / v
	const t = cross(sub(b,a), sub(a,c)) / v
	if (s < 1e-6 || 1 < s || t < 1e-6 || 1 < t) {
		// Line segments do not intersect
		return null
	}
	return Vec2(
		a.x + s * sub(b,a).x,
		a.y + s * sub(b,a).y
	)
}
Object.freeze(Vec2);