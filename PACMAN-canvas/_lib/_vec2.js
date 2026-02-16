'use strict'

class Vec2 {
	static get Zero()  {return Vec2.new( 0, 0)}
	static get Up()    {return Vec2.new( 0,-1)}
	static get Right() {return Vec2.new( 1, 0)}
	static get Down()  {return Vec2.new( 0, 1)}
	static get Left()  {return Vec2.new(-1, 0)}

	/**
	 @param {void|number|Position} [v1]
	 @param {number} [v2]
	 @returns {[x:number, y:number]}
	*/
	static #parseXY(v1=0, v2) {
		if (typeof v1 == 'number'
		 && typeof v2 == 'number') return [v1, v2]
		if (typeof v1 == 'object') return [v1.x, v1.y]
		return [v1, v2 ?? v1]
	}

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

	 @param {void|number|Position} [v1]
	 @param {number} [v2]
	*/
	static new(v1,v2) {
		return new Vec2(...this.#parseXY(v1,v2))
	}

	static eq(
	 /**@type {Position}*/pos1,
	 /**@type {Position}*/pos2
	) {
		return(
			abs(pos1.x-pos2.x) < 1e-6 &&
			abs(pos1.y-pos2.y) < 1e-6
		)
	}

	static idx(
	 /**@type {Position}*/pos,
	 /**@type {number}*/cols
	) {
		if (cols <= 0) throw RangeError('Column count must be greater than zero')
		return Number(pos.y * cols + pos.x)
	}

	static add(
	 /**@type {Position}*/pos1,
	 /**@type {Position}*/pos2){return Vec2.new(pos1).add(pos2)}

	static sub(
	 /**@type {Position}*/pos1,
	 /**@type {Position}*/pos2){return Vec2.new(pos1).sub(pos2)}

	static mul(
	 /**@type {Position}*/pos,
	 /**@type {number}*/scalar){return Vec2.new(pos).mul(scalar)}

	static div(
	 /**@type {Position}*/pos,
	 /**@type {number}*/scalar){return Vec2.new(pos).div(scalar)}

	static divInt(
	 /**@type {Position}*/pos,
	 /**@type {number}*/scalar){return Vec2.new(pos).divInt(scalar)}

	static sqrMag(
	 /**@type {Position}*/pos1,
	 /**@type {Position}*/pos2){return Vec2.sub(pos1,pos2).sqrMag}

	static distance(
	 /**@type {Position}*/pos1,
	 /**@type {Position}*/pos2){return Vec2.sub(pos1,pos2).magnitude}

	/**
	 @private
	 @param {number} x
	 @param {number} y
	*/
	constructor(x, y) {
		this.x = x
		this.y = y
	}
	get vals()       {return /**@type {[x:number,y:number]}*/([this.x,this.y])}
	get hyphenated() {return `${this.x}-${this.y}`}
	get asObj()      {return {x:this.x, y:this.y}}
	get asInt()      {return Vec2.new(this.x|0,this.y|0)}
	get clone()      {return Vec2.new(this.x,  this.y)}
	get normalized() {return Vec2.new(this.x/this.magnitude, this.y/this.magnitude)}
	get magnitude()  {return sqrt(this.sqrMag)}
	get sqrMag()     {return this.x**2 + this.y**2}
	get inverse()    {return this.clone.mul(-1)}

	/**
	 @overload
	 @param   {number} x
	 @param   {number} y
	 @returns {boolean}

	 @overload
	 @param   {Position} pos
	 @returns {boolean}

	 @param {number|Position} v1
	 @param {number} [v2]
	*/
	eq(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
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

	 @param {number|Position} v1
	 @param {number} [v2]
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

	 @param {number|Position} v1
	 @param {number} [v2]
	*/
	add(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
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

	 @param {number|Position} v1
	 @param {number} [v2]
	*/
	sub(v1, v2) {
		const [x,y]= Vec2.#parseXY(v1, v2)
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
	distance(/**@type {Readonly<Position>}*/pos) {
		return Vec2.sub(this,pos).magnitude
	}
	toIdx(/**@type {number}*/cols) {
		return Vec2.idx(this,cols)
	}
	toString() {
		return /**@type {const}*/(`{x:${this.x}, y:${this.y}}`)
	}
	freeze() {
		return freeze(this)
	}
	void(){}
}