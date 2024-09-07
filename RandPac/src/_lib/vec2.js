class Vector2 {
	constructor(...args) {
		const {x, y}=xyFrom(args);
	    this.x = x;
	    this.y = y;
	};
	get vals()         {return [this.x, this.y]}
	get string()       {return this.toString()}
	get inverse()      {return this.clone.mul(-1)}
	get sqrMagnitude() {return this.x**2 + this.y**2}
	get magnitude()    {return sqrt(this.sqrMagnitude)}
	get clone()        {return Vec2(this.x,  this.y)}
	get asInt()        {return Vec2(this.x|0,this.y|0)}
	get asRound()      {return Vec2(round(this.x), round(this.y))}
	get normalized()   {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}
	set(...args) {
		const {x, y}=xyFrom(args);
		this.x = x;
		this.y = y;
		return this;
	}
	setX(x) {
		this.x = x;
		return this;
	}
	setY(y) {
		this.y = y;
		return this;
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
		const {x, y}=xyFrom(args);
		this.x += x;
		this.y += y;
		return this;
	}
	sub(...args) {
		const {x, y}=xyFrom(args);
		this.x -= x;
		this.y -= y;
		return this;
	}
	mul(n) {
		this.x *= n;
		this.y *= n;
		return this;
	}
	div(n) {
		this.x /= n;
		this.y /= n;
		return this;
	}
	divInt(n) {
		this.x = (this.x / n)|0;
		this.y = (this.y / n)|0;
		return this;
	}
	eq(...args) {
		const {x, y}=xyFrom(args);
		return Vec2.eq(this, {x, y});
	}
	idx(col) {
		return Vec2.idx(this, col);
	}
	distance(v) {
		return Vec2.sub(this, v).magnitude;
	}
	toString() {
		return `{x:${this.x.toFixed(2)},`
		      +` y:${this.y.toFixed(2)}}`;
	}
	freeze() {
		return Object.freeze(this);
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
Vec2 = (...args)=> new Vector2(...args);
Vec2.isValid    = (pos)   => isObj(pos) && isNum(pos.x) && isNum(pos.y);
Vec2.add        = (v1, v2)=> Vec2(v1).add(v2);
Vec2.sub        = (v1, v2)=> Vec2(v1).sub(v2);
Vec2.mul        = (v1,  n)=> Vec2(v1).mul(n);
Vec2.div        = (v1,  n)=> Vec2(v1).div(n);
Vec2.divInt     = (v1,  n)=> Vec2(v1).divInt(n);
Vec2.divRound   = (v1,  n)=> Vec2(v1).divRound(n);
Vec2.remainder  = (v1,  n)=> Vec2(v1.x % n, v1.y % n);
Vec2.reflect    = (v1,  n)=> Vec2(v1).sub(Vec2(n).mul(2*Vec2.dot(v1,n)));
Vec2.distance   = (v1, v2)=> Vec2.sub(v1, v2).magnitude;
Vec2.isVertical = (v1, v2)=> Vec2.dot(v1, v2)   < 1e-6;
Vec2.isParallel = (v1, v2)=> Vec2.cross(v1, v2) < 1e-6;
Vec2.fromIdx    = (i, col)=> Vec2(i % col, i / col|0);
Vec2.idx        = (v1,col)=> v1.y * col + v1.x;
Vec2.dot        = (v1, v2)=> v1.x * v2.x + v1.y * v2.y;
Vec2.cross      = (v1, v2)=> v1.x * v2.y - v1.y * v2.x;
Vec2.angle      = (v1, v2)=> atan2(v1.y - v2.y, v1.x - v2.x);
Vec2.eq         = (v1, v2)=> abs(v1.x - v2.x) < 1e-6 && abs(v1.y - v2.y) < 1e-6;
Object.defineProperties(Vec2, {
	Zero:  {get() {return Vec2( 0, 0)}},
	One:   {get() {return Vec2(+1,+1)}},
	Right: {get() {return Vec2(+1, 0)}},
	Left:  {get() {return Vec2(-1, 0)}},
	Up:    {get() {return Vec2( 0,-1)}},
	Down:  {get() {return Vec2( 0,+1)}},
})
Object.freeze(Vec2)