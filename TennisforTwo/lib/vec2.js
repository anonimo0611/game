const NEARLY_0 = 0.000001;
class Vector2 {
	constructor(...args) {
		const {x, y}= xyFrom(args)
	    this.x = x
	    this.y = y
	}
	get vals()       {return [this.x, this.y]}
	get inverse()    {return this.clone.mul(-1)}
	get magnitude()  {return sqrt(this.x**2 + this.y**2)}
	get clone()      {return Vec2(this.x, this.y)}
	get asInt()      {return Vec2(int(this.x), int(this.y))}
	get normalized() {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}

	freeze()   {return freeze(this)}
	toString() {return`{x: ${this.x}, y: ${this.y}}`}

	set(...args) {
		const {x, y}= xyFrom(args)
		this.x = x
		this.y = y
		return this
	}
	reset() {
		this.set = Vec2.Zero;
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
	mul(num) {
		this.x *= num
		this.y *= num
		return this
	}
	div(num) {
		this.x /= num
		this.y /= num
		return this
	}
	divInt(num) {
		this.x = int(this.x / num)
		this.y = int(this.y / num)
		return this
	}
}
const xyFrom = args=> {
	let x=0, y=0;
	if (typeof args[0] == 'object') {
		x = args[0].x || 0;
		y = args[0].y || 0;
	} else {
		x = args[0] || 0;
		y = args[1] || 0;
		if (args.length == 1) y = x;
	}
	return {x, y};
}
export const
Vec2 = (...args)=> new Vector2(...args)
Vec2.dot        = (v1,v2)=> v1.x*v2.x + v1.y*v2.y
Vec2.cross      = (v1,v2)=> v1.x*v2.y - v1.y*v2.x
Vec2.add        = (v1,v2)=> Vec2(v1).add(v2)
Vec2.sub        = (v1,v2)=> Vec2(v1).sub(v2)
Vec2.mul        = (v1, n)=> Vec2(v1).mul(n)
Vec2.div        = (v1, n)=> Vec2(v1).div(n)
Vec2.divInt     = (v1, n)=> Vec2(v1).divInt(n)
Vec2.distance   = (v1,v2)=> Vec2.sub  (v1, v2).magnitude
Vec2.isVertical = (v1,v2)=> Vec2.dot  (v1, v2) < NEARLY_0
Vec2.isParallel = (v1,v2)=> Vec2.cross(v1, v2) < NEARLY_0
Vec2.eq         = (v1,v2)=> abs(v1.x-v2.x) < NEARLY_0 && abs(v1.y-v2.y) < NEARLY_0
Object.defineProperties(Vec2, {
	Zero:  {get() {return Vec2( 0, 0)}},
	One:   {get() {return Vec2(+1,+1)}},
	Right: {get() {return Vec2(+1, 0)}},
	Left:  {get() {return Vec2(-1, 0)}},
	Up:    {get() {return Vec2( 0,-1)}},
	Down:  {get() {return Vec2( 0,+1)}},
})
freeze(Vec2)