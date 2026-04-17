'use strict'
class Vec2 {
	static get Zero()  {return Vec2.new( 0, 0)}
	static get Up()    {return Vec2.new( 0,-1)}
	static get Right() {return Vec2.new( 1, 0)}
	static get Down()  {return Vec2.new( 0, 1)}
	static get Left()  {return Vec2.new(-1, 0)}

	void() {}

	/**
	 @overload
	 @returns {Vec2}

	 @overload
	 @param   {number} scalar
	 @returns {Vec2}

	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {Vec2}

	 @overload
	 @param   {Position} pos
	 @returns {Vec2}

	 @overload
	 @param   {xyTuple} xyTuple
	 @returns {Vec2}

	 @param {void|number|xyTuple|Position} [v1]
	 @param {number} [v2]
	*/static new(v1,v2) {
		return new Vec2(...this.parseXY(v1,v2))
	}

	/**
	 @param {number}  x
	 @param {number} [y]
	*/static fixed(x,y=x) {
		return Vec2.new(x,y).fixed
	}

	/**
	 @param {void|number|xyTuple|Position} [v1]
	 @param {number} [v2]
	 @returns {[x:number, y:number]}
	*/static parseXY(v1=0, v2) {
		if (v1 instanceof Array) return [v1[0], v1[1]]
		if (typeof v1 == 'number'
		 && typeof v2 == 'number') return [v1, v2]
		if (typeof v1 == 'object') return [v1.x, v1.y]
		return [v1, v2 ?? v1]
	}

	/**
	 @param {Position} pos1
	 @param {Position} pos2
	*/static eq(pos1, pos2) {
		return(
			abs(pos1.x-pos2.x) < 1e-6 &&
			abs(pos1.y-pos2.y) < 1e-6
		)
	}

	/**
	 @param {Position} pos
	 @param {number} cols
	*/static idx(pos,cols) {
		if (cols <= 0) throw RangeError('Column count must be greater than zero')
		return Number(pos.y * cols + pos.x)
	}

	/**
	 @param {Position} pos1
	 @param {Position} pos2
	*/static add(pos1,pos2) {
		return Vec2.new(pos1).add(pos2)
	}

	/**
	 @param {Position} pos1
	 @param {Position} pos2
	*/static sub(pos1,pos2) {
		return Vec2.new(pos1).sub(pos2)
	}

	/**
	 @param {Position} pos
	 @param {number} scalar
	*/static mul(pos,scalar) {
		return Vec2.new(pos).mul(scalar)
	}

	/**
	 @param {Position} pos
	 @param {number} scalar
	*/static div(pos,scalar) {
		return Vec2.new(pos).div(scalar)
	}

	/**
	 @param {Position} pos
	 @param {number} scalar
	*/static divInt(pos,scalar) {
		return Vec2.new(pos).divInt(scalar)
	}

	/**
	 @param {Position} pos1
	 @param {Position} pos2
	*/static sqrMag(pos1,pos2) {
		return Vec2.sub(pos1,pos2).sqrMag
	}

	/**
	 @param {Position} pos1
	 @param {Position} pos2
	*/static distance(pos1,pos2) {
		return Vec2.sub(pos1,pos2).magnitude
	}

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
	get clone()      {return Vec2.new(this.x,  this.y)}
	get asInt()      {return Vec2.new(this.x|0,this.y|0)}
	get normalized() {return Vec2.new(this.x/this.magnitude, this.y/this.magnitude)}

	/**
	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {boolean}

	 @overload
	 @param   {Position} pos
	 @returns {boolean}

	 @overload
	 @param   {xyTuple} xyTuple
	 @returns {boolean}

	 @param {number|xyTuple|Position} v1
	 @param {number} [v2]
	*/
	eq(v1, v2) {
		const [x,y]= Vec2.parseXY(v1, v2)
		return Vec2.eq(this, {x,y})
	}

	/**
	 @overload
	 @param   {number} scalar
	 @returns {Vec2}

	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {Vec2}

	 @overload
	 @param   {Position} pos
	 @returns {Vec2}

	 @overload
	 @param   {xyTuple} xyTuple
	 @returns {Vec2}

	 @param {number|xyTuple|Position} v1
	 @param {number} [v2]
	*/
	set(v1, v2) {
		const [x,y]= Vec2.parseXY(v1, v2)
		this.x = x
		this.y = y
		return this
	}
	setX(/**@type {number}*/x) {this.x  = x;return this}
	setY(/**@type {number}*/y) {this.y  = y;return this}
	addX(/**@type {number}*/x) {this.x += x;return this}
	addY(/**@type {number}*/y) {this.y += y;return this}

	/**
	 @overload
	 @param   {number} scalar
	 @returns {Vec2}

	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {Vec2}

	 @overload
	 @param   {Position} pos
	 @returns {Vec2}

	 @overload
	 @param   {xyTuple} xyTuple
	 @returns {Vec2}

	 @param {number|xyTuple|Position} v1
	 @param {number} [v2]
	*/
	add(v1, v2) {
		const [x,y]= Vec2.parseXY(v1, v2)
		this.x += x
		this.y += y
		return this
	}

	/**
	 @overload
	 @param   {number} scalar
	 @returns {Vec2}

	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {Vec2}

	 @overload
	 @param   {Position} pos
	 @returns {Vec2}

	 @overload
	 @param   {xyTuple} xyTuple
	 @returns {Vec2}

	 @param {number|xyTuple|Position} v1
	 @param {number} [v2]
	*/
	sub(v1, v2) {
		const [x,y]= Vec2.parseXY(v1, v2)
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

	/** @param {Readonly<Position>} pos */
	distance(pos) {
		return Vec2.sub(this,pos).magnitude
	}

	/** @param {number} cols */
	toIdx(cols) {
		return Vec2.idx(this,cols)
	}

	toString() {
		return /**@type {const}*/(`{x:${this.x}, y:${this.y}}`)
	}
}