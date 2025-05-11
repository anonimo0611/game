'use strict'
/** @typedef {Vector2|{x:number,y:number}} Position */
class Vector2 {
	x=0;y=0;
	/** @type {[x:number, y:number]} */
	get vals()         {return [this.x, this.y]}
	get hyphenated()   {return `${this.x}-${this.y}`}
	get inverse()      {return this.clone.mul(-1)}
	get sqrMagnitude() {return this.x**2 + this.y**2}
	get magnitude()    {return sqrt(this.sqrMagnitude)}
	get clone()        {return Vec2(this.x,  this.y)}
	get asInt()        {return Vec2(this.x|0,this.y|0)}
	get normalized()   {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}

	/**
	 * @param {number|Position} [v1]
	 * @param {number} [v2]
	 */
	constructor(v1,v2) {this.set(v1, v2)}

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

	/** @param {number} x */
	setX(x) {return this.set(x, this.y)}

	/** @param {number} y */
	setY(y) {return this.set(this.x, y)}

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

	/** @param {number} scalar */
	mul(scalar) {
		this.x *= scalar
		this.y *= scalar
		return this
	}

	/** @param {number} scalar */
	div(scalar) {
		this.x /= scalar
		this.y /= scalar
		return this
	}

	/** @param {number} scalar */
	divInt(scalar) {
		this.x = (this.x/scalar)|0
		this.y = (this.y/scalar)|0
		return this
	}

	/**
	 * @param {number|Position} v1
	 * @param {number} [v2]
	 */
	eq(v1, v2) {
		const {x,y}= this.#validXY(v1, v2)
		return Vec2.eq(this, {x,y})
	}

	/** @param {Position} v */
	distance(v) {
		return Vec2.sub(this, v).magnitude
	}
	freeze() {
		return freeze(this)
	}
	/**
	 * @param {*} v1
	 * @param {number} [v2]
	 */
	#validXY(v1,v2) {
		v1 ??= 0
		Number.isFinite(v1) && (v2 ??= v1)
		const [x,y] = isObj(v1) ? [v1.x, v1.y] : [v1, v2]
		if (!Number.isFinite(x)) throw TypeError(`\`${x}\` is an ilegal x value`)
		if (!Number.isFinite(y)) throw TypeError(`\`${y}\` is an ilegal y valuer`)
		return {x,y}
	}
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
 */Vec2.isValid = v=> isObj(v) && Number.isFinite(v.x) && Number.isFinite(v.y)

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
 */Vec2.sqrMagnitude = (v1, v2)=> Vec2.sub(v1,v2).sqrMagnitude

/**
 * @param {Position} v1
 * @param {Position} v2
 */Vec2.distance = (v1, v2)=> Vec2.sub(v1,v2).magnitude

freeze(Vec2)