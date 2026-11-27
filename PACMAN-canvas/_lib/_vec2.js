'use strict'
class Vec2 {
	static get Zero()  {return vec2( 0, 0)}
	static get Up()    {return vec2( 0,-1)}
	static get Right() {return vec2( 1, 0)}
	static get Down()  {return vec2( 0, 1)}
	static get Left()  {return vec2(-1, 0)}

	void() {}
	toString() {return /**@type {const}*/(`{x:${this.x}, y:${this.y}}`)}

	/**
	 * @overload
	 * @param   {number}  x
	 * @param   {number} [y]
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos} pos
	 * @returns {Vec2}

	 * @overload
	 * @param   {xyTuple} xyTuple
	 * @returns {Vec2}

	 * @param {void|number|xyTuple|Pos} [v1]
	 * @param {number} [v2]
	 */static new = (v1,v2)=> new Vec2(...Vec2.#parseXY(v1,v2))

	/**
	 * @param {number}  x
	 * @param {number} [y]
	 */static fixed = (x, y=x)=> vec2(x,y).fixed

	/**
	 * @param {void|number|xyTuple|Pos} [v1]
	 * @param {number} [v2]
	 * @returns {[x:number, y:number]}
	 */static #parseXY(v1=0, v2) {
		if (v1 instanceof Array) return [v1[0], v1[1]]
		if (typeof v1 == 'number'
		 && typeof v2 == 'number') return [v1, v2]
		if (typeof v1 == 'object') return [v1.x, v1.y]
		return [v1, v2 ?? v1]
	}

	/**
	 * @param {Pos} pos1
	 * @param {Pos} pos2
	 */static eq = (pos1, pos2)=>
		(abs(pos1.x-pos2.x) < 1e-6 &&
		 abs(pos1.y-pos2.y) < 1e-6)

	/**
	 * @param {Pos} pos
	 * @param {Pos|number} val
	 */static add = (pos, val)=> vec2(pos).add(val)

	/**
	 * @param {Pos} pos
	 * @param {Pos|number} val
	 */static sub = (pos, val)=> vec2(pos).sub(val)

	/**
	 * @param {Pos} pos
	 * @param {number} scalar
	 */static mul = (pos, scalar)=> vec2(pos).mul(scalar)

	/**
	 * @param {Pos} pos
	 * @param {number} divisor
	 */static div = (pos, divisor)=> vec2(pos).div(divisor)

	/**
	 * @param {Pos} pos
	 * @param {number} scalar
	 */static divInt = (pos, scalar)=> vec2(pos).divInt(scalar)

	/**
	 * @param {Pos} pos1
	 * @param {Pos} pos2
	 */static sqrMag = (pos1, pos2)=> Vec2.sub(pos1, pos2).sqrMag

	/**
	 * @param {Pos} pos1
	 * @param {Pos} pos2
	 */static distance = (pos1, pos2)=> Vec2.sub(pos1, pos2).magnitude

	constructor(x=0, y=0) {
		this.x = x
		this.y = y
	}
	get vals()       {return /**@type {xyTuple}*/([this.x, this.y])}
	get hyphenated() {return /**@type {const}*/(`${this.x}-${this.y}`)}
	get fixed()      {return freeze({x:this.x, y:this.y, vals:freeze(this.vals)})}
	get inverse()    {return this.clone.mul(-1)}
	get sqrMag()     {return this.x**2 + this.y**2}
	get magnitude()  {return sqrt(this.sqrMag)}
	get clone()      {return vec2(this.x,  this.y)}
	get asInt()      {return vec2(floor(this.x),floor(this.y))}
	get normalized() {return (m=> vec2(this.x/m||0, this.y/m||0))(this.magnitude)}

	/**
	 * @overload
	 * @param   {number} x
	 * @param   {number} y
	 * @returns {boolean}

	 * @overload
	 * @param   {Pos} pos
	 * @returns {boolean}

	 * @overload
	 * @param   {xyTuple} xyTuple
	 * @returns {boolean}

	 * @param {number|xyTuple|Pos} v1
	 * @param {number} [v2]
	 */
	eq(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
		return Vec2.eq(this, {x,y})
	}

	/**
	 * @overload
	 * @param   {number}  x
	 * @param   {number} [y]
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos} pos
	 * @returns {Vec2}

	 * @overload
	 * @param   {xyTuple} xyTuple
	 * @returns {Vec2}

	 * @param {number|xyTuple|Pos} v1
	 * @param {number} [v2]
	 */
	set(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
		this.x = x
		this.y = y
		return this
	}
	setX(/**@type {number}*/x) {this.x  = x;return this}
	setY(/**@type {number}*/y) {this.y  = y;return this}
	addX(/**@type {number}*/x) {this.x += x;return this}
	addY(/**@type {number}*/y) {this.y += y;return this}

	/**
	 * @overload
	 * @param   {number}  x
	 * @param   {number} [y]
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos} pos
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos|number} numOrPos
	 * @returns {Vec2}

	 * @overload
	 * @param   {xyTuple} xyTuple
	 * @returns {Vec2}

	 * @param {number|xyTuple|Pos} v1
	 * @param {number} [v2]
	 */
	add(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
		this.x += x
		this.y += y
		return this
	}

	/**
	 * @overload
	 * @param   {number}  x
	 * @param   {number} [y]
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos} pos
	 * @returns {Vec2}

	 * @overload
	 * @param   {Pos|number} numOrPos
	 * @returns {Vec2}

	 * @overload
	 * @param   {xyTuple} xyTuple
	 * @returns {Vec2}

	 * @param {number|xyTuple|Pos} v1
	 * @param {number} [v2]
	 */
	sub(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
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

	/** @param {number} divisor */
	div(divisor) {
		this.x /= divisor
		this.y /= divisor
		return this
	}

	/** @param {number} divisor */
	divInt(divisor) {
		this.x = floor(this.x/divisor)
		this.y = floor(this.y/divisor)
		return this
	}

	/** @param {Pos} pos */
	dot(pos)   {return this.x * pos.x + this.y * pos.y}

	/** @param {Pos} pos */
	cross(pos) {return this.x * pos.y - this.y * pos.x}

	/** @param {Pos} pos */
	distance(pos) {return Vec2.sub(this,pos).magnitude}

	/** @param {number} cols */
	wrapX(cols) {
		if (cols <= 0) return this
		return this.setX(((this.x % cols) + cols) % cols)
	}
}
const {new:vec2}= Vec2