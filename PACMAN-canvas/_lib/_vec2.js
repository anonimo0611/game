'use strict'
/** @typedef {[x: number,y: number]} xyList */
/** @typedef {{x?:number,y?:number}} OptionalPos */
/** @typedef {Vector2|{x:number,y:number}} Position */

class Vector2 {
	x=0;y=0;
	/** @returns {[x:number,y:number]} */
	get vals()       {return [this.x,this.y]}
	get hyphenated() {return `${this.x}-${this.y}`}
	get string()     {return this.toString()}
	get inverse()    {return this.clone.mul(-1)}
	get sqrMag()     {return this.x**2 + this.y**2}
	get magnitude()  {return sqrt(this.sqrMag)}
	get clone()      {return Vec2(this.x,  this.y)}
	get asInt()      {return Vec2(this.x|0,this.y|0)}
	get normalized() {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}

	/**
	 * @param {number|Position} [v1]
	 * @param {number} [v2]
	 */
	constructor(v1,v2) {this.set(v1, v2)}

	/**
	 * @param {number|Position} [v1]
	 * @param {number} [v2]
	 */
	#validXY(v1,v2) {
		if (typeof v1 == 'object') {
			return v1
		}
		if (typeof v1 == 'number'
		 && typeof v2 == 'number') {
			return {x:v1, y:v2}
		}
		v1 ??= 0
		v2 ??= v1
		return {x:v1, y:v2}
	}

	/**
	 * @param {number|Position} [v1]
	 * @param {number} [v2]
	 */
	set(v1, v2) {
		const {x,y}= this.#validXY(v1, v2)
		this.x = x
		this.y = y
		return this
	}
	setX(/**@type {number}*/x) {return this.set(x, this.y)}
	setY(/**@type {number}*/y) {return this.set(this.x, y)}

	/**
	 * @param {number|Position} v1
	 * @param {number} [v2]
	 */
	eq(v1, v2) {
		const {x,y}= this.#validXY(v1, v2)
		return Vec2.eq(this, {x,y})
	}

	/**
	 * @param {number|Position} v1
	 * @param {number} [v2]
	 */
	add(v1, v2) {
		const {x,y}= this.#validXY(v1, v2)
		this.x += x
		this.y += y
		return this
	}

	/**
	 * @param {number|Position} v1
	 * @param {number} [v2]
	 */
	sub(v1, v2) {
		const {x,y}= this.#validXY(v1, v2)
		this.x -= x
		this.y -= y
		return this
	}

	mul(/**@type {number}*/scalar) {
		this.x *= scalar
		this.y *= scalar
		return this
	}
	div(/**@type {number}*/scalar) {
		this.x /= scalar
		this.y /= scalar
		return this
	}
	divInt(/**@type {number}*/scalar) {
		this.x = (this.x/scalar)|0
		this.y = (this.y/scalar)|0
		return this
	}
	distance(/**@type {Position}*/v) {
		return Vec2.sub(this, v).magnitude
	}
	freeze() {
		return freeze(this)
	}
	toString() {return `{x:${this.x}, y:${this.y}}`}
}

/**
 * @typedef {Vector2}
 * @param {number|Position} [v1]
 * @param {number} [v2]
 */
const
Vec2 = (v1, v2)=> new Vector2(v1, v2)
Vec2.Zero  = Vec2( 0, 0)
Vec2.Up    = Vec2( 0,-1)
Vec2.Right = Vec2( 1, 0)
Vec2.Down  = Vec2( 0, 1)
Vec2.Left  = Vec2(-1, 0)

for (const [k,v] of entries(Vec2)) {
	v instanceof Vector2
		&& defineProperty(Vec2, k, {get(){return v.clone}})
}
/**
 * @param {Position} v
 */Vec2.isValid = v=> v && Number.isFinite(v.x) && Number.isFinite(v.y)

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.eq = (v1, v2)=> abs(v1.x-v2.x) < 1e-6 && abs(v1.y-v2.y) < 1e-6

/**
 * @param {Position} v
 * @param {number} cols
 */Vec2.idx = (v,cols)=> Number(v.y * cols + v.x)

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.add = (v1, v2)=> Vec2(v1).add(v2)

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.sub = (v1, v2)=> Vec2(v1).sub(v2)

/**
 * @param {Position} v1
 * @param {number} scalar
 */Vec2.mul = (v1, scalar)=> Vec2(v1).mul(scalar)

/**
 * @param {Position} v
 * @param {number} scalar
 */Vec2.div = (v, scalar)=> Vec2(v).div(scalar)

/**
 * @param {Position} v
 * @param {number} scalar
 */Vec2.divInt = (v, scalar)=> Vec2(v).divInt(scalar)

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.sqrMag = (v1, v2)=> Vec2.sub(v1,v2).sqrMag

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.distance = (v1, v2)=> Vec2.sub(v1,v2).magnitude

freeze(Vec2)