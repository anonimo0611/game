class Vec2 {
	constructor(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
	    this.x = x
	    this.y = y
	}
	static #getXYFromObj(args) {
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
	static get Zero()  {return vec2( 0, 0)}
	static get One()   {return vec2(+1,+1)}
	static get Right() {return vec2(+1, 0)}
	static get Left()  {return vec2(-1, 0)}
	static get Up()    {return vec2(0, -1)}
	static get Down()  {return vec2(0, +1)}
	static add        = (v1, v2)=> vec2(v1).add(v2)
	static sub        = (v1, v2)=> vec2(v1).sub(v2)
	static mul        = (v1, n) => vec2(v1).mul(n)
	static div        = (v1, n) => vec2(v1).div(n)
	static divInt     = (v1, n) => vec2(v1).divInt(n)
	static remainder  = (v1, n) => vec2(v1.x % n, v1.y % n)
	static fromIdx    = (i, col)=> vec2(i % col, i / col|0);
	static idx        = (v1,col)=> v1.y * col + v1.x;
	static dot        = (v1, v2)=> v1.x * v2.x + v1.y * v2.y
	static cross      = (v1, v2)=> v1.x * v2.y - v1.y * v2.x
	static distance   = (v1, v2)=> Vec2.sub(v1, v2).magnitude
	static isParallel = (v1, v2)=> Vec2.cross(v1, v2) < 0.000001
	static isVertical = (v1, v2)=> Vec2.dot(v1, v2) < 0.000001
	static eq         = (v1, v2)=> abs(v1.x - v2.x) < 0.000001 && abs(v1.y - v2.y) < 0.000001
	static reflect    = (v, n)  => vec2(v).sub(vec2(n).mul(2*Vec2.dot(v,n)))

	get vals()       {return [this.x, this.y]}
	get string()     {return this.toString()}
	get inverse()    {return this.clone.mul(-1)}
	get magnitude()  {return Math.sqrt(this.x**2 + this.y**2)}
	get asInt()      {return vec2(Math.trunc(this.x), Math.trunc(this.y))}
	get clone()      {return vec2(this.x, this.y)}
	get normalized() {return vec2(this.x/this.magnitude, this.y/this.magnitude)}
	set(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
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
		const {x, y}= Vec2.#getXYFromObj(args)
		this.x += x
		this.y += y
		return this
	}
	sub(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
		this.x -= x
		this.y -= y
		return this
	}
	mul(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
		this.x *= x
		this.y *= y
		return this
	}
	div(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
		this.x /= x
		this.y /= y
		return this
	}
	divInt(...args) {
		const {x, y}= Vec2.#getXYFromObj(args)
		this.x = Math.trunc(this.x / x)
		this.y = Math.trunc(this.y / y)
		return this
	}
	toString() {
		return `{x: ${this.x}, y: ${this.y}}`
	}
	freeze() {
		return Object.freeze(this);
	}
}
function vec2(...args) {
	return new Vec2(...args)
}
Object.freeze(Vec2)
Object.freeze(Vec2.prototype)